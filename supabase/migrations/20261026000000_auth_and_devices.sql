-- Accounts and the device rule (docs/plan.md, "Devices: two registered, one active at a time").
--
-- Supabase Auth owns sign-in (email, Google, Apple, phone OTP) in auth.users. This adds:
--   profiles       one row per account: name, phone, plan, and which session is active right now
--   devices        the account's registered devices, at most 2 not removed
--   device_events  register / takeover / remove history, for the 30-day swap limit and the sharing signal
--
-- The browser never writes devices or the active session directly. It calls the functions at the bottom,
-- which run as the table owner and enforce the rules. Question tables added later should gate reads on
-- public.is_active_session(), so a locked device stops getting questions even if its page is tampered with.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  plan text not null default 'free' check (plan in ('free', 'season', 'bundle', 'monthly')),
  plan_expires_at timestamptz,
  active_device_id uuid,
  active_session_id uuid,
  active_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- A random id the browser or app makes once and keeps (localStorage on the web).
  device_key uuid not null,
  label text not null default 'Unknown device',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  removed_at timestamptz
);
create unique index devices_one_key_per_user on public.devices (user_id, device_key) where removed_at is null;
create index devices_user on public.devices (user_id) where removed_at is null;

alter table public.profiles
  add constraint profiles_active_device_fk foreign key (active_device_id) references public.devices (id) on delete set null;

create table public.device_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id uuid references public.devices (id) on delete set null,
  kind text not null check (kind in ('register', 'takeover', 'remove')),
  created_at timestamptz not null default now()
);
create index device_events_user_kind on public.device_events (user_id, kind, created_at desc);

-- Row level security: students read their own rows and may only change their name.
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.device_events enable row level security;

create policy "Read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Read own devices" on public.devices for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.profiles, public.devices, public.device_events from anon, authenticated;
grant select on public.profiles, public.devices to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- A profile for every new account. Google sends full_name/name; email and phone sign-up pass full_name.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), ''),
    case when coalesce(new.phone, '') = '' then null when new.phone like '+%' then new.phone else '+' || new.phone end
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.phone in step when a phone number is added or verified later.
create function public.handle_user_phone() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles
     set phone = case when coalesce(new.phone, '') = '' then null when new.phone like '+%' then new.phone else '+' || new.phone end,
         updated_at = now()
   where id = new.id;
  return new;
end $$;

create trigger on_auth_user_phone after update of phone on auth.users
  for each row when (old.phone is distinct from new.phone) execute function public.handle_user_phone();

create function public.current_session_id() returns uuid
language sql stable set search_path = '' as $$
  select nullif(auth.jwt() ->> 'session_id', '')::uuid
$$;

-- True when the caller's session is the account's active one. Use it in policies on paid content.
create function public.is_active_session() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.active_session_id = public.current_session_id()
  )
$$;

create function public.device_list(uid uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', d.id, 'label', d.label, 'created_at', d.created_at, 'last_seen_at', d.last_seen_at,
           'active', d.id = p.active_device_id
         ) order by d.created_at), '[]'::jsonb)
    from public.devices d join public.profiles p on p.id = d.user_id
   where d.user_id = uid and d.removed_at is null
$$;

-- Make this device the active one. Registers it first if the account has a free slot.
-- Returns {status: 'active', takeovers_today} or {status: 'device_limit', devices}.
create function public.claim_device(p_device_key uuid, p_label text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  sid uuid := public.current_session_id();
  prof public.profiles;
  dev public.devices;
  n int;
begin
  if uid is null or sid is null then raise exception 'not signed in' using errcode = '28000'; end if;

  select * into prof from public.profiles where id = uid for update;
  if not found then
    insert into public.profiles (id) values (uid) returning * into prof;
  end if;

  select * into dev from public.devices where user_id = uid and device_key = p_device_key and removed_at is null;
  if not found then
    select count(*) into n from public.devices where user_id = uid and removed_at is null;
    if n >= 2 then
      return jsonb_build_object('status', 'device_limit', 'devices', public.device_list(uid));
    end if;
    insert into public.devices (user_id, device_key, label)
    values (uid, p_device_key, left(coalesce(nullif(trim(p_label), ''), 'Unknown device'), 80))
    returning * into dev;
    insert into public.device_events (user_id, device_id, kind) values (uid, dev.id, 'register');
  else
    update public.devices set last_seen_at = now(), label = left(coalesce(nullif(trim(p_label), ''), label), 80)
     where id = dev.id;
  end if;

  if prof.active_device_id is not null and prof.active_device_id <> dev.id then
    insert into public.device_events (user_id, device_id, kind) values (uid, dev.id, 'takeover');
  end if;

  update public.profiles
     set active_device_id = dev.id, active_session_id = sid,
         active_since = case when active_session_id is distinct from sid then now() else active_since end,
         updated_at = now()
   where id = uid;

  select count(*) into n from public.device_events
   where user_id = uid and kind = 'takeover' and created_at > now() - interval '1 day';
  return jsonb_build_object('status', 'active', 'takeovers_today', n);
end $$;

-- The 30-second check-in. Returns {status: 'active'} for the active session, otherwise
-- {status: 'locked', active_label} when another device holds the account, or {status: 'idle'} when none does.
create function public.check_device(p_device_key uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  prof public.profiles;
  label text;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  select * into prof from public.profiles where id = uid;

  update public.devices set last_seen_at = now()
   where user_id = uid and device_key = p_device_key and removed_at is null;

  if prof.active_session_id is not null and prof.active_session_id = public.current_session_id() then
    return jsonb_build_object('status', 'active');
  end if;
  if prof.active_device_id is null then
    return jsonb_build_object('status', 'idle');
  end if;
  select d.label into label from public.devices d where d.id = prof.active_device_id;
  return jsonb_build_object('status', 'locked', 'active_label', label);
end $$;

-- Remove a registered device to free its slot. Allowed once every 30 days; after that, support does it.
create function public.remove_device(p_device_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  last_removal timestamptz;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if not exists (select 1 from public.devices where id = p_device_id and user_id = uid and removed_at is null) then
    return jsonb_build_object('status', 'not_found');
  end if;

  select max(created_at) into last_removal from public.device_events where user_id = uid and kind = 'remove';
  if last_removal is not null and last_removal > now() - interval '30 days' then
    return jsonb_build_object('status', 'swap_limit', 'next_allowed_at', last_removal + interval '30 days');
  end if;

  update public.devices set removed_at = now() where id = p_device_id;
  update public.profiles set active_device_id = null, active_session_id = null, updated_at = now()
   where id = uid and active_device_id = p_device_id;
  insert into public.device_events (user_id, device_id, kind) values (uid, p_device_id, 'remove');
  return jsonb_build_object('status', 'removed', 'devices', public.device_list(uid));
end $$;

-- On sign-out, give up the active slot so the other device can take over without a prompt.
create function public.release_device() returns void
language sql security definer set search_path = '' as $$
  update public.profiles set active_device_id = null, active_session_id = null, updated_at = now()
   where id = auth.uid() and active_session_id = public.current_session_id()
$$;

create function public.my_devices() returns jsonb
language sql stable security definer set search_path = '' as $$
  select public.device_list(auth.uid())
$$;

revoke execute on function public.handle_new_user(), public.handle_user_phone(), public.device_list(uuid) from public, anon, authenticated;
revoke execute on function public.claim_device(uuid, text), public.check_device(uuid), public.remove_device(uuid),
  public.release_device(), public.my_devices(), public.is_active_session(), public.current_session_id() from public, anon;
grant execute on function public.claim_device(uuid, text), public.check_device(uuid), public.remove_device(uuid),
  public.release_device(), public.my_devices(), public.is_active_session(), public.current_session_id() to authenticated;
