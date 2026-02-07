export function TextArea({
  onChange,
  label,
  id,
  name,
  labelClassName,
  textAreasClassName,
  value,
  isOptional = false,
}) {
  const contentLength = typeof value === "string" && value ? value.length : 0;
  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 bg-gray-50/30">
      <label className={`text-sm mb-2 ${labelClassName}`} htmlFor={id}>
        {label}{" "}
        {isOptional && (
          <span className="text-xs text-gray-400 italic mx-1">(optional)</span>
        )}
      </label>
      <textarea
        id={id}
        name={name}
        onChange={onChange}
        className={`outline-2 outline-gray-200/50 focus:outline-cyan-600/50 focus:outline-offset-2 transition-all rounded mt-2 p-2 text-sm text-gray-700 resize-none ${textAreasClassName}`}
      ></textarea>
      <span className="text-xs text-gray-400 text-end">
        {contentLength} {contentLength > 1 ? "characters" : "character"}
      </span>
    </div>
  );
}
