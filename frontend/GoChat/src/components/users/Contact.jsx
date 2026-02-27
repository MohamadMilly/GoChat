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
    <li className="py-2 flex items-center dark:hover:bg-gray-800/50">
      <button
        className="flex w-full items-center gap-2 cursor-pointer relative"
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
              <span className="text-green-600 dark:text-green-400 bg-gray-200/90 dark:bg-gray-600/90 rounded-full absolute bottom-0 right-0">
                <CircleCheckBig size={15} />
              </span>
            ) : (
              <span className="text-gray-400 bg-gray-200/90 dark:text-gray-600 dark:bg-gray-400/90 rounded-full absolute bottom-0 right-0">
                <Circle size={15} />
              </span>
            )
          ) : null}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-gray-700 dark:text-gray-200">{fullname}</p>
        </div>
      </button>
    </li>
  );
}
