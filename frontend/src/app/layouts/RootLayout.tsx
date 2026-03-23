import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ThemeSwitch from "../../components/themeSwitch/ThemeSwitch";

const RootLayout = () => (
  <>
    <nav>
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
    </nav>
    <ThemeSwitch />
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export default RootLayout;
