import { useLocation } from "react-router";

export function MessagesListLoading() {
  const location = useLocation();
  const isGroup = location.pathname.includes("group");
  return (
    <ul className="p-1 h-full z-10 scrollbar-custom">
      <li
        className={`my-1 flex items-end gap-1 animate-pop ${isGroup ? "pl-12" : ""}`}
      >
        <div
          className={`relative animate-pulse w-100 h-60 max-w-5/6 md:max-w-3/4 px-2 bg-gray-200/70 py-1 rounded-t-xl rounded-bl-none rounded-br-xl`}
        ></div>
      </li>
      <li className={`my-1 flex items-end gap-1 animate-pop`}>
        {isGroup && (
          <div className="shrink-0">
            <div className="w-[48px] h-[48px] bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        )}
        <div
          className={`relative animate-pulse w-50 h-20 max-w-5/6 md:max-w-3/4 px-2 bg-gray-200/70 py-1 rounded-t-xl rounded-bl-none rounded-br-xl`}
        ></div>
      </li>
      <li className={`my-1 flex items-end gap-1 animate-pop`}>
        <div
          className={`relative animate-pulse w-120 h-30 max-w-5/6 md:max-w-3/4 px-2 bg-cyan-800/70 py-1 ml-auto rounded-br-none rounded-t-xl rounded-bl-xl`}
        ></div>
      </li>
      <li className={`my-1 flex items-end gap-1 animate-pop`}>
        <div
          className={`relative animate-pulse w-30 h-15 max-w-5/6 md:max-w-3/4 px-2 bg-cyan-800/70 py-1 ml-auto rounded-br-none rounded-t-xl rounded-bl-xl`}
        ></div>
      </li>
    </ul>
  );
}

// ${isMyMessage ? "bg-cyan-700 ml-auto rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 text-gray-600 rounded-bl-none rounded-br-xl"}
/*

{isGroup && (
          <div className="shrink-0">
            <div className="w-[48px] h-[48px] bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        )}
*/
