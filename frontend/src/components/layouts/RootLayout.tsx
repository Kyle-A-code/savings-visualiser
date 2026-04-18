import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ThemeSwitch from "../themeSwitch/ThemeSwitch";
import "./rootLayout.css";

const navLinks = [
  { to: "/", label: "Home", key: "home", exact: true },
  { to: "/buckets", label: "Buckets", key: "buckets", exact: false },
] as const;

const RootLayout = () => (
  <div className="root-layout">
    <header className="root-header">
      <div className="top-nav">
        <div className="app-title">Working Title</div>
        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              aria-label={link.label}
              activeOptions={link.exact ? { exact: true } : undefined}
              className="nav-link"
              activeProps={{ className: "nav-link-active" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeSwitch />
        </div>
      </div>
    </header>
    <main className="root-main">
      <Outlet />
    </main>
    <TanStackRouterDevtools />
  </div>
);

export default RootLayout;
