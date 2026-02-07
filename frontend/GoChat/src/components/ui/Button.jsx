export default function Button({
  children,
  onClick,
  className,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-md shadow-xs cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
