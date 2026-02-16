import { useRef, useState } from "react";
import { SearchBar } from "../components/ui/SearchBar";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useMyContacts } from "../hooks/me/useMyContacts";
import { filterUsers } from "../utils/filterUsers";
import { Contact } from "../components/users/Contact";
import { useCreateConversation } from "../hooks/useCreateConversation";
import Button from "../components/ui/Button";
import { PlusCircle, Check } from "lucide-react";
import { InputField } from "../components/ui/InputField";
import { TextArea } from "../components/ui/TextArea";

export function NewGroupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { users, isFetching, error } = useMyContacts();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupMetaData, setGroupMetaData] = useState({
    title: "",
    avatar: "",
    description: "",
    type: "GROUP",
  });

  const [avatarFile, setAvatarFile] = useState(null);
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
  const handleAvatarSelection = (e) => {
    setAvatarFile(e.target.files[0]);
  };
  const handleCreateGroup = () => {
    createGroup({
      participants: selectedMembers,
      ...groupMetaData,
    });
  };
  if (isSuccess && !!data) {
    return <Navigate to={`/chats/group/${data.conversation.id}`} />;
  }
  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative">
      <div className="flex justify-between items-center p-2 bg-gray-50/30 rounded-lg my-2">
        <Button onClick={goBack} className="text-gray-600">
          <p className="text-xs text-gray-500">
            {step === 1 ? "Home" : "Previous"}
          </p>
        </Button>
        <Button onClick={goNext} className={"text-gray-600"}>
          <p className="text-xs text-gray-500">
            {step === 2 ? <Check size={20} /> : "Next"}
          </p>
        </Button>
      </div>
      {step === 1 && (
        <SearchBar query={query} name="contact" label="Find User" />
      )}
      <form
        onSubmit={(e) => e.preventDefault()}
        action="POST
      
      "
      >
        {step === 1 && (
          <section className="p-2 mt-4">
            <ul className="w-full flex flex-col animate-slideup">
              {isFetching ? (
                <p className="text-xs text-gray-400 text-center">Loading...</p>
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
                <p className="text-xs text-center text-gray-400">
                  No users are found
                </p>
              )}
            </ul>
          </section>
        )}
        {step === 2 && (
          <section className="p-2 mt-4">
            <div className="flex flex-col gap-2 px-4 py-2 my-4">
              <label className="text-sm text-cyan-600" htmlFor="avatar">
                Avatar
              </label>
              <input
                ref={avatarInputRef}
                type="file"
                id="avatar"
                name="avatar"
                hidden={true}
                accept="image/*"
                onChange={handleAvatarSelection}
                value={groupMetaData.avatar}
              />
              <button
                className="w-40 h-40 bg-gray-100 rounded flex justify-center items-center"
                type="button"
                onClick={() => avatarInputRef.current.click()}
              >
                {groupMetaData.avatar ? (
                  <img src={groupMetaData.avatar} />
                ) : (
                  <PlusCircle size={24} color="#99a1af" />
                )}
              </button>
            </div>

            <InputField
              id="title"
              label={"Title"}
              onChange={(e) => onFieldChange(e, "title")}
              value={groupMetaData.title}
              name={"title"}
              labelClassName={"text-cyan-600"}
              inputClassName="outline-2 outline-gray-200/50 rounded text-sm px-2 py-1 mt-2 focus:outline-cyan-600/50 focus:outline-offset-2 transition-all text-gray-700"
            />
            <TextArea
              id={"description"}
              label={"Describtion"}
              onChange={(e) => onFieldChange(e, "description")}
              name={"description"}
              value={groupMetaData.description}
              labelClassName="text-cyan-600/80"
              isOptional={true}
            />
          </section>
        )}
      </form>
    </main>
  );
}
