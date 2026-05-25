function giveParticipantsWithRoles(participants, admins) {
  const formattedParticipants = participants.map((p) => {
    const participantAdminData = admins.find(
      (admin) => admin.userId === p.userId,
    );

    return {
      ...p,
      isAdmin: !!participantAdminData,
      isOwner: participantAdminData ? participantAdminData.isOwner : false,
    };
  });

  return formattedParticipants;
}

module.exports = giveParticipantsWithRoles;
