export function getChatInfo(conversation, currentUserId) {
  const isGroup = conversation.type === "GROUP";
  const messages = conversation?.messages || [];
  const GroupMembers = isGroup ? conversation.paricipants : null;

  const chatPartner = isGroup
    ? null
    : conversation.participants.filter((p) => p.userId !== currentUserId)[0]
        .user;
  const chatTitle = isGroup
    ? conversation.title
    : chatPartner.firstname + " " + chatPartner.lastname;
  const chatAvatar = isGroup
    ? conversation.avatar
    : chatPartner?.profile.avatar || "";
  const lastMessage = messages[messages.length - 1] || "";
  const color = chatPartner?.accountColor || null;
  return {
    chatTitle,
    chatAvatar,
    chatPartner,
    lastMessage,
    GroupMembers,
    messages,
    isGroup,
    color: isGroup ? null : color,
  };
}
