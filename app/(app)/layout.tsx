import Nav from "@/components/Nav";
import { AppLayout } from "@/components/app/AppShell";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";

/* Every signed-in student page shares this one frame (sidebar, phone tab bar) and one sign-in and device check, so
   moving between pages only swaps the middle of the screen. Nav (in-place page changes and fetching ahead) lives here
   and in the admin layout, not the root one, so the landing and sign-in pages don't download it. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout>{children}</AppLayout>
      <Nav />
    </>
  );
}
