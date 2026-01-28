import { useSocket } from "../../contexts/SocketContext";

export function ChatsListHeader() {
  const { isConnected } = useSocket();
  return (
    <header className="col-start-1 col-end-3 row-start-1 row-end-2 bg-white shadow-sm">
      <nav className="flex items-center justify-between gap-x-4 px-4 h-16">
        <div className="flex items-center gap-x-3">
          <img className="w-10 h-10" src="/GoChat_logo.png" alt="GoChat logo" />
          <div>
            <div className="text-lg font-semibold text-cyan-800">GoChat</div>
            <div className="text-xs text-gray-400">{isConnected ? "Online" : "Connecting..."}</div>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <button className="px-3 py-1 bg-cyan-700 text-white rounded-md text-sm">New Chat</button>
        </div>
      </nav>
    </header>
  );
}
