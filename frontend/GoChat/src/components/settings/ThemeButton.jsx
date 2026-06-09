import { useTheme } from "../../contexts/ThemeContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "../ui/Button";
import { Palette } from "lucide-react";

const PageTranslations = translations["settings"];

export function ThemeButton() {
  const { theme, handleSetTheme } = useTheme();
  const { language } = useLanguage();
  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    handleSetTheme(nextTheme);
  };
  return (
    <Button
      onClick={handleToggleTheme}
      className={
        "text-sm py-2 w-full text-start my-2 flex items-center justify-between dark:text-gray-100  text-gray-500 border border-dashed border-gray-200 dark:border-gray-700"
      }
    >
      {" "}
      <div className="flex items-center gap-2">
        <Palette size={18} />
        <span>{PageTranslations[language].ThemeLabel}</span>
      </div>
      <span>{PageTranslations[language].ThemeNames[theme] ?? theme}</span>
    </Button>
  );
}
