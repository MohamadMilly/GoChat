const { body } = require("express-validator");

const errorMessages = require("../utils/errorMessages");

const prisma = require("../lib/prisma");

const validateFirstName = body("firstname")
  .trim()
  .notEmpty()
  .withMessage(`Firstname ${errorMessages.emptyErrorMessage}`)
  .isAlpha()
  .withMessage(`Firstname ${errorMessages.notAlphaErrorMessage}`);
const validateLastName = body("lastname")
  .trim()
  .notEmpty()
  .withMessage(`Lastname ${errorMessages.emptyErrorMessage}`)
  .isAlpha()
  .withMessage(`Lastname ${errorMessages.notAlphaErrorMessage}`);
const validateUserName = body("username")
  .trim()
  .notEmpty()
  .withMessage(`Username ${errorMessages.emptyErrorMessage}`)
  .isAlphanumeric()
  .withMessage(`Username ${errorMessages.notAlphaNumericErrorMessage}`)
  .custom(async (value, { req }) => {
    const existingUserName = await prisma.user.findUnique({
      where: {
        username: value,
      },
    });
    if (existingUserName) {
      throw new Error(errorMessages.userNameTakenErrorMessage);
    } else {
      return true;
    }
  });

/* 
const validateEmail = body("email")
  .isEmail()
  .withMessage(errorMessages.notValidEmailErrorMessage);
  */

const validatePassword = body("password")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  .withMessage(errorMessages.weakPasswordErrorMessage);

const validatePasswordConfirmation = body("passwordConfirmation").custom(
  (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error(errorMessages.passwordsDoNotMatchErrorMessage);
    } else {
      return true;
    }
  },
);

const validateSignUp = [
  validateFirstName,
  validateLastName,
  validateUserName,
  validatePassword,
  validatePasswordConfirmation,
];

module.exports = validateSignUp;
