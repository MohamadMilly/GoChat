import { useState } from "react";
import { Avatar } from "./Avatar";
import { NavLink } from "react-router";
import { TransitionLink } from "../ui/TransitionLink";

export function ChatBubble({
  content,
  sender,
  isEdited,
  createdAt,
  editedAt,
  isGroupMessage,
  isMyMessage,
}) {
  const [isDateShown, setIsDateShown] = useState(false);
  const toggleIsDateShown = () => {
    setIsDateShown((prev) => !prev);
  };
  const [transitionId, setTransitionId] = useState(null);

  const fullname = sender.firstname + " " + sender.lastname;

  const isThereAvatar = !!sender.profile?.avatar;
  const avatar = isThereAvatar && sender.profile?.avatar;
  const color = sender?.accountColor || "";
  return (
    <li className="my-1 flex items-center gap-2">
      {isGroupMessage && !isMyMessage && (
        <TransitionLink
          route={`/users/${sender.id}`}
          setDynamicTransitionId={setTransitionId}
        >
          <Avatar
            avatar={avatar}
            chatTitle={fullname}
            color={color}
            dynamicTransitionId={transitionId}
          />
        </TransitionLink>
      )}
      <div
        className={`w-fit max-w-3/4 px-2 py-1 font-rubik rounded-t-xl ${isMyMessage ? "bg-cyan-700 ml-auto rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 text-gray-600 rounded-bl-none rounded-br-xl"}`}
        onClick={toggleIsDateShown}
      >
        <div className="flex flex-col">
          {isGroupMessage && !isMyMessage && (
            <p
              className={`${color ? "text-[var(--color)]" : "text-gray-800"} mb-0.5 font-medium `}
              style={{ "--color": color }}
            >
              {fullname}
            </p>
          )}
          <p className="wrap-break-word whitespace-pre-wrap" dir="auto">
            {content}
          </p>
        </div>
        {isEdited && (
          <span
            className={`text-xs block ${isMyMessage ? "text-white text-right" : "text-gray-500"}`}
          >
            edited
          </span>
        )}
      </div>
      {isDateShown && (
        <div>
          <span className="text-xs">{createdAt}</span>
        </div>
      )}
    </li>
  );
}
