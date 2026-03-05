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
      className={`text-xs ${darkModeTextColor} ${darkModeBgColor} border ${textColor} ${bgColor} px-1 py-0.5 rounded-full ${className}`}
    >
      {tagContent}
    </span>
  );
}

export default Tag;
