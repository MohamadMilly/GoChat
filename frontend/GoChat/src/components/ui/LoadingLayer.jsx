import { Spinner } from "./Spinner";

export function LoadingLayer({ title, className }) {
  return (
    <div
      className={`absolute z-9000 inset-0 backdrop-blur-sm dark:bg-gray-800/60 bg-gray-300/20 flex justify-center items-center gap-2 flex-col ${className}`}
    >
      <Spinner className={"text-cyan-600 dark:text-cyan-400"} size={24} />
      <span className="dark:text-gray-200 text-gray-600">{title}</span>
    </div>
  );
}
