import { NavLink, Outlet } from "react-router";

import { ChatsListHeader } from "../components/chatList/ChatsListHeader";
import { ChatsPanel } from "../components/chatList/ChatsPanel";
import { SideDrawer } from "../components/ui/SideDrawer";

export function ChatsListPage() {
  return (
    <div className="flex flex-col h-screen">
      <SideDrawer />
      <ChatsListHeader />
      <main className="flex-1 md:grid md:grid-cols-[350px_1fr] h-[calc(100vh-64px)]">
        <ChatsPanel />
        <Outlet />
      </main>
    </div>
  );
}
