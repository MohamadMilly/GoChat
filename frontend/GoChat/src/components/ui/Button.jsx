export default function Button({
  children,
  onClick,
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-sm text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md shadow-xs cursor-pointer bg-white dark:bg-gray-700/50 ${className}`}
      {...props}
    > 
      {children}
    </button>
  );
}
