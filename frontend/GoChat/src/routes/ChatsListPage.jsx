import { NavLink, Outlet } from "react-router";

import { ChatsListHeader } from "../components/chatListComponents/ChatsListHeader";
import { ChatsPanel } from "../components/chatListComponents/ChatsPanel";

export function ChatsListPage() {
  return (
    <div className="grid grid-rows-[64px_1fr] grid-cols-[350px_1fr] h-screen">
      <ChatsListHeader />
      <main className="col-span-2 row-start-2 grid-cols-subgrid grid-rows-subgrid grid">
        <ChatsPanel />
        <section className="col-start-2 col-end-3 row-start-1 row-end-2">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
