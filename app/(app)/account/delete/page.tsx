import type { Metadata } from "next";
import DeleteAccount from "@/components/auth/DeleteAccount";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Delete your account · ${site.name}`, robots: { index: false } };

/* Also the "delete your account" link the Play Store listing points to: signed-out visitors sign in first. */
export default function DeleteAccountPage() {
  return <DeleteAccount />;
}
