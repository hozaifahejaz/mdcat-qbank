import type { Metadata } from "next";
import { UsersPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Users and plans · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <UsersPage />;
}
