import { Switch, SwitchThumb } from "@radix-ui/react-switch";
import "./themeSwitch.css";
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

const ThemeSwitch = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("ThemeContext not found");
  }
  const { theme, setTheme } = themeContext;

  const onThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Switch
      aria-label="Toggle theme"
      className="switch ui-focus-ring"
      checked={theme === "dark"}
      onCheckedChange={onThemeChange}
    >
      <SwitchThumb className="thumb" />
    </Switch>
  );
};

export default ThemeSwitch;
