import { useEffect, useState } from "react";
import { Switch, SwitchThumb } from "@radix-ui/react-switch";
import "./themeSwitch.css";

type Theme = "light" | "dark";

const ThemeSwitch = () => {
  const getCurrentTheme = (): Theme => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme !== "light" && storedTheme !== "dark") {
      return systemTheme;
    }
    return storedTheme;
  };
  const [theme, setTheme] = useState<Theme>(getCurrentTheme);

  const onThemeChange = (checked: boolean) => {
    const newTheme: Theme = checked ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Switch aria-label="Toggle theme" className="SwitchRoot" checked={theme === "dark"} onCheckedChange={onThemeChange}>
      <SwitchThumb className="SwitchThumb" />
    </Switch>
  );
};

export default ThemeSwitch;
