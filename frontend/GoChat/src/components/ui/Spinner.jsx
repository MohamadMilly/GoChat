import { LoaderCircle } from "lucide-react";

export function Spinner({ className, size }) {
  return <LoaderCircle size={size} className={`${className} animate-spin`} />;
}
