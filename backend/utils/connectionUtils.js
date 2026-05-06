const users = new Map();

function handleConnection(userId) {
  const count = users.get(userId) || 0;
  users.set(userId, count + 1);
  return count === 0;
}
function handleDisconnection(userId) {
  const count = users.get(userId) - 1;
  if (count === 0) {
    users.delete(userId);
  } else {
    users.set(userId, count);
  }
  return count === 0;
}

function getConnectedUsersIds() {
  return [...users.keys()];
}

module.exports = {
  handleConnection,
  handleDisconnection,
  getConnectedUsersIds,
};
