import { NavLink, Outlet } from "react-router";

import { ChatsListHeader } from "../components/chatList/ChatsListHeader";
import { ChatsPanel } from "../components/chatList/ChatsPanel";
import { SideDrawer } from "../components/ui/SideDrawer";

export function ChatsListPage() {
  return (
    <div className="grid grid-rows-[64px_1fr] grid-cols-[350px_1fr] h-screen">
      <SideDrawer />
      <ChatsListHeader />
      <main className="col-span-2 row-start-2 grid grid-cols-[350px_1fr] h-[calc(100vh-64px)]">
        <ChatsPanel />
        <section className="flex flex-col col-start-2 col-end-3 row-start-1 row-end-2 overflow-y-auto scrollbar-custom">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
