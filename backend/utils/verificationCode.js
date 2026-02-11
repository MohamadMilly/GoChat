const prisma = require("../lib/prisma");

const nodemailer = require("nodemailer"); // Email verification

const axios = require("axios");

function generateCode(length = 6) {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
}

async function createVerificationCode(userId, verificationType) {
  const generatedCode = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  const createdCodeData = await prisma.verificationCode.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      code: generatedCode,
      expiresAt: expiresAt,
      type: verificationType,
    },
  });
  return createdCodeData;
}

async function sendEmailVerification(email, code) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your code is ${code}. It expires in 5 minutes.`,
  });
}

async function sendSmsVerification(phoneNumber, code) {
  const url = `${process.env.INFOBIP_API_URL}/sms/2/text/advanced`;

  const payload = {
    messages: [
      {
        from: process.env.INFOBIP_SENDER,
        destinations: [{ to: phoneNumber }],
        text: `Your verification code is ${code}. It expires in 5 minutes.`,
      },
    ],
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    const validationErrors =
      error.response?.data?.requestError?.serviceException?.validationErrors;

    if (validationErrors) {
      console.error("Validation errors:", validationErrors);
      return validationErrors; // return them to caller
    }

    console.error("Failed to send SMS:", error.response?.data || error.message);
    throw error;
  }
}

async function verifyCode(userId, code) {
  const storedCode = await prisma.verificationCode.findUnique({
    where: {
      code_userId: {
        code: code,
        userId: userId,
      },
    },
  });
  if (!storedCode) {
    return false;
  }
  if (storedCode.used) {
    return false;
  }

  const expiresAt = storedCode.expiresAt;
  if (expiresAt < new Date()) {
    return false;
  }
  await prisma.verificationCode.update({
    where: {
      code_userId: {
        code: code,
        userId: userId,
      },
    },
    data: {
      used: true,
    },
  });
  return true;
}

module.exports = {
  generateCode,
  createVerificationCode,
  sendEmailVerification,
  sendSmsVerification,
  verifyCode,
};
