import { useNavigate } from "react-router";
import { useMe } from "../../hooks/me/useMe";
import { useEditProfile } from "../../hooks/me/useEditProfile";
import Button from "../../components/ui/Button";
import { ArrowBigLeft, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Avatar } from "../../components/chat/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";
import { toast } from "react-toastify";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

function ProfileInputField({
  value,
  onChange,
  id,
  label,
  type = "text",
  name,
  isFetchingProfile,
}) {
  const { language } = useLanguage();
  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 rounded">
      <label
        htmlFor={id}
        className="text-sm text-cyan-600/80 dark:text-cyan-400/80"
      >
        {label}
      </label>
      {isFetchingProfile ? (
        <div className="h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      ) : (
        <input
          dir="auto"
          onChange={onChange}
          className="outline-2 outline-gray-200/50 dark:outline-gray-600/50 rounded text-sm px-2 py-1 mt-2 focus:outline-cyan-600/50 dark:focus:outline-cyan-400/50 focus:outline-offset-2 transition-all text-gray-700 dark:text-gray-100 dark:bg-gray-800"
          id={id}
          type={type}
          value={value}
          name={name}
        />
      )}
    </div>
  );
}

function BioTextAreaField({ value, onChange, isFetchingProfile }) {
  const { language } = useLanguage();
  const textAreaRef = useRef(null);
  const bioLength = value ? value.length : 0;
  const handleInput = () => {
    const el = textAreaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };
  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 bg-gray-50/30 dark:bg-gray-800/30">
      <label
        htmlFor={"bio"}
        className="text-sm text-cyan-600/80 dark:text-cyan-400"
      >
        {translations.EditProfilePage[useLanguage().language].YourBio}
      </label>
      {isFetchingProfile ? (
        <div className="h-18 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      ) : (
        <textarea
          dir="auto"
          className="outline-2 outline-gray-200/50 dark:outline-gray-600/50 focus:outline-cyan-600/50 dark:focus:outline-cyan-400/50 focus:outline-offset-2 transition-all rounded mt-2 p-2 text-sm text-gray-700 dark:text-gray-100 dark:bg-gray-800 resize-none"
          name="bio"
          id="bio"
          ref={textAreaRef}
          value={value}
          onInput={handleInput}
          onChange={onChange}
        ></textarea>
      )}
      {isFetchingProfile ? (
        <div className="flex items-center gap-1 justify-end">
          <span className="inline-block py-1.5 w-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
          <span className="text-xs text-gray-400 dark:text-gray-200 text-end">
            {translations.EditProfilePage[language].Characters}
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-200 text-end">
          {bioLength}{" "}
          {bioLength > 1
            ? translations.EditProfilePage[language].Characters
            : translations.EditProfilePage[language].Character}
        </span>
      )}
    </div>
  );
}

function AvatarFileField({
  avatarURL,
  setAvatarURL,
  fullname,
  color,
  isFetchingProfile,
}) {
  const avatarFieldRef = useRef(null);
  const [previewURL, setPreviewURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const handleAvatarSelect = async (e) => {
    const avatarFile = e.target.files[0];
    if (!avatarFile) return;
    // get the temporary URL by createObjectURL method of URL class so it feels optimistic
    const fileTempURL = URL.createObjectURL(avatarFile);
    setPreviewURL(fileTempURL);
    try {
      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`${Date.now()}-${avatarFile.name}`, avatarFile, {
          contentType: avatarFile.type,
        });
      if (error) {
        throw new Error(error.message);
      }

      const { data: publicURlData } = supabase.storage
        .from("images")
        .getPublicUrl(data.path);
      setAvatarURL(publicURlData.publicUrl);
      setIsUploading(false);
    } catch (err) {
      toast.error(err.message);
      console.error(err.message);
    }
  };
  const handleDeleteAvatar = () => {
    setAvatarURL("");
    setPreviewURL("");
  };
  const { language } = useLanguage();
  return (
    <div className="bg-gray-50/30 px-4 py-2 my-4 flex-0 shrink-0 h-full dark:bg-gray-800/30">
      <label
        className="text-sm text-cyan-600/80 dark:text-cyan-400/80"
        htmlFor="avatar"
      >
        {translations.EditProfilePage[language].Avatar}
      </label>
      <input
        type="file"
        hidden
        ref={avatarFieldRef}
        id="avatar"
        name="avatarFile"
        onChange={handleAvatarSelect}
        accept="image/*"
      />
      {isFetchingProfile ? (
        <div className="shrink-0 my-3 flex justify-center">
          <div className="w-[80px] h-[80px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
        </div>
      ) : (
        <div className="relative">
          {isUploading && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-xs text-white">
              {translations.EditProfilePage[language].Uploading}
            </span>
          )}
          <Avatar
            size="80px"
            chatAvatar={previewURL || avatarURL}
            chatTitle={fullname}
            color={color}
            className={`my-3 flex justify-center ${isUploading && "brightness-50"}`}
          />
        </div>
      )}
      <div className="flex items-center justify-center gap-2">
        <Button
          disabled={isFetchingProfile}
          className={
            "text-xs bg-white dark:bg-gray-700 disabled:opacity-50 dark:text-gray-100"
          }
          onClick={() => avatarFieldRef.current.click()}
        >
          {translations.EditProfilePage[language].Replace}
        </Button>
        <Button
          className={
            "bg-red-200 dark:bg-red-700 text-red-500/80 text-xs disabled:opacity-50 dark:text-red-200"
          }
          onClick={handleDeleteAvatar}
          disabled={isFetchingProfile}
        >
          {translations.EditProfilePage[language].Delete}
        </Button>
      </div>
    </div>
  );
}

function AvatarBackgroundFileField({
  avatarBackgroundURL,
  setAvatarBackgroundURL,
  isFetchingProfile,
}) {
  const avatarBackgroundFieldRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);
  const handleAvatarbackgroundSelect = async (e) => {
    const avatarBackgroundFile = e.target.files[0];
    if (!avatarBackgroundFile) return;
    // get the temporary URL by createObjectURL method of URL class so it feels optimistic
    const fileTempURL = URL.createObjectURL(avatarBackgroundFile);
    setPreviewURL(fileTempURL);
    try {
      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from("images")
        .upload(
          `${Date.now()}-${avatarBackgroundFile.name}`,
          avatarBackgroundFile,
          {
            contentType: avatarBackgroundFile.type,
          },
        );
      if (error) {
        throw new Error(error.message);
      }

      const { data: publicURlData } = supabase.storage
        .from("images")
        .getPublicUrl(data.path);
      setAvatarBackgroundURL(publicURlData.publicUrl);
      setIsUploading(false);
    } catch (err) {
      toast.error(err.message);
      console.error(err.message);
    }
  };
  const handleDeleteAvatarbackground = () => {
    setAvatarBackgroundURL("");
    setPreviewURL("");
  };
  const { language } = useLanguage();
  return (
    <div
      className={`flex-1 basis-sm relative overflow-hidden h-48  ${(isFetchingProfile || isUploading) && "animate-pulse"}`}
      style={{
        backgroundImage: `url(${previewURL || avatarBackgroundURL})`,
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
          {translations.EditProfilePage[language].AvatarBackground}
        </label>
        <input
          hidden
          type="file"
          id="avatarBackgroundFile"
          name="avatarBackgroundFile"
          ref={avatarBackgroundFieldRef}
          onChange={handleAvatarbackgroundSelect}
        />
        {isUploading ? (
          <p className="text-sm text-gray-50">
            {translations.EditProfilePage[language].Uploading}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              disabled={isFetchingProfile}
              className={
                "text-xs bg-gray-50 disabled:opacity-50 dark:text-gray-100"
              }
              onClick={() => avatarBackgroundFieldRef.current.click()}
            >
              {translations.EditProfilePage[language].Replace}
            </Button>
            <Button
              disabled={isFetchingProfile}
              className={
                "bg-red-200 text-red-500/80 dark:text-red-400/80 text-xs disabled:opacity-50"
              }
              onClick={handleDeleteAvatarbackground}
            >
              {translations.EditProfilePage[language].Delete}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EditProfilePage() {
  const { language } = useLanguage();
  const {
    mutate: put,
    isPending: areChangesPending,
    error: putError,
  } = useEditProfile();

  const { user, isFetching: isFetchingProfile, error: profileError } = useMe();
  const { user: currentUserIdentity } = useAuth();
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
    function setInitialUser() {
      if (user && !isFetchingProfile) {
        setNewProfileData((prev) => {
          if (user?.profile) {
            return { ...user?.profile };
          } else {
            return prev;
          }
        });
      }
    }
    setInitialUser();
  }, [isFetchingProfile, user]);

  const onFieldChange = (value, key) => {
    setNewProfileData((prev) => ({ ...prev, [key]: value }));
  };
  const handleConfirmEdit = () => {
    put(newProfileData);
    navigate("/users/me/profile");
  };

  if (profileError) return <p>Error: {profileError.message}</p>;

  return (
    <main className="max-w-200 mx-auto bg-white dark:bg-gray-900 font-rubik relative">
      <div className="flex justify-between items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg my-2">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{translations.Common[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
        <Button
          disabled={isFetchingProfile}
          onClick={handleConfirmEdit}
          className={"text-gray-600 dark:text-gray-300"}
        >
          <p className="sr-only">
            {translations.EditProfilePage[language].ConfirmEditsSR}
          </p>
          <Check size={20} />
        </Button>
      </div>
      <form
        dir={language === "Arabic" ? "rtl" : "ltr"}
        onSubmit={(e) => e.preventDefault()}
        action="
      "
      >
        {" "}
        <AvatarFileField
          setAvatarURL={(value) => onFieldChange(value, "avatar")}
          avatarURL={newProfileData.avatar}
          fullname={
            currentUserIdentity.firstname + " " + currentUserIdentity.lastname
          }
          color={user?.accountColor || ""}
          isFetchingProfile={isFetchingProfile}
        />
        <AvatarBackgroundFileField
          setAvatarBackgroundURL={(value) =>
            onFieldChange(value, "avatarBackground")
          }
          avatarBackgroundURL={newProfileData.avatarBackground}
          isFetchingProfile={isFetchingProfile}
        />
        <BioTextAreaField
          value={newProfileData.bio}
          onChange={(e) => onFieldChange(e.target.value, "bio")}
          isFetchingProfile={isFetchingProfile}
        />
        <ProfileInputField
          value={newProfileData.phoneNumber}
          onChange={(e) => onFieldChange(e.target.value, "phoneNumber")}
          id="phoneNumber"
          label={translations.Profile[language].Phone}
          type="phone"
          name={"phoneNumber"}
          isFetchingProfile={isFetchingProfile}
        />
        <ProfileInputField
          value={newProfileData.email}
          onChange={(e) => onFieldChange(e.target.value, "email")}
          id="email"
          label={translations.Profile[language].Email}
          type="email"
          name={"bio"}
          isFetchingProfile={isFetchingProfile}
        />
        <ProfileInputField
          value={newProfileData.birthday}
          onChange={(e) => onFieldChange(e.target.value, "birthday")}
          id="birthday"
          label={translations.Profile[language].Birthday}
          type="date"
          name={"birthday"}
          isFetchingProfile={isFetchingProfile}
        />
      </form>
    </main>
  );
}
