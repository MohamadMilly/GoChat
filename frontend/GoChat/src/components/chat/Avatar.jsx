import { abbreviateText } from "../../utils/abbreviateText";

export function Avatar({ avatar, chatTitle }) {
  return (
    <div className="flex justify-center items-center shrink-0 w-14 h-14 border rounded-full relative">
      {avatar ? (
        <img src={avatar} alt="chat avatar" />
      ) : (
        <span>{abbreviateText(chatTitle)}</span>
      )}
    </div>
  );
}
