import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ThemeSwitch from "../themeSwitch/ThemeSwitch";
import "./rootLayout.css";

const navLinks = [
  { to: "/", label: "Home", key: "home" },
  { to: "/about", label: "About", key: "about" },
];

const RootLayout = () => (
  <div>
    <header className="top-nav">
      <nav className="nav-links" aria-label="Primary">
        {navLinks.map((link) => (
          <Link
            key={link.key}
            to={link.to}
            aria-label={link.label}
            className="nav-link"
            activeProps={{ className: "nav-link-active" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="nav-actions">
        <ThemeSwitch />
      </span>
    </header>
    <main>
      <Outlet />
    </main>
    <TanStackRouterDevtools />
  </div>
);

export default RootLayout;
