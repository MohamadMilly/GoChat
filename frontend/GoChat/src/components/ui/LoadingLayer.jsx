import { Spinner } from "./Spinner";

export function LoadingLayer({ title, className }) {
  return (
    <div
      className={`absolute z-9000 inset-0 backdrop-blur-sm bg-gray-800/60 flex justify-center items-center gap-2 flex-col ${className}`}
    >
      <Spinner className={"text-cyan-600 dark:text-cyan-400"} size={24} />
      <span className="text-gray-200">{title}</span>
    </div>
  );
}
