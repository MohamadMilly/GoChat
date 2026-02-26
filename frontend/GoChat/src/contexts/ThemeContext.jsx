import { useEffect } from "react";
import { useState } from "react";
import { createContext, useContext } from "react";

const ThemeContext = createContext({ theme: "dark" });

const storedTheme = localStorage.getItem("theme");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(storedTheme || "light");
  const handleSetTheme = (theme) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
  };
  useEffect(() => {
    console.log("theme set");
    document.documentElement.classList = theme;
  }, [theme]);
  return (
    <ThemeContext value={{ theme, handleSetTheme }}>{children}</ThemeContext>
  );
}

export const useTheme = () => useContext(ThemeContext);
