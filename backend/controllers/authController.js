const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");

// verification code utilities
const {
  createVerificationCode,
  sendEmailVerification,
  sendSmsVerification,
  verifyCode,
} = require("../utils/verificationCode");

// pre defined colors for account to choose from randomly whenever a new user create an account
const accountColors = ["#16a34a", "#a855f7", "#d97706", "#1e40af", "#ff4d91"];

const signupPost = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    password,
    passwordConfirmation,
    email,
    phoneNumber,
  } = req.body;
  const randomColor =
    accountColors[Math.floor(Math.random() * (accountColors.length + 1))];
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        password: hashedPassword,
        profile: {
          create: {
            phoneNumber: phoneNumber ? phoneNumber : null,
            email: email ? email : null,
          },
        },
        preferences: {
          create: {
            preferredVerification: phoneNumber ? "PHONE" : "EMAIL",
          },
        },
        accountColor: randomColor,
      },
    });
    const payLoad = {
      user: {
        id: createdUser.id,
        firstname: createdUser.firstname,
        lastname: createdUser.lastname,
        username: createdUser.username,
        email: createdUser.email,
      },
    };
    jwt.sign(payLoad, SECRET_KEY, (err, token) => {
      if (err) {
        return res.json({
          message: "Token error",
        });
      }
      return res.json({
        message: "Your account is created successfully.",
        token: token,
        user: payLoad.user,
      });
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while creating the account.",
      error: err.message,
    });
  }
};

const loginPost = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        preferences: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Username is incorrect." });
    }
    const doesMatch = await bcrypt.compare(password, user.password);
    const doesitMatchDirectly = password === user.password;
    if (!doesMatch && !doesitMatchDirectly) {
      return res.status(401).json({ message: "Password is incorrect." });
    }

    const preferredVerification = user.preferences.preferredVerification;

    const codeData = await createVerificationCode(
      user.id,
      preferredVerification,
    );

    if (preferredVerification === "EMAIL") {
      await sendEmailVerification(user.profile.email, codeData.code);
    } else if (preferredVerification === "PHONE") {
      await sendSmsVerification(user.profile.phoneNumber, codeData.code);
    }

    return res.json({
      message: "Verification code sent.",
      preferredVerification: preferredVerification,
      phoneNumber:
        preferredVerification === "PHONE" ? user.profile?.phoneNumber : "",
      email: preferredVerification === "EMAIL" ? user.profile?.email : "",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unexpected error happened while logging in" });
  }
};

const verifyPost = async (req, res) => {
  const { username, code } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({
        message: "User is not found.",
      });
    }
    const isValid = await verifyCode(user.id, code);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Verification code is incorrect." });
    }

    const payload = {
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      },
    };

    const token = jwt.sign(payload, SECRET_KEY);

    return res.json({ token, user: payload.user });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while verifying",
      error: err,
    });
  }
};

module.exports = {
  loginPost,
  signupPost,
  verifyPost,
};
