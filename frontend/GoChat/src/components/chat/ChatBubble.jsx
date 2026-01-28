import { useState } from "react";
import { abbreviateText } from "../../utils/abbreviateText";

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

  const fullname = sender.firstname + " " + sender.lastname;
  const isThereAvatar = !!sender.profile?.avatar;
  const avatar = isThereAvatar
    ? sender.profile.avatar
    : abbreviateText(fullname);
  return (
    <li className="my-1">
      <div
        className={`w-fit max-w-3/4 px-2 py-1 font-rubik rounded-t-xl ${isMyMessage ? "bg-cyan-700 ml-auto rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 rounded-bl-none rounded-br-xl"}`}
        onClick={toggleIsDateShown}
      >
        {isGroupMessage && !isMyMessage && (
          <div>
            {isThereAvatar ? (
              <img src={avatar} alt="message sender avatar" />
            ) : (
              avatar
            )}
          </div>
        )}
        <div>
          {isGroupMessage && !isMyMessage && <p>{fullname}</p>}
          <p>{content}</p>
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
