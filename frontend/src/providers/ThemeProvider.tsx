import { useEffect, useState } from "react";
import ThemeContext, { type Theme } from "../context/ThemeContext";


const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const getCurrentTheme = (): Theme => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme !== "light" && storedTheme !== "dark") {
      return systemTheme;
    }
    return storedTheme;
  };

  const [theme, setTheme] = useState<Theme>(getCurrentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
