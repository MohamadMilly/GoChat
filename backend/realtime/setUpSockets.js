const messageHandler = require("./handlers/messageHandler");
const conversationHandler = require("./handlers/conversationHandler");
const userHandler = require("./handlers/userHandler");

function setUpSocketsEvents(socket, io) {
  const handlers = {
    ...messageHandler(socket, io),
    ...conversationHandler(socket, io),
    ...userHandler(socket, io),
  };
  Object.entries(handlers).map(([eventName, handler]) => {
    socket.on(eventName, handler);
  });
}

module.exports = setUpSocketsEvents;
