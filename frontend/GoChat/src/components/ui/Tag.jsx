export function Tag({
  bgColor = "bg-gray-200",
  textColor = "text-gray-800",
  tagContent = "",
  darkModeBgColor = "dark:bg-gray-700/50",
  darkModeTextColor = "dark:text-gray-200",
  className = "",
}) {
  return (
    <span
      className={`text-xs ${darkModeTextColor} ${darkModeBgColor}  ${textColor} ${bgColor} rounded p-0.5 ${className}`}
    >
      {tagContent}
    </span>
  );
}

export default Tag;
