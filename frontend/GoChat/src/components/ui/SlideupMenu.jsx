import { X } from "lucide-react";

export function SlideUpMenu({ children, isVisible, setIsVisible }) {
  return (
    <div
      className={`absolute left-6 bottom-0 -translate-y-1/2 p-4 w-80 bg-white rounded-lg ${isVisible ? "block animate-slideup" : "hidden animate-slidedown"}`}
    >
      <button
        type="button"
        className="block ml-auto w-6 h-6 text-gray-500/60 rounded-full hover:bg-gray-200 hover:text-gray-500 cursor-pointer"
        onClick={() => setIsVisible(false)}
      >
        <X className="m-auto" size={20} />
      </button>
      {children}
    </div>
  );
}
