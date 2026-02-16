import { useLocation, useNavigate } from "react-router";
import Button from "../ui/Button";
import { ArrowBigLeft } from "lucide-react";

export function ChatHeaderLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGroup = location.pathname.includes("group");
  return (
    <header className="sticky top-0 z-20 border-b-2 border-gray-100 px-4 py-2 shadow-lg bg-white flex items-center gap-2">
      <Button
        onClick={() => navigate("/chats", { viewTransition: true })}
        className={"text-gray-600 md:hidden"}
      >
        <p className="sr-only">Go Back</p>
        <ArrowBigLeft size={18} />
      </Button>
      <div className={"flex items-center gap-x-2"}>
        <div className="w-[48px] h-[48px] bg-gray-200 animate-pulse rounded-full"></div>
        <div className="flex flex-col justify-center items-start gap-1.5">
          <p className="w-20 p-2 bg-gray-200 animate-pulse rounded"></p>
          {isGroup ? (
            <div className="flex items-center text-xs text-gray-700">
              <div className="flex items-center">
                <span className="inline-block p-1.5 rounded bg-gray-200 animate-pulse mr-1"></span>
                <span>members</span>
              </div>
              <span className="mx-1">|</span>
              <div className="flex items-center">
                <span
                  className="
                inline-block p-1.5 rounded bg-gray-200 animate-pulse mr-1"
                ></span>
                <span>Online</span>
              </div>
            </div>
          ) : (
            <span className="inline-block w-15 p-1.5 rounded bg-gray-200 animate-pulse mr-1"></span>
          )}
        </div>
      </div>
    </header>
  );
}
