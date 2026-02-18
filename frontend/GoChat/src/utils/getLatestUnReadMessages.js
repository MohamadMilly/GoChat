export function getLatestUnReadMessages(currentUserId, messages) {
  if (!messages) return [];
  const lastIndexOfReadMessage = messages.findLastIndex((message) => {
    const isReadByCurrentUser = message.readers?.some(
      (reader) => reader.id === currentUserId,
    );
    const isMyMessage = message.sender.id === currentUserId;

    return isReadByCurrentUser || isMyMessage;
  });
  let unReadMessagesCount = messages.length - 1 - lastIndexOfReadMessage;

  return [unReadMessagesCount, lastIndexOfReadMessage];
}
