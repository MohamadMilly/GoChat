const prisma = require("../../lib/prisma");
const bcrypt = require("bcryptjs");
const getRandomColor = require("./utils/getRandomColor");
const HttpError = require("../../shared/errors/HttpError");

async function register(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const randomColor = getRandomColor();

  const newUser = await prisma.user.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.username,
      password: hashedPassword,
      profile: {
        create: {},
      },
      preferences: {
        create: {},
      },
      accountColor: randomColor,
    },
  });

  return newUser;
}

async function verifyCredentials(username, password) {
  const existingUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      profile: true,
    },
  });
  if (!existingUser) {
    throw new HttpError("Invalid username or password.", 401);
  }
  const match = await bcrypt.compare(password, existingUser.password);
  if (!match) {
    throw new HttpError("Invalid username or password", 401);
  }
  return existingUser;
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new HttpError("User is not found.", 404);
  }
  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) {
    throw new HttpError("Password is incorrect.", 401);
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: newPassword,
    },
  });

  return updatedUser;
}

module.exports = { register, verifyCredentials, changePassword };
