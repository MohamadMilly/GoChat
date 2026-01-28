import { abbreviateText } from "../../utils/abbreviateText";

export function Contact({
  firstname,
  lastname,
  avatar,
  onClick = () => {},
  isSelected = false,
}) {
  const fullname = `${firstname} ${lastname}`;
  return (
    <li>
      <button type="button" onClick={onClick}>
        <div>
          {avatar ? <img src={avatar} /> : abbreviateText(fullname)}
          {isSelected && <span>selected</span>}
        </div>
        <div>
          <p>{fullname}</p>
        </div>
      </button>
    </li>
  );
}
