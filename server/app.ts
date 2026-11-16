import { banks } from "../lib/banks";
import { paper, site } from "../lib/site";
import type { Env } from "./env";
import { json } from "./http";
import { requireSession } from "./session";

/* What the Android app needs from the server besides the student's own data: which app versions still work, a few
   switches, and the banks with their subjects and chapters (the website builds these in; the app fetches them so a
   syllabus change needs no app update). */

type Ctx = { env: Env; db: D1Database; request: Request };

/* At most this many questions from offline packs on an account's phones at once, and how long a pack lasts
   between check-ins. server/offline.ts enforces both. */
export const OFFLINE_MAX = 300;
export const OFFLINE_LEASE_DAYS = 7;
export const offlineEnabled = (env: Env) => env.OFFLINE_ENABLED === "1";

const int = (v: string | undefined, fallback: number) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : fallback);

export const appRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "GET /api/app/config": async ({ env }) => {
    const minVersion = int(env.APP_MIN_VERSION, 1);
    return json({
      minVersion,
      latestVersion: Math.max(minVersion, int(env.APP_LATEST_VERSION, 1)),
      checkinSeconds: 60,
      examDate: site.examDate,
      paper: paper.map((p) => ({ subject: p.subject, count: p.count })),
      offline: { enabled: offlineEnabled(env), maxQuestions: OFFLINE_MAX, leaseDays: OFFLINE_LEASE_DAYS },
      integrity: { cloudProjectNumber: env.PLAY_CLOUD_PROJECT_NUMBER ? Number(env.PLAY_CLOUD_PROJECT_NUMBER) : null },
      support: { email: site.supportEmail, whatsapp: site.whatsapp, site: site.url },
    });
  },

  "GET /api/study/banks": async ({ db, request }) => {
    await requireSession(db, request);
    return json(banks.map((b) => ({ id: b.id, name: b.name, short: b.short, blurb: b.blurb, subjects: b.subjects.map((s) => ({ name: s.name, chapters: s.chapters })) })));
  },
};
