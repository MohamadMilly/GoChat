import { useNavigate, useParams } from "react-router";
import { useConversation } from "../hooks/useConversation";
import { Link } from "../components/ui/Link";
import Button from "../components/ui/Button";
import { ArrowBigLeft, Check, KeyRound, UserRoundPlus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useMyContacts } from "../hooks/me/useMyContacts";
import { filterUsers } from "../utils/filterUsers";
import { Contact } from "../components/users/Contact";
import { Avatar } from "../components/chat/Avatar";
import { Tag } from "../components/ui/Tag";
import { supabase } from "../utils/supabase";
import { toast } from "react-toastify";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useEditGroup } from "../hooks/useEditGroup";
import { useAuth } from "../contexts/AuthContext";
import { LeaveConversationButton } from "../components/chat/ChatHeaderMenu";

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
              <Tag
                tagContent={"Owner"}
                bgColor={"bg-purple-200"}
                textColor={"text-purple-800"}
                darkModeBgColor={"dark:bg-purple-600/50"}
                darkModeTextColor={"dark:text-gray-200"}
              />
            ) : participant.isAdmin ? (
              <Tag
                tagContent={"Admin"}
                bgColor={"bg-gray-200"}
                textColor={"text-green-800"}
                darkModeBgColor={"dark:bg-green-400/50"}
                darkModeTextColor={"dark:text-gray-200"}
              />
            ) : null}
          </div>
        </div>
        {menuOpen && (
          <div className="absolute flex flex-col right-12 bottom-4 w-40 p-1 gap-1 rounded dark:bg-gray-700 bg-gray-100 animate-pop">
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
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const { users, isFetching: isContactsFetching } = useMyContacts();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [query, setQuery] = useState("");
  const queriedContacts =
    !isContactsFetching && filterUsers(users, query || "");
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
  const toggleSelectedContact = (user) => {
    const exists = selectedMembers.find((m) => m.id === user.id);
    if (exists)
      setSelectedMembers((prev) => prev.filter((m) => m.id !== user.id));
    else setSelectedMembers((prev) => [...prev, user]);
  };

  const handleConfirmAdd = () => {
    const existingIds = participants.map((p) => p.userId);
    const toAdd = selectedMembers
      .filter((u) => !existingIds.includes(u.id))
      .map((u) => ({ userId: u.id, isAdmin: false, isOwner: false, user: u }));
    if (toAdd.length > 0) {
      setParticipants((prev) => [...prev, ...toAdd]);
    }
    setSelectedMembers([]);
    setQuery("");
    setIsAddingParticipant(false);
  };

  return (
    <section
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className="p-4 mt-4 bg-white dark:bg-gray-800/30 shadow-sm rounded-md"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
          {translations.ChatDetails[language].MembersHeading}
        </h3>
        <Button
          onClick={() => setIsAddingParticipant(!isAddingParticipant)}
          className={"relative group"}
        >
          <span className="text-xs absolute -top-8 -right-8 dark:bg-gray-700/20 bg-gray-100  p-1 rounded w-30 group-hover:opacity-100 transition-all duration-300 opacity-0">
            {translations.Common[language]?.Add || "Add"}
          </span>
          <UserRoundPlus size={20} />
        </Button>
      </div>

      {isAddingParticipant ? (
        <div className="p-2 mt-4">
          <div className="w-full p-2 flex flex-col gap-2">
            <label
              className="tracking-tight text-cyan-600/80 dark:text-cyan-400/80"
              htmlFor="search"
            >
              {translations.SearchBar[language].FindUser}
            </label>
            <input
              dir="auto"
              id="search"
              className="px-4 py-1.5 outline-2 outline-gray-200/50 dark:outline-gray-400/30 focus:outline-cyan-600/50 dark:focus:outline-cyan-400/80 focus:outline-offset-2 focus:bg-gray-200/20 dark:focus:bg-gray-700/20 transition-all rounded-full text-sm text-gray-800 dark:text-gray-100"
              type="search"
              name="contact"
              value={query || ""}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <ul className="w-full flex flex-col animate-slideup divide-y dark:divide-gray-700 divide-gray-200 mt-2">
            {isContactsFetching ? (
              <p className="text-xs text-gray-400 dark:text-gray-200 text-center">
                {translations.NewGroupPage[language].Loading}
              </p>
            ) : queriedContacts && queriedContacts.length > 0 ? (
              queriedContacts.map((c) => {
                const alreadyParticipant = participants.some(
                  (p) => p.userId === c.id,
                );
                const isSelected = !!selectedMembers.find((m) => m.id === c.id);
                return (
                  <Contact
                    isSelected={isSelected}
                    firstname={c.firstname}
                    isSelectable={!alreadyParticipant}
                    lastname={c.lastname}
                    tag={alreadyParticipant && "Selected"}
                    onClick={() => toggleSelectedContact(c)}
                    avatar={c.profile?.avatar || null}
                    color={c?.accountColor || null}
                    key={c.id}
                  />
                );
              })
            ) : (
              <p className="text-xs text-center text-gray-400 dark:text-gray-200">
                {translations.NewGroupPage[language].NoUsersFound}
              </p>
            )}
          </ul>

          <div className="flex gap-2 mt-3">
            <Button onClick={handleConfirmAdd} className="text-sm">
              {translations.Common[language]?.Confirm || "Add Selected"}
            </Button>
            <Button
              onClick={() => {
                setIsAddingParticipant(false);
                setSelectedMembers([]);
                setQuery("");
              }}
              className="text-sm bg-gray-200"
            >
              {translations.Common[language]?.Cancel || "Cancel"}
            </Button>
          </div>
        </div>
      ) : (
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
      )}
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
  const {
    conversation,
    isFetching,
    error,
    isAdmin: isCurrentUserAdmin,
    isOwner: isCurrentUserOwner,
  } = useConversation(conversationId);
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
    navigate(-1);
  };

  if (error) return <p>Error: {error.message}</p>;
  return (
    <main className="max-w-3xl pb-6 mx-auto bg-gray-50 dark:bg-gray-900 font-rubik relative px-4">
      <header className="flex items-center justify-between gap-4 p-3 my-4 bg-white/60 dark:bg-gray-800/60 rounded-md shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-300 p-2"
          >
            <p className="sr-only">{translations.Common[language].GoBackSR}</p>
            <ArrowBigLeft size={20} />
          </Button>
          <div>
            <h1 className="text-md font-semibold text-gray-800 dark:text-gray-100">
              Edit Group
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update group details, members and permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={isFetching}
            onClick={handleConfirm}
            className={"text-gray-600 dark:text-gray-300"}
          >
            <Check size={20} />
            <p className="sr-only">
              {translations.EditProfilePage[language].ConfirmEditsSR}
            </p>
          </Button>
        </div>
      </header>

      <section>
        <form
          dir={language === "Arabic" ? "rtl" : "ltr"}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1">
              <AvatarFileField
                setAvatarURL={(value) => onFieldChange(value, "avatar")}
                avatarURL={groupMetaData.avatar}
                title={
                  groupMetaData.title ||
                  translations.NewGroupPage[language].Title
                }
                isFetching={isFetching}
              />
            </div>

            <div className="md:col-span-2">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-4 shadow-sm">
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
              </div>

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
            </div>
          </div>
        </form>
      </section>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <section className="p-4 bg-white dark:bg-gray-800/60 shadow-sm rounded-md flex items-center gap-3">
          <KeyRound size={20} className="text-cyan-600" />
          <div className="flex flex-col gap-1">
            <Link
              route={`/chats/groups/${conversationId}/permissions`}
              className={"font-medium text-cyan-600 dark:text-cyan-400 rounded"}
            >
              Permissions
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage who can edit or post in this group
            </p>
          </div>
        </section>

        <section className="p-4 bg-red-50 dark:bg-red-900/10 shadow-sm rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium text-red-600 dark:text-red-300">
              Danger zone
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-200">
              Leave or delete this group , Owner can delete the group.
            </p>
          </div>
          <LeaveConversationButton
            className="px-3 py-2 rounded bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100"
            isGroup={true}
            conversationId={conversationId}
            isCurrentUserOwner={isCurrentUserOwner}
            customText={
              isCurrentUserOwner ? "Delete and leave group" : "Leave group"
            }
          />
        </section>
      </div>
    </main>
  );
}
