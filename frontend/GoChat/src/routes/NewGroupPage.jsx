import { useRef, useState } from "react";
import { SearchBar } from "../components/ui/SearchBar";
import { Navigate, useSearchParams } from "react-router";
import { useMyContacts } from "../hooks/useMyContacts";
import { filterUsers } from "../utils/filterUsers";
import { Contact } from "../components/users/Contact";
import { useCreateConversation } from "../hooks/useCreateConversation";

export function NewGroupPage() {
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
    if (step <= minStep) return;
    setStep((prev) => prev - 1);
  };
  const goNext = () => {
    if (step >= maxStep) return;
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
  const handleCreateGroup = (e) => {
    e.preventDefault();
    createGroup({
      participants: selectedMembers,
      ...groupMetaData,
    });
  };
  if (isSuccess && !!data) {
    return <Navigate to={`/chats/${data.conversation.id}`} />;
  }
  return (
    <main>
      <div>
        <button onClick={goBack}>Previous</button>
        <button onClick={goNext}>Next</button>
      </div>
      {step === 1 && <SearchBar query={query} name="contact" />}
      <form
        action="POST
      
      "
        onSubmit={handleCreateGroup}
      >
        {step === 1 && (
          <section>
            <ul>
              {isFetching ? (
                <p>Loading...</p>
              ) : queriedContacts.length > 0 ? (
                queriedContacts.map((c) => {
                  const isSelected = !!selectedMembers.find(
                    (member) => member.id === c.id,
                  );
                  return (
                    <Contact
                      isSelected={isSelected}
                      firstname={c.firstname}
                      lastname={c.lastname}
                      onClick={() => toggleSelectedUser(c)}
                      avatar={c.profile?.avatar || null}
                      key={c.id}
                    />
                  );
                })
              ) : (
                <p>No users are found</p>
              )}
            </ul>
          </section>
        )}
        {step === 2 && (
          <section>
            <div>
              <label htmlFor="avatar">Avatar</label>
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
                type="button"
                onClick={() => avatarInputRef.current.click()}
              >
                Select
              </button>
            </div>
            <div>
              <div>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  onChange={(e) => onFieldChange(e, "title")}
                  value={groupMetaData.title}
                />
              </div>
              <div>
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  onChange={(e) => onFieldChange(e, "description")}
                  value={groupMetaData.description}
                />
              </div>
            </div>
            <button type="submit">Create</button>
          </section>
        )}
      </form>
    </main>
  );
}
