function filterProfile(profile, prefs) {
  return {
    ...profile,
    avatar: prefs.isAvatarHidden ? "" : profile.avatar || "",
    phoneNumber: prefs.isPhoneNumberHidden ? "" : profile.phoneNumber || "",
    email: prefs.isEmailHidden ? "" : profile.email || "",
    avatarBackground: prefs.isAvatarBackgroundHidden
      ? ""
      : profile.avatarBackground || "",
    bio: prefs.isBioHidden ? "" : profile.bio || "",
    birthday: prefs.isBirthdayHidden ? "" : profile.birthday || "",
  };
}

module.exports = filterProfile;
