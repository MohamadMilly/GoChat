import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export function InputField({
  id,
  label,
  type,
  onChange,
  value,
  labelClassName = "text-gray-700",
  inputClassName = "outline-2 outline-cyan-600/50 focus:outline-offset-1 focus:outline-cyan-600 rounded-full",
  name,
  isOptional = false,
}) {
  const { language } = useLanguage();
  return (
    <div className="flex flex-col px-4 py-1.5 my-4 gap-2">
      <label className={`text-sm ${labelClassName}`} htmlFor={id}>
        {label}{" "}
        {isOptional && (
          <span className="text-xs text-gray-400 italic mx-1">
            {translations.Common[language].Optional}
          </span>
        )}
      </label>
      <input
        className={`px-4 py-1.5  text-sm ${inputClassName}`}
        id={id}
        name={name}
        type={type}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
