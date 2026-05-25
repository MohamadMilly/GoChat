function hideUser(user) {
  let hiddenUser = {
    ...user,
    id: null,
    firstname: "Hidden",
    lastname: "",
    username: "hidden_username",
    profile: {
      ...user.profile,
      avatar: "",
      avatarBackground: "",
      email: "hidden@gmail.com",
      phoneNumber: "##########",
    },
  };

  return hiddenUser;
}

module.exports = hideUser;
