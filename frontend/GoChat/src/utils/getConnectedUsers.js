export function getConnectedUsers(participants, connectedUsers) {
  return participants.filter((participant) =>
    connectedUsers.some((id) => id == participant.userId),
  );
}
