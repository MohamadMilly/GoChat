import { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";
import { createContext, useContext } from "react";

const ThemeContext = createContext({ theme: "dark" });

const storedTheme = localStorage.getItem("theme");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(storedTheme || "light");
  const handleSetTheme = useCallback((theme) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
  }, []);
  useEffect(() => {
    document.documentElement.classList = theme;
  }, [theme]);

  const themeContextValue = useMemo(
    () => ({ theme, handleSetTheme }),
    [theme, handleSetTheme],
  );
  return <ThemeContext value={themeContextValue}>{children}</ThemeContext>;
}

export const useTheme = () => useContext(ThemeContext);
