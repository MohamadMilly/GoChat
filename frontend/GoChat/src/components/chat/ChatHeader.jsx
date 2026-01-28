import { memo } from "react";
import { abbreviateText } from "../../utils/abbreviateText";
import { useSocket } from "../../contexts/SocketContext";
import { NavLink } from "react-router";
import { Avatar } from "./Avatar";

export const ChatHeader = memo(
  ({ chatPartners, avatar = "", title = "", type, typingUsers = [] }) => {
    const { connectedUsers } = useSocket();
    const isGroup = type === "GROUP";
    const isThereUsersTyping = typingUsers.length > 0;
    // GROUP
    const membersCount = chatPartners.length;
    // DIRECT
    const partner = chatPartners[0].user;
    const chatAvatar = isGroup ? avatar : partner.profile?.avatar;
    const chatTitle = isGroup
      ? title
      : partner.firstname + " " + partner.lastname;
    const isConnected = !!connectedUsers.find((id) => id == partner.id);
    const isUserTyping = isThereUsersTyping
      ? partner.id == typingUsers[0].user.id
      : false;
    return (
      <header className="border-b-2 border-gray-100 px-4 py-2 shadow-lg">
        <NavLink
          className={"flex items-center gap-x-2"}
          to={isGroup ? "" : `/users/${partner.id}`}
        >
          <Avatar chatTitle={chatTitle} avatar={chatAvatar} />
          <div>
            <p className="text-sm">{chatTitle}</p>
            <span className="text-xs text-gray-700">
              {isGroup ? (
                isThereUsersTyping ? (
                  typingUsers.map((userData) => {
                    return (
                      <span>{userData.user.firstname + " is typing..."}</span>
                    );
                  })
                ) : (
                  membersCount + " members"
                )
              ) : isUserTyping ? (
                "typing..."
              ) : isConnected ? (
                <span className="text-cyan-600">Online</span>
              ) : (
                "Offline"
              )}
            </span>
          </div>
        </NavLink>
      </header>
    );
  },
);
