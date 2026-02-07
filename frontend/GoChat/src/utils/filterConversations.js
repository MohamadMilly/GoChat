export function filterConversations(conversations, query) {
  if (!query) return conversations;
  const lowerQuery = query.toLowerCase();
  return conversations.filter((conversation) => {
    const isGroup = conversation.type === "GROUP";

    if (isGroup) {
      return conversation.title.toLowerCase().includes(lowerQuery);
    } else {
      return conversation.participants.some((p) => {
        const fullname = p.user.firstname + " " + p.user.lastname;

        return fullname.toLowerCase().includes(lowerQuery);
      });
    }
  });
}
