import { AppLayout } from "@/components/app/AppShell";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";

/* Every signed-in student page shares this one frame (sidebar, phone tab bar) and one sign-in and device check, so
   moving between pages only swaps the middle of the screen. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
