import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export function TextArea({
  onChange,
  label,
  id,
  name,
  labelClassName,
  textAreasClassName,
  value,
  isOptional = false,
  optionalLabel = null,
}) {
  const { language } = useLanguage();
  const contentLength = typeof value === "string" && value ? value.length : 0;
  const optionalText =
    optionalLabel ||
    (translations.NewGroupPage &&
      translations.NewGroupPage[language]?.Optional) ||
    (translations.Common && translations.Common[language]?.Optional) ||
    "(optional)";

  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 bg-gray-50/30 dark:bg-gray-800/30">
      <label className={`text-sm mb-2 ${labelClassName}`} htmlFor={id}>
        {label}{" "}
        {isOptional && (
          <span className="text-xs text-gray-400 dark:text-gray-300 italic mx-1">
            {optionalText}
          </span>
        )}
      </label>
      <textarea
        id={id}
        name={name}
        onChange={onChange}
        className={`outline-2 outline-gray-200/50 dark:outline-gray-200/20 dark:focus:outline-cyan-400/50 focus:outline-cyan-600/50 focus:outline-offset-2 transition-all rounded mt-2 p-2 text-sm text-gray-700 resize-none ${textAreasClassName}`}
      ></textarea>
      <span className="text-xs text-gray-400 text-end">
        {contentLength} {contentLength > 1 ? "characters" : "character"}
      </span>
    </div>
  );
}
