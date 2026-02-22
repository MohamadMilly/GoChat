import { Outlet } from "react-router";

import { ChatsListHeader } from "../components/chatList/ChatsListHeader";
import { ChatsPanel } from "../components/chatList/ChatsPanel";
import { SideDrawer } from "../components/ui/SideDrawer";
import { createContext, useState } from "react";

const storedChatsPanelStatus = JSON.parse(
  localStorage.getItem("isChatsPanelCollapsed"),
);

export const ChatsListContext = createContext(null);

export function ChatsListPage() {
  const [isChatsPanelCollapsed, setIsChatsPanelCollapsed] = useState(
    storedChatsPanelStatus,
  );
  const handleChatsPanelCollapse = (value) => {
    setIsChatsPanelCollapsed(value);
    localStorage.setItem("isChatsPanelCollapsed", value);
  };
  return (
    <ChatsListContext
      value={{ isChatsPanelCollapsed, handleChatsPanelCollapse }}
    >
      <div className="flex flex-col h-screen">
        <SideDrawer />
        <ChatsListHeader />
        <main
          className={`flex-1 md:grid  ${isChatsPanelCollapsed ? "md:grid-cols-[1fr]" : "md:grid-cols-[350px_1fr]"} h-[calc(100vh-64px)]`}
        >
          <ChatsPanel />
          <Outlet />
        </main>
      </div>
    </ChatsListContext>
  );
}
