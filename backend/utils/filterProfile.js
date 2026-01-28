function filterProfile(userOrParticipant, preferences) {
  const userOrParticipantPreferences =
    preferences && Array.isArray(preferences)
      ? preferences.find(
          (p) =>
            p.userId === userOrParticipant?.id ||
            p.userId === userOrParticipant?.userId,
        )
      : undefined;

  const prefs = userOrParticipantPreferences || {};
  const profile = userOrParticipant?.profile || {};

  return {
    ...userOrParticipant,
    profile: {
      avatar: prefs.isAvatarHidden ? "" : profile.avatar || "",
      phoneNumber: prefs.isPhoneNumberHidden ? "" : profile.phoneNumber || "",
      email: prefs.isEmailHidden ? "" : profile.email || "",
      avatarBackground: prefs.isAvatarBackgroundHidden
        ? ""
        : profile.avatarBackground || "",
      bio: prefs.isBioHidden ? "" : profile.bio || "",
      birthday: prefs.isBirthdayHidden ? "" : profile.birthday || "",
    },
  };
}

module.exports = filterProfile;
