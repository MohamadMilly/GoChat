import { useLanguage } from "../../contexts/LanguageContext";
import translations from "../../translations";

export function ToggleInput({ value, onChange, disabled }) {
  const { language } = useLanguage();
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={value}
        onChange={onChange}
        disabled={disabled}
      />

      <div
        className="relative w-9 h-5 bg-gray-300 rounded-full peer-focus:ring-4 peer-focus:ring-cyan-300 
                  dark:bg-gray-700 dark:peer-focus:ring-cyan-800
                  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5
                  after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                  peer-checked:bg-cyan-600 dark:peer-checked:bg-cyan-400"
      ></div>

      <span className="ms-3 text-xs text-gray-600 dark:text-gray-300">
        {value
          ? translations.Common[language].Enabled
          : translations.Common[language].Disabled}
      </span>
    </label>
  );
}
