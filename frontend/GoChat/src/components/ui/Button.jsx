export default function Button({
  children,
  onClick,
  className,
  type = "button",
  disabled,
}) {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-md shadow-xs cursor-pointer bg-white dark:bg-gray-700/50 ${className}`}
    >
      {children}
    </button>
  );
}
