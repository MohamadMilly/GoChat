const emptyErrorMessage = "shouldn't be empty.";
const notBooleanErrorMessage = "should be a boolean value.";
const notURLErrorMessage = "should be a valid URL.";
const notArrayErrorMessage = "should be an array.";
const lengthBoundariesErrorMessage = "should not be less than";
const notAlphaErrorMessage = "should only contain letter.";
const notAlphaNumericErrorMessage = "should only contain letters and numbers";
const weakPasswordErrorMessage =
  "Password should be at least 8 characters with 1 number and 1 lowercase letter.";
const passwordsDoNotMatchErrorMessage = "Passwords do not match.";
const userNameTakenErrorMessage = "This username is taken.";
const notValidEmailErrorMessage = "Email should be valid.";

module.exports = {
  emptyErrorMessage,
  notBooleanErrorMessage,
  notURLErrorMessage,
  notArrayErrorMessage,
  lengthBoundariesErrorMessage,
  notAlphaErrorMessage,
  notAlphaNumericErrorMessage,
  weakPasswordErrorMessage,
  passwordsDoNotMatchErrorMessage,
  userNameTakenErrorMessage,
  notValidEmailErrorMessage,
};
