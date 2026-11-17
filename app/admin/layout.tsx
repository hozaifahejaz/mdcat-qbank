import Nav from "@/components/Nav";

/* In-place page changes inside the admin panel (components/Nav.tsx). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Nav />
    </>
  );
}
