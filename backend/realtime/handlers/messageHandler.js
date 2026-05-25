const onChatMessage = require("../listeners/message/chatMessage");
const onDeleteMessage = require("../listeners/message/deleteMessage");
const onEditMessage = require("../listeners/message/editMessage");
const onReadMessage = require("../listeners/message/readMessage");
const onReact = require("../listeners/message/addReaction");

function messageHandler(socket, io) {
  return {
    "chat message": (...data) => onChatMessage(socket, io, ...data),
    "delete message": (...data) => onDeleteMessage(socket, io, ...data),
    "edit message": (...data) => onEditMessage(socket, io, ...data),
    "read message": (...data) => onReadMessage(socket, io, ...data),
    reaction: (...data) => onReact(socket, io, ...data),
  };
}

module.exports = messageHandler;
