export function getTypingUsers(
  chatMembers,
  typingUsers,
  currentConversationId,
) {
  if (typingUsers.length <= 0) return [];
  return chatMembers.filter((chatMember) => {
    return typingUsers.some(
      (typingUser) =>
        typingUser.userId == chatMember.userId &&
        typingUser.conversationId == currentConversationId,
    );
  });
}
