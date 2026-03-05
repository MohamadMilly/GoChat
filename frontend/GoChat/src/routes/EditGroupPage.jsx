import { useNavigate, useParams } from "react-router";
import { useConversation } from "../hooks/useConversation";
import Button from "../components/ui/Button";
import { ArrowBigLeft, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Avatar } from "../components/chat/Avatar";
import { supabase } from "../utils/supabase";
import { toast } from "react-toastify";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useEditGroup } from "../hooks/useEditGroup";
import { useAuth } from "../contexts/AuthContext";

function GroupInputField({
  value,
  onChange,
  id,
  label,
  type = "text",
  name,
  isFetching,
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
      {isFetching ? (
        <div className="h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      ) : (
        <input
          dir="auto"
          onChange={onChange}
          className="outline-2 outline-gray-200/50 dark:outline-gray-600/50 rounded text-sm px-2 py-1 mt-2 focus:outline-cyan-600/50 dark:focus:outline-cyan-400/50 focus:outline-offset-2 transition-all text-gray-700 dark:text-gray-100 dark:bg-gray-800"
          id={id}
          type={type}
          value={value || ""}
          name={name}
        />
      )}
    </div>
  );
}

function DescriptionTextArea({ value, onChange, isFetching }) {
  const textAreaRef = useRef(null);
  const handleInput = () => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };
  const { language } = useLanguage();
  return (
    <div className="flex flex-col gap-1 px-4 py-2 my-4 bg-gray-50/30 dark:bg-gray-800/30">
      <label
        htmlFor={"description"}
        className="text-sm text-cyan-600/80 dark:text-cyan-400"
      >
        {translations.NewGroupPage[language].Description}
      </label>
      {isFetching ? (
        <div className="h-18 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      ) : (
        <textarea
          dir="auto"
          className="outline-2 outline-gray-200/50 dark:outline-gray-600/50 focus:outline-cyan-600/50 dark:focus:outline-cyan-400/50 focus:outline-offset-2 transition-all rounded mt-2 p-2 text-sm text-gray-700 dark:text-gray-100 dark:bg-gray-800 resize-none"
          name="description"
          id="description"
          ref={textAreaRef}
          value={value || ""}
          onInput={handleInput}
          onChange={onChange}
        ></textarea>
      )}
    </div>
  );
}

function AvatarFileField({ avatarURL, setAvatarURL, title, isFetching }) {
  const avatarFieldRef = useRef(null);
  const [previewURL, setPreviewURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const handleAvatarSelect = async (e) => {
    const avatarFile = e.target.files[0];
    if (!avatarFile) return;
    const fileTempURL = URL.createObjectURL(avatarFile);
    setPreviewURL(fileTempURL);
    try {
      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`${Date.now()}-${avatarFile.name}`, avatarFile, {
          contentType: avatarFile.type,
        });
      if (error) throw new Error(error.message);
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
  const handleDelete = () => {
    setAvatarURL("");
    setPreviewURL("");
  };
  const { language } = useLanguage();
  return (
    <div className="bg-gray-50/30 px-4 py-2 my-4 flex-0 shrink-0 h-full dark:bg-gray-800/30">
      <label
        className="text-sm text-cyan-600/80 dark:text-cyan-400/80"
        htmlFor="groupAvatar"
      >
        {translations.NewGroupPage[language].ClickToUploadImage}
      </label>
      <input
        type="file"
        hidden
        ref={avatarFieldRef}
        id="groupAvatar"
        name="avatarFile"
        onChange={handleAvatarSelect}
        accept="image/*"
      />
      {isFetching ? (
        <div className="shrink-0 my-3 flex justify-center">
          <div className="w-[80px] h-[80px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
        </div>
      ) : (
        <div className="relative">
          {isUploading && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-xs text-white">
              {translations.NewGroupPage[language].Uploading}
            </span>
          )}
          <Avatar
            size="80px"
            chatAvatar={previewURL || avatarURL}
            chatTitle={title}
            className={`my-3 flex justify-center ${isUploading && "brightness-50"}`}
          />
        </div>
      )}
      <div className="flex items-center justify-center gap-2">
        <Button
          disabled={isFetching}
          className={
            "text-xs bg-white dark:bg-gray-700 disabled:opacity-50 dark:text-gray-100"
          }
          onClick={() => avatarFieldRef.current.click()}
        >
          {translations.EditProfilePage[useLanguage().language].Replace}
        </Button>
        <Button
          className={
            "bg-red-200 dark:bg-red-700 text-red-500/80 text-xs disabled:opacity-50 dark:text-red-200"
          }
          onClick={handleDelete}
          disabled={isFetching}
        >
          {translations.EditProfilePage[useLanguage().language].Delete}
        </Button>
      </div>
    </div>
  );
}

function ParticipantCard({
  participant,
  handleRemoveParticipant,
  handleToggleAdminStatus,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const cardRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (cardRef.current && menuOpen && !cardRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);
  return (
    <li ref={cardRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="py-2 flex items-center gap-2 dark:hover:bg-gray-600/20 relative w-full"
      >
        <div className="shrink-0 relative">
          <Avatar
            chatAvatar={participant?.user.profile?.avatar || ""}
            chatTitle={
              participant.user.firstname + " " + participant.user.lastname
            }
            color={participant.user?.accountColor || null}
          />
        </div>

        <div className="flex flex-col items-start w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {participant.user.firstname + " " + participant.user.lastname}
            </p>
            {participant.isOwner ? (
              <span className="text-xs dark:text-gray-200 dark:bg-purple-600/50 border dark:border-purple-500/50 text-purple-800 bg-purple-200 px-1 py-0.5 rounded-full">
                Owner
              </span>
            ) : participant.isAdmin ? (
              <span className="text-xs dark:text-gray-200 dark:bg-green-400/50 border dark:border-green-400/50 text-green-800 bg-gray-200 px-1 py-0.5 rounded-full">
                Admin
              </span>
            ) : null}
          </div>
        </div>
        {menuOpen && (
          <div className="absolute flex flex-col right-12 bottom-4 p-2 rounded bg-gray-700 animate-pop">
            {user.id !== participant.userId && (
              <>
                <Button
                  onClick={() => handleRemoveParticipant(participant.userId)}
                >
                  Remove
                </Button>

                <Button
                  onClick={() =>
                    handleToggleAdminStatus(
                      participant.userId,
                      !participant.isAdmin,
                    )
                  }
                >
                  {participant.isAdmin ? "Remove Admin" : "Promote"}
                </Button>
              </>
            )}
          </div>
        )}
      </button>
    </li>
  );
}

function ParticipantsList({ participants, setParticipants, language }) {
  const handleRemoveParticipant = (participantUserId) => {
    setParticipants((prev) => {
      return prev.filter((p) => p.userId !== participantUserId);
    });
  };
  const handleToggleAdminStatus = (participantUserId, isAdmin) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.userId === participantUserId) {
          return { ...p, isAdmin: isAdmin };
        } else return p;
      }),
    );
  };

  return (
    <section
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className="p-4 mt-4 bg-white dark:bg-gray-800/30 shadow-sm rounded-md"
    >
      <h3 className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
        {translations.ChatDetails[language].MembersHeading}
      </h3>

      <ul className="p-2 my-2 divide-y dark:divide-gray-700 divide-gray-200 ">
        {participants.map((participant) => {
          return (
            <ParticipantCard
              participant={participant}
              handleRemoveParticipant={handleRemoveParticipant}
              handleToggleAdminStatus={handleToggleAdminStatus}
              key={participant.id}
            />
          );
        })}
      </ul>
    </section>
  );
}

export function EditGroupPage() {
  const { id: conversationId } = useParams();
  const {
    mutate: update,
    error: editingError,
    isPending,
    isSuccess,
  } = useEditGroup();
  const { conversation, isFetching, error } = useConversation(conversationId);
  const [groupMetaData, setGroupMetaData] = useState({
    title: "",
    description: "",
    participants: [],
    avatar: "",
  });
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    function setInitialGroupData() {
      if (isFetching || !conversation) return;
      setGroupMetaData({
        title: conversation.title || "",
        description: conversation.description || "",
        participants: conversation.participants || [],
        avatar: conversation.avatar || "",
      });
    }
    setInitialGroupData();
  }, [isFetching, conversation]);

  const onFieldChange = (value, key) => {
    setGroupMetaData((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    update({ conversationId, data: groupMetaData });
  };
  if (isSuccess) {
    navigate(-1);
  }
  if (error) return <p>Error: {error.message}</p>;

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
          disabled={isFetching}
          onClick={handleConfirm}
          className={"text-gray-600 dark:text-gray-300"}
        >
          <p className="sr-only">Confirm edits</p>
          <Check size={20} />
        </Button>
      </div>

      <form
        dir={language === "Arabic" ? "rtl" : "ltr"}
        onSubmit={(e) => e.preventDefault()}
      >
        <AvatarFileField
          setAvatarURL={(value) => onFieldChange(value, "avatar")}
          avatarURL={groupMetaData.avatar}
          title={
            groupMetaData.title || translations.NewGroupPage[language].Title
          }
          isFetching={isFetching}
        />
        <GroupInputField
          value={groupMetaData.title}
          onChange={(e) => onFieldChange(e.target.value, "title")}
          id="groupTitle"
          label={translations.NewGroupPage[language].Title}
          name="title"
          isFetching={isFetching}
        />
        <DescriptionTextArea
          value={groupMetaData.description}
          onChange={(e) => onFieldChange(e.target.value, "description")}
          isFetching={isFetching}
        />
        <ParticipantsList
          language={language}
          participants={groupMetaData.participants}
          setParticipants={(updater) => {
            setGroupMetaData((prev) => {
              const next =
                typeof updater === "function"
                  ? updater(prev.participants)
                  : (updater ?? []);
              return { ...prev, participants: next };
            });
          }}
        />
      </form>
    </main>
  );
}
