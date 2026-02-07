import { abbreviateText } from "../../utils/abbreviateText";
import { Avatar } from "../chat/Avatar";
import { Circle, CircleCheckBig } from "lucide-react";

export function Contact({
  firstname,
  lastname,
  avatar,
  onClick = () => {},
  isSelected = false,
  isSelectable = false,
  color,
}) {
  const fullname = `${firstname} ${lastname}`;
  return (
    <li className="pb-2 flex items-center border-b border-gray-100 my-1">
      <button
        className="flex items-center gap-2 cursor-pointer relative"
        type="button"
        onClick={onClick}
      >
        <div className="relative">
          <Avatar
            avatar={null}
            chatAvatar={avatar}
            chatTitle={fullname}
            color={color}
          />

          {isSelectable ? (
            isSelected ? (
              <span className="text-green-600 bg-gray-200/90 rounded-full absolute bottom-0 right-0">
                <CircleCheckBig size={15} />
              </span>
            ) : (
              <span className="text-gray-400 bg-gray-200/90 rounded-full absolute bottom-0 right-0">
                <Circle size={15} />
              </span>
            )
          ) : null}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-gray-700">{fullname}</p>
        </div>
      </button>
    </li>
  );
}
