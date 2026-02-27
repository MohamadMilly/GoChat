import { useRef, useState } from "react";
import { SearchBar } from "../components/ui/SearchBar";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useMyContacts } from "../hooks/me/useMyContacts";
import { filterUsers } from "../utils/filterUsers";
import { Contact } from "../components/users/Contact";
import { useCreateConversation } from "../hooks/useCreateConversation";
import Button from "../components/ui/Button";
import { PlusCircle, Check, Trash } from "lucide-react";
import { InputField } from "../components/ui/InputField";
import { TextArea } from "../components/ui/TextArea";
import { supabase } from "../utils/supabase";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";

export function NewGroupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { language } = useLanguage();
  const { users, isFetching, error } = useMyContacts();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [groupMetaData, setGroupMetaData] = useState({
    title: "",
    avatar: "",
    description: "",
    type: "GROUP",
  });

  const [avatarPreviewURL, setAvatarPreviewURL] = useState(null);
  const {
    mutate: createGroup,
    data,
    isPending: isConversationPending,
    error: conversationError,
    isSuccess,
  } = useCreateConversation();
  const [searchParams] = useSearchParams();
  const avatarInputRef = useRef(null);

  const query = searchParams.get("contact") || "";
  const queriedContacts = !isFetching && filterUsers(users, query);

  const onFieldChange = (e, key) => {
    setGroupMetaData((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };
  const handleCreateGroup = () => {
    createGroup({
      participants: selectedMembers,
      ...groupMetaData,
    });
  };
  const [minStep, maxStep] = [1, 2];
  // wizard navigation
  const goBack = () => {
    if (step < minStep) return;
    if (step === 1) {
      return navigate(-1);
    }
    setStep((prev) => prev - 1);
  };
  const goNext = () => {
    if (step > maxStep) return;
    if (step === 2) {
      handleCreateGroup();
      return;
    }
    setStep((prev) => prev + 1);
  };

  // toggling the selected users
  const toggleSelectedUser = (user) => {
    const existingUser = selectedMembers.find((m) => user.id === m.id);
    if (existingUser) {
      setSelectedMembers((prev) => prev.filter((m) => m.id !== user.id));
    } else {
      setSelectedMembers((prev) => [...prev, user]);
    }
  };
  const handleAvatarSelection = async (e) => {
    const avatarFile = e.target.files[0];
    const previewURL = URL.createObjectURL(avatarFile);
    setAvatarPreviewURL(previewURL);
    try {
      setIsUploadingAvatar(true);
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`${Date.now()}-${avatarFile.name}`, avatarFile);
      if (error) {
        throw new Error(error.message);
      }
      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(data.path);
      setGroupMetaData((prev) => ({
        ...prev,
        avatar: publicUrlData.publicUrl,
      }));
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleResetAvatar = () => {
    setAvatarPreviewURL("");
    setGroupMetaData((prev) => ({ ...prev, avatar: "" }));
    avatarInputRef.current.value = "";
  };
  if (isSuccess && !!data) {
    return <Navigate to={`/chats/group/${data.conversation.id}`} />;
  }
  return (
    <main className="max-w-200 mx-auto bg-white dark:bg-gray-900 font-rubik relative">
      <div className="flex justify-between items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg my-2">
        <Button onClick={goBack} className="text-gray-600 dark:text-gray-300">
          <p className="text-xs">
            {step === 1
              ? translations.NewGroupPage[language].Home
              : translations.NewGroupPage[language].Previous}
          </p>
        </Button>
        <Button onClick={goNext} className={"text-gray-600 dark:text-gray-300"}>
          <p className="text-xs">
            {step === 2 ? (
              <Check size={20} />
            ) : (
              translations.NewGroupPage[language].Next
            )}
          </p>
        </Button>
      </div>
      {step === 1 && (
        <SearchBar
          query={query}
          name="contact"
          label={translations.SearchBar[language].FindUser}
        />
      )}
      <form
        onSubmit={(e) => e.preventDefault()}
        action="POST
        
      "
      >
        {step === 1 && (
          <section className="p-2 mt-4">
            <ul className="w-full flex flex-col animate-slideup divide-y divide-gray-700">
              {isFetching ? (
                <p className="text-xs text-gray-400 dark:text-gray-200 text-center">
                  {translations.NewGroupPage[language].Loading}
                </p>
              ) : queriedContacts.length > 0 ? (
                queriedContacts.map((c) => {
                  const isSelected = !!selectedMembers.find(
                    (member) => member.id === c.id,
                  );
                  return (
                    <Contact
                      isSelected={isSelected}
                      isSelectable={true}
                      firstname={c.firstname}
                      lastname={c.lastname}
                      onClick={() => toggleSelectedUser(c)}
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
          </section>
        )}
        {step === 2 && (
          <section className="p-2 mt-4">
            <div className="flex flex-col gap-2 px-4 py-2 my-4">
              <label
                className="text-sm text-cyan-600 dark:text-cyan-400"
                htmlFor="avatar"
              >
                {translations.EditProfilePage[language].Avatar}
              </label>
              <input
                ref={avatarInputRef}
                type="file"
                id="avatar"
                name="avatar"
                hidden={true}
                accept="image/*"
                onChange={handleAvatarSelection}
              />
              <button
                className="w-40 h-40 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer rounded flex justify-center items-center group"
                type="button"
                onClick={() => avatarInputRef.current.click()}
                disabled={!!groupMetaData.avatar}
              >
                {groupMetaData.avatar || avatarPreviewURL ? (
                  <div className="relative w-full h-full rounded">
                    {isUploadingAvatar ? (
                      <div className="absolute inset-0 rounded bg-gray-900/60 flex justify-center items-center ">
                        <span className="text-xs text-white">
                          {translations.NewGroupPage[language].Uploading}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute opacity-0 inset-0 rounded justify-center items-center flex bg-gray-900/60 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300">
                        <Button
                          onClick={handleResetAvatar}
                          className={
                            "w-15 h-15 rounded-full! text-red-600 bg-white/10 border border-white/20 flex justify-center items-center"
                          }
                        >
                          <Trash size={30} />
                        </Button>
                      </div>
                    )}

                    <img
                      className="object-cover w-full h-full rounded"
                      src={groupMetaData.avatar || avatarPreviewURL}
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-center flex-col gap-2 text-[#99a1af] dark:text-gray-200">
                    <PlusCircle size={24} />
                    <span className="text-xs">
                      {translations.NewGroupPage[language].ClickToUploadImage}
                    </span>
                  </div>
                )}
              </button>
            </div>

            <InputField
              id="title"
              label={translations.NewGroupPage[language].Title}
              onChange={(e) => onFieldChange(e, "title")}
              value={groupMetaData.title}
              name={"title"}
              labelClassName={"text-cyan-600 dark:text-cyan-400"}
              inputClassName="outline-2 outline-gray-200/50 dark:outline-gray-200/20 rounded text-sm px-2 py-1 mt-2 focus:outline-cyan-600/50 dark:focus:outline-cyan-400/50 focus:outline-offset-2 transition-all text-gray-700 dark:text-gray-100"
            />
            <TextArea
              id={"description"}
              label={translations.NewGroupPage[language].Description}
              onChange={(e) => onFieldChange(e, "description")}
              name={"description"}
              value={groupMetaData.description}
              labelClassName="text-cyan-600/80 dark:text-cyan-400/80"
              isOptional={true}
            />
          </section>
        )}
      </form>
    </main>
  );
}
