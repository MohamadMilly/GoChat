import translations from "../../translations";
const PageTranslations = translations["settings"];
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "../ui/Button";
import { Languages } from "lucide-react";

export function LanguageButton() {
  const { language, handleLanguageSet } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        className={
          "text-sm py-2 w-full text-start my-2 flex items-center justify-between dark:text-gray-100 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700"
        }
      >
        <div className="flex items-center gap-2">
          <Languages size={18} />
          <span>{PageTranslations[language].LanguageLabel}</span>
        </div>

        <span className="text-sm">{language}</span>
      </Button>
      {open && (
        <div className="absolute top-2 right-4 z-10 p-2 rounded bg-gray-50 shadow dark:bg-gray-700">
          <button
            onClick={() => {
              handleLanguageSet("Arabic");
              setOpen(false);
            }}
            className="w-full text-start text-sm dark:text-gray-200 text-gray-400 dark:hover:bg-gray-600/30 hover:bg-gray-100 cursor-pointer p-1 rounded"
          >
            {PageTranslations[language].OptionArabic}
          </button>
          <button
            onClick={() => {
              handleLanguageSet("English");
              setOpen(false);
            }}
            className="w-full text-start text-sm dark:text-gray-200 text-gray-400 dark:hover:bg-gray-600/30 hover:bg-gray-100 p-1 rounded  cursor-pointer"
          >
            {PageTranslations[language].OptionEnglish}
          </button>
        </div>
      )}
    </div>
  );
}
