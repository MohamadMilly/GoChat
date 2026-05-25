const { accountColors } = require("../../../shared/constants");

function getRandomColor() {
  const randomColor =
    accountColors[Math.floor(Math.random() * accountColors.length)];
  return randomColor;
}

module.exports = getRandomColor;
