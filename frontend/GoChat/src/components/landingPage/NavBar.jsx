import { NavLink } from "react-router";
import Button from "../ui/Button";
import { Link } from "../ui/Link";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function NavBar() {
  const { language } = useLanguage();
  const { theme, handleSetTheme } = useTheme();
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    handleSetTheme(nextTheme);
  };
  const t = translations.Landing.NavBar;
  return (
    <nav className="flex px-4 justify-between items-center bg-white dark:bg-gray-900/20 backdrop-blur-xs sticky left-0 right-0 top-0 z-10 border-b-2 dark:border-gray-800 border-gray-100">
      <div className="flex justify-center items-center">
        <img
          className="w-auto h-16 rounded-full dark:brightness-150"
          src="./GoChat_logo.png"
          alt="GoChat logo"
        />
      </div>
      <div className="flex items-center gap-2">
        <Link
          className={"bg-cyan-600 text-gray-800 rounded text-xs md:text-base"}
          route={"/auth/login"}
        >
          {t[language].Login}
        </Link>
        <Link
          className={"bg-cyan-600 text-gray-800 rounded text-xs md:text-base"}
          route={"/auth/signup"}
        >
          {t[language].Signup}
        </Link>
        <Button onClick={toggleTheme}>
          {theme === "dark" ? <Moon /> : <Sun />}
        </Button>
      </div>
    </nav>
  );
}
