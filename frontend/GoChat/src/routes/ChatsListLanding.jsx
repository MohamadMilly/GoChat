import { CirclePlus, MessagesSquare } from "lucide-react";
import { Link } from "../components/ui/Link";

export function ChatsListLanding() {
  return (
    <div className="h-full md:flex flex-col justify-center gap-2 items-center relative hidden z-10 dark:bg-gray-800">
      <div className="text-cyan-600 dark:text-cyan-400">
        <MessagesSquare strokeWidth={1} size={120} />
      </div>

      <h3 className="text-lg tracking-tight text-gray-700 dark:text-gray-100">
        Here is your place of endless chating !
      </h3>
      <p
        className="text-sm text-gray-400 dark:text-gray-200
      "
      >
        Start by opening a chat from the chats left panel or , create a new one
        !
      </p>

      <Link
        route={"/chats/direct/new"}
        className="flex justify-center items-center rounded-full dark:bg-gray-800 shadow-inner shadow-gray-400/20 aspect-square text-cyan-600 dark:text-cyan-400 absolute right-1/6 bottom-1/6"
      >
        <CirclePlus />
      </Link>
    </div>
  );
}
