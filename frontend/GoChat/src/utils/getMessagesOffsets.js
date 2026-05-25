export function getMessagesOffsets() {
  const offsets = localStorage.getItem("offsets");
  return JSON.parse(offsets);
}
