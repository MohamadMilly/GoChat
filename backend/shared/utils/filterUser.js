const filterProfile = require("./filterProfile");
const hideUser = require("./hideUser");
function filterUser(
  user,
  preferences,
  permissions = {},
  isCurrentUserParticipant = false,
) {
  const hasBlockedMe = user?.bannedUsers?.length > 0;

  if (permissions.hideUsersForVisitors && !isCurrentUserParticipant) {
    return hideUser(user);
  } else {
    return {
      ...user,
      profile: {
        ...filterProfile(user.profile, user.preferences),
        ...(hasBlockedMe ? { profile: null } : {}),
      },
    };
  }
}

module.exports = filterUser;
