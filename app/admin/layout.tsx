import Nav from "@/components/Nav";
import { AdminLayout } from "@/components/admin/AdminFrame";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";

/* Every admin page shares one frame, and moves between them happen in place (components/Nav.tsx). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      <Nav />
    </>
  );
}
