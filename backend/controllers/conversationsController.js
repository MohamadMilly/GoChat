const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const prisma = require("../lib/prisma");
const filterProfile = require("../utils/filterProfile");

const getSpecificConversationGet = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const participantsIds = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      select: {
        userId: true,
      },
    });
    const participantsPreferences = await prisma.preferences.findMany({
      where: {
        userId: {
          in: participantsIds.map((p) => p.userId),
        },
      },
    });

    let conversation = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                profile: true,
                firstname: true,
                lastname: true,
                username: true,
                accountColor: true,
              },
            },
          },
        },
      },
    });
    if (!conversation) {
      return res.status(404).json({
        message: "Conversation is not found.",
      });
    }
    const membersCount = await prisma.conversationParticipant.count({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    conversation = {
      ...conversation,
      participants: conversation.participants.map((particiant) => ({
        ...particiant,
        user: filterProfile(particiant.user, participantsPreferences),
      })),
    };

    return res.json({
      conversation: conversation,
      membersCount,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      message: "Unexpected error happened while getting the conversation",
    });
  }
};

const createNewConversationPost = async (req, res) => {
  const currentUser = req.currentUser;
  const { participants, type, title, avatar, description } = req.body;
  const participantsWithMe = [currentUser, ...participants];
  const membersCount = participantsWithMe.length;
  const isOnetoOneChat = membersCount === 2 && type === "DIRECT";

  if (isOnetoOneChat) {
    const [userAId, userBId] = participantsWithMe.map((p) => p.id);

    const oneToOneChat = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: userAId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: userBId,
              },
            },
          },
          {
            participants: {
              every: {
                userId: {
                  in: [userAId, userBId],
                },
              },
            },
          },
        ],
        type: "DIRECT",
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: true,
      },
    });
    if (oneToOneChat) {
      const participantsPreferences = await prisma.preferences.findMany({
        where: {
          userId: {
            in: oneToOneChat.participants.map((p) => p.userId),
          },
        },
      });
      const filteredParticipants = oneToOneChat.participants.map(
        (participant) => ({
          ...participant,
          user: filterProfile(participant.user, participantsPreferences),
        }),
      );

      return res.json({
        conversation: {
          ...oneToOneChat,
          participants: filteredParticipants,
        },
      });
    }
  }
  try {
    let createdConversation = await prisma.conversation.create({
      data: {
        avatar: avatar || undefined,
        title: title || undefined,
        description: description || undefined,
        type: type,
        participants: {
          create: participantsWithMe.map((p) => ({
            user: {
              connect: {
                id: p.id,
              },
            },
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: true,
      },
    });
    const participantsPreferences = await prisma.preferences.findMany({
      where: {
        userId: {
          in: createdConversation.participants.map((p) => p.userId),
        },
      },
    });

    const filteredParticipants = createdConversation.participants.map(
      (participant) => ({
        ...participant,
        user: filterProfile(participant.user, participantsPreferences),
      }),
    );

    return res.json({
      conversation: {
        ...createdConversation,
        participants: filteredParticipants,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while creating the conversation.",
    });
  }
};

const queryGroupsGet = async (req, res) => {
  const { title } = req.query;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        AND: [
          {
            title: {
              contains: title,
            },
          },
          { type: "GROUP" },
        ],
      },
    });
    return res.json({
      conversations: conversations,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting the conversations",
    });
  }
};

const joinConversationPost = async (req, res) => {
  const currentUser = req.currentUser;
  const conversationId = req.params.conversationId;
  try {
    const conversationParticipant = await prisma.conversationParticipant.create(
      {
        data: {
          user: {
            connect: {
              id: currentUser.id,
            },
          },
          conversation: {
            connect: {
              id: parseInt(conversationId),
            },
          },
        },
      },
    );
    if (conversationParticipant) {
      return res.json({
        message: "You have successfully joined the conversation",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while joining this conversation.",
    });
  }
};

module.exports = {
  createNewConversationPost,
  getSpecificConversationGet,
  queryGroupsGet,
  joinConversationPost,
};
