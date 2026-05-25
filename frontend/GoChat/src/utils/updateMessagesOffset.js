import { getMessagesOffsets } from "./getMessagesOffsets";

export function updateMessagesOffset(conversationId, offset) {
  const offsets = getMessagesOffsets();
  offsets[conversationId.toString()] = offset;
  localStorage.setItem("offsets", JSON.stringify(offsets));
}
