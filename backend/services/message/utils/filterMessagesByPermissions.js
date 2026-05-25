const filterUser = require("../../../shared/utils/filterUser");

function filterMessagesByPermissions(
  messages,
  permissions,
  isCurrentUserParticipant,
) {
  const filteredMessages = messages.map((message) => {
    return {
      ...message,
      sender: filterUser(
        message.sender,
        message.sender.preferences,
        permissions,
        isCurrentUserParticipant,
      ),
    };
  });
  return filteredMessages;
}

module.exports = filterMessagesByPermissions;
