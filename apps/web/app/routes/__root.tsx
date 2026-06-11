import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div dir="rtl" lang="ar">
      <nav style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid #eef0f4",
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      }}>
        <Link
          to="/"
          style={{ fontWeight: 700, color: "#0f3460", fontSize: "1.1rem", textDecoration: "none" }}
          activeProps={{ style: { fontWeight: 700, color: "#e94560", fontSize: "1.1rem", textDecoration: "none" } }}
        >
          ألفا بيتا
        </Link>
        <Link to="/about"      activeProps={{ style: { fontWeight: "bold" } }}>من نحن</Link>
        <Link to="/services"   activeProps={{ style: { fontWeight: "bold" } }}>خدماتنا</Link>
        <Link to="/industries" activeProps={{ style: { fontWeight: "bold" } }}>القطاعات</Link>
        <Link to="/software"   activeProps={{ style: { fontWeight: "bold" } }}>البرمجيات</Link>
        <Link to="/clients"    activeProps={{ style: { fontWeight: "bold" } }}>عملاؤنا</Link>
        <Link to="/partners"   activeProps={{ style: { fontWeight: "bold" } }}>شركاؤنا</Link>
        <Link to="/success-stories" activeProps={{ style: { fontWeight: "bold" } }}>قصص النجاح</Link>
        <Link to="/testimonials"    activeProps={{ style: { fontWeight: "bold" } }}>آراء العملاء</Link>
        <Link to="/support"    activeProps={{ style: { fontWeight: "bold" } }}>الدعم</Link>
        <Link to="/downloads"  activeProps={{ style: { fontWeight: "bold" } }}>التحميلات</Link>
        <Link to="/contact"    activeProps={{ style: { fontWeight: "bold" } }}>تواصل معنا</Link>
      </nav>
      <Outlet />
    </div>
  );
}
