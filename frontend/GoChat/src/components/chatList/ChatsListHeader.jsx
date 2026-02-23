import { Menu } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { Link } from "../ui/Link";
export function ChatsListHeader() {
  const { isConnected } = useSocket();
  return (
    <header className="col-start-1 col-end-3 row-start-1 row-end-2 bg-gray-50 shadow-xs">
      <nav className="flex items-center justify-between gap-x-4 px-4 h-16">
        <div className="flex items-center gap-x-3">
          <img className="w-10 h-10" src="/GoChat_logo.png" alt="GoChat logo" />
          <div>
            <div
              className="text-lg font-semibold tracking-tight font-rupik
             text-cyan-600"
            >
              GoChat
            </div>
            <div className="text-xs text-gray-400">
              {isConnected ? "Online" : "Connecting..."}
            </div>
          </div>
        </div>
        <button
          command="show-modal"
          commandfor="drawer"
          className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-cyan-600 inset-ring inset-ring-cyan-600/20 hover:bg-white/20 cursor-pointer"
        >
          <Menu />
        </button>
      </nav>
    </header>
  );
}
