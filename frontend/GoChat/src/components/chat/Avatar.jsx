import { abbreviateText } from "../../utils/abbreviateText";
import { getGenertedTransitionId } from "../../utils/transitionId";

export function Avatar({
  avatar,
  chatAvatar,
  chatTitle,
  color,
  size = "48px",
  className = "",
  viewTransitionName = null,
  dynamicTransitionId,
  titleSize = "18px",
}) {
  const src = chatAvatar || avatar || null;

  const dynamicTransitionName = dynamicTransitionId
    ? `${chatTitle.replaceAll(" ", "-")}-${dynamicTransitionId}`
    : null;

  return (
    <div className={`relative ${className}`}>
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
            className={`text-[var(--text-size)] ${color ? "text-gray-100" : "text-gray-600"}`}
            style={{ "--text-size": titleSize }}
          >
            {abbreviateText(chatTitle)}
          </span>
        )}
      </div>
    </div>
  );
}
