const filterUser = require("../../../shared/utils/filterUser");

function filterConversationByPermissions(
  conversation,
  participants,
  permissions,
  currentUserAdminData,
  isCurrentUserParticipant,
  type = "GROUP",
) {
  let filteredConversation;
  if (permissions?.viewMembers || !!currentUserAdminData || type === "DIRECT") {
    filteredConversation = {
      ...conversation,
      participants: participants.map((p) => {
        return {
          ...p,
          user: filterUser(
            p.user,
            p.user.preferences,
            permissions,
            isCurrentUserParticipant,
          ),
        };
      }),
    };
  } else {
    filteredConversation = {
      ...conversation,
      participants: [],
    };
  }

  return filteredConversation;
}

module.exports = filterConversationByPermissions;
