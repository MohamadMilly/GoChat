import { X } from "lucide-react";

export function SlideUpMenu({
  children,
  isVisible,
  setIsVisible,
  istogglable = true,
  width = "250px",
}) {
  return (
    <div
      className={`absolute left-6 bottom-2 -translate-y-1/2 p-4 w-[var(--width)] bg-white dark:bg-gray-800 rounded-lg ${isVisible ? "block animate-slideup" : "hidden animate-slidedown"}`}
      style={{ "--width": width }}
    >
      {istogglable && (
        <button
          type="button"
          className="block ml-auto w-6 h-6 text-gray-600/60 dark:text-gray-200/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600/15 hover:text-gray-600 dark:hover:text-gray-100 cursor-pointer"
          onClick={() => setIsVisible(false)}
        >
          <X className="m-auto" size={20} />
        </button>
      )}
      {children}
    </div>
  );
}
