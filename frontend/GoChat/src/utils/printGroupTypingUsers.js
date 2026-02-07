export function printGroupTypingUsers(typingUsers) {
  return (
    typingUsers.map((typingUser) => typingUser.user.firstname).join(",") +
    `${typingUsers.length > 2 ? " are typing..." : " is typing..."}`
  );
}
