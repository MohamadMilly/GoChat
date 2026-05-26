import { memo } from "react";
import { abbreviateText } from "../../utils/abbreviateText";

export const Avatar = memo(
  ({
    avatar,
    chatAvatar,
    chatTitle,
    color,
    size = "48px",
    className = "",
    viewTransitionName = null,
    dynamicTransitionId,
    titleSize = "18px",
    style,
  }) => {
    const src = chatAvatar || avatar || null;

    const dynamicTransitionName = dynamicTransitionId
      ? `${chatTitle.replaceAll(" ", "-")}-${dynamicTransitionId}`
      : null;

    return (
      <div style={style} className={`relative ${className}`}>
        <div
          className={`flex shadow-inner shadow-gray-200/60 justify-center items-center shrink-0 w-[var(--size)] h-[var(--size)] rounded-full overflow-hidden ${
            color ? "bg-[var(--chat-color)]" : "bg-gray-100"
          }`}
          style={{
            "--chat-color": color,
            "--size": size,
            viewTransitionName: viewTransitionName
              ? viewTransitionName
              : dynamicTransitionName,
          }}
        >
          {src ? (
            <img
              className="object-cover h-full w-full rounded-full"
              src={src}
              alt="chat avatar"
              loading="lazy"
            />
          ) : (
            <span
              className={` text-[size:var(--title-size)] ${color ? "text-gray-100" : "text-gray-600"}`}
              style={{ "--title-size": titleSize }}
            >
              {abbreviateText(chatTitle)}
            </span>
          )}
        </div>
      </div>
    );
  },
);
