import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ThemeSwitch from "../themeSwitch/ThemeSwitch";
import "./rootLayout.css";

const navLinks = [
  { to: "/", label: "Home", key: "home", exact: true },
  { to: "/buckets", label: "Buckets", key: "buckets", exact: false },
] as const;

const footerDate = () => {
  const d = new Date();
  return {
    iso: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
};

const RootLayout = () => {
  const { iso, label } = footerDate();

  return (
  <div className="root-layout">
    <header className="root-header ui-glass">
      <div className="top-nav">
        <div className="app-title">Savings Visualiser</div>
        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              aria-label={link.label}
              activeOptions={link.exact ? { exact: true } : undefined}
              className="nav-link ui-focus-ring"
              activeProps={{ className: "nav-link nav-link-active ui-focus-ring" }}
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
    <footer className="root-footer">
      <div className="root-footer-inner">
        <div className="root-footer-lead">
          <span className="root-footer-title">{"\u2009"}Savings Visualiser</span>
        </div>
        <time className="root-footer-date" dateTime={iso}>
          {label}
        </time>
      </div>
    </footer>
    <TanStackRouterDevtools />
  </div>
  );
};

export default RootLayout;
