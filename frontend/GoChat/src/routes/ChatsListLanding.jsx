import { CirclePlus, MessagesSquare } from "lucide-react";
import { Link } from "../components/ui/Link";

export function ChatsListLanding() {
  return (
    <div className="h-full flex flex-col justify-center gap-2 items-center relative">
      <div className="text-cyan-600">
        <MessagesSquare strokeWidth={1} size={120} />
      </div>

      <h3 className="text-lg tracking-tight text-gray-700">
        Here is your place of endless chating !
      </h3>
      <p
        className="text-sm text-gray-400
      "
      >
        Start by opening a chat from the chats left panel or , create a new one
        !
      </p>

      <Link
        route={"/chats/direct/new"}
        className="rounded-full text-cyan-600 absolute right-1/6 bottom-1/6"
      >
        <CirclePlus />
      </Link>
    </div>
  );
}
