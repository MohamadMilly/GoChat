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
      reactions: message.reactions.map((reaction) => ({
        ...reaction,
        reactor: {
          ...reaction.reactor,
          user: filterUser(
            reaction.reactor.user,
            reaction.reactor.user.preferences,
            permissions,
            isCurrentUserParticipant,
          ),
        },
      })),
    };
  });
  return filteredMessages;
}

module.exports = filterMessagesByPermissions;
