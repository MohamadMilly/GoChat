import { useNavigate } from "react-router";
import { useMe } from "../../hooks/me/useMe";
import { useEditProfile } from "../../hooks/me/useEditProfile";
import Button from "../../components/ui/Button";
import { ArrowBigLeft, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Avatar } from "../../components/chat/Avatar";
function ProfileInputField({
  value,
  onChange,
  id,
  label,
  type = "text",
  name,
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 rounded">
      <label htmlFor={id} className="text-sm text-cyan-600/80">
        {label}
      </label>
      <input
        onChange={onChange}
        className="outline-2 outline-gray-200/50 rounded text-sm px-2 py-1 mt-2 focus:outline-cyan-600/50 focus:outline-offset-2 transition-all text-gray-700"
        id={id}
        type={type}
        value={value}
        name={name}
      />
    </div>
  );
}

function BioTextAreaField({ value, onChange }) {
  const textAreaRef = useRef(null);
  const bioLength = value ? value.length : 0;
  const handleInput = () => {
    const el = textAreaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };
  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 bg-gray-50/30">
      <label htmlFor={"bio"} className="text-sm text-cyan-600/80">
        Your Bio
      </label>
      <textarea
        className="outline-2 outline-gray-200/50 focus:outline-cyan-600/50 focus:outline-offset-2 transition-all rounded mt-2 p-2 text-sm text-gray-700 resize-none"
        name="bio"
        id="bio"
        ref={textAreaRef}
        value={value}
        onInput={handleInput}
        onChange={onChange}
      ></textarea>
      <span className="text-xs text-gray-400 text-end">
        {bioLength} {bioLength > 1 ? "characters" : "character"}
      </span>
    </div>
  );
}

function AvatarFileField({ avatarURL, setAvatarURL, fullname, color }) {
  const avatarFieldRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const avatarFile = e.target.files[0];
  };
  const handleDeleteAvatar = () => {
    setAvatarURL("");
  };
  return (
    <div className="bg-gray-50/30 px-4 py-2 my-4 flex-0 shrink-0 h-full">
      <label className="text-sm text-cyan-600/80" htmlFor="avatar">
        Your Avatar
      </label>
      <input
        type="file"
        hidden
        ref={avatarFieldRef}
        id="avatar"
        name="avatarFile"
        onChange={handleAvatarSelect}
      />
      <Avatar
        size="80px"
        chatAvatar={avatarURL}
        chatTitle={fullname}
        color={color}
        className="my-3 flex justify-center"
      />
      <div className="flex items-center justify-center gap-2">
        <Button
          className={"text-xs bg-white"}
          onClick={() => avatarFieldRef.current.click()}
        >
          Replace
        </Button>
        <Button
          className={"bg-red-200 text-red-500/80 text-xs"}
          onClick={handleDeleteAvatar}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

function AvatarBackgroundFileField({
  avatarBackgroundURL,
  setAvatarBackgroundURL,
}) {
  const avatarBackgroundFieldRef = useRef(null);
  const handleAvatarbackgroundSelect = (e) => {
    const avatarBackgroundFile = e.target.files[0];
  };
  const handleDeleteAvatarbackground = () => {
    setAvatarBackgroundURL("");
  };
  return (
    <div
      className="flex-1 basis-sm relative overflow-hidden h-48"
      style={{
        backgroundImage: `url(${avatarBackgroundURL})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="inset-0 absolute bg-gray-800/40"></div>
      <div className="z-10 relative h-full w-full flex justify-center items-center flex-col gap-2">
        <label
          className="text-2xl text-white text-shadow-sm"
          htmlFor="avatarBackgroundFile"
        >
          Your Avatar Background
        </label>
        <input
          hidden
          type="file"
          id="avatarBackgroundFile"
          name="avatarBackgroundFile"
          ref={avatarBackgroundFieldRef}
          onChange={handleAvatarbackgroundSelect}
        />
        <div className="flex items-center gap-2">
          <Button
            className={"text-xs bg-gray-50"}
            onClick={() => avatarBackgroundFieldRef.current.click()}
          >
            Replace
          </Button>
          <Button
            className={"bg-red-200 text-red-500/80 text-xs"}
            onClick={handleDeleteAvatarbackground}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EditProfilePage() {
  const {
    mutate: put,
    isPending: areChangesPending,
    error: putError,
  } = useEditProfile();

  const { user, isFetching: isFetchingProfile, error: profileError } = useMe();

  const [newProfileData, setNewProfileData] = useState({
    avatar: "",
    avatarBackground: "",
    bio: "",
    phoneNumber: "",
    email: "",
    birthday: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFetchingProfile && user) {
      setNewProfileData((prev) => {
        if (user?.profile) {
          return { ...user?.profile };
        } else {
          return prev;
        }
      });
    }
  }, [isFetchingProfile, user]);

  const onFieldChange = (value, key) => {
    setNewProfileData((prev) => ({ ...prev, [key]: value }));
  };
  const handleConfirmEdit = () => {
    put(newProfileData);
    navigate("/users/me/profile");
  };
  if (isFetchingProfile) return <p>Loading...</p>;
  if (profileError) return <p>Error: {profileError.message}</p>;

  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative">
      <div className="flex justify-between items-center p-2 bg-gray-50/30 rounded-lg my-2">
        <Button onClick={() => navigate(-1)} className="text-gray-600">
          <p className="sr-only">Go Back</p>
          <ArrowBigLeft size={20} />
        </Button>
        <Button onClick={handleConfirmEdit} className={"text-gray-600"}>
          <p className="sr-only">Confirm edits</p>
          <Check size={20} />
        </Button>
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        action="
      "
      >
        {" "}
        <AvatarFileField
          setAvatarURL={(value) => onFieldChange(value, "avatar")}
          avatarURL={newProfileData.avatar}
          fullname={user.firstname + " " + user.lastname}
          color={user?.accountColor || ""}
        />
        <AvatarBackgroundFileField
          setAvatarBackgroundURL={(value) =>
            onFieldChange(value, "avatarBackground")
          }
          avatarBackgroundURL={newProfileData.avatarBackground}
        />
        <BioTextAreaField
          value={newProfileData.bio}
          onChange={(e) => onFieldChange(e.target.value, "bio")}
        />
        <ProfileInputField
          value={newProfileData.phoneNumber}
          onChange={(e) => onFieldChange(e.target.value, "phoneNumber")}
          id="phoneNumber"
          label={"Your phone number"}
          type="phone"
          name={"phoneNumber"}
        />
        <ProfileInputField
          value={newProfileData.email}
          onChange={(e) => onFieldChange(e.target.value, "email")}
          id="email"
          label={"Your Email"}
          type="email"
          name={"bio"}
        />
        <ProfileInputField
          value={newProfileData.birthday}
          onChange={(e) => onFieldChange(e.target.value, "birthday")}
          id="birthday"
          label={"Your Birthday"}
          type="date"
          name={"birthday"}
        />
      </form>
    </main>
  );
}
