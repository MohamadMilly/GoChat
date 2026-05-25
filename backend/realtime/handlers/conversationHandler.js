const onCreateConversation = require("../listeners/conversation/createConversation");
const onEditConversation = require("../listeners/conversation/editConversation");
const onEditPermissions = require("../listeners/conversation/editPermissions");
const onJoinConversation = require("../listeners/conversation/joinConversation");
const onJoinConversationBroadcast = require("../listeners/conversation/joinConversationBroadcast");
const onLeaveConversation = require("../listeners/conversation/leaveConversation");
const onStoppedTyping = require("../listeners/conversation/stoppedTyping");
const onTyping = require("../listeners/conversation/typing");

function conversationHandler(socket, io) {
  return {
    "create conversation": (...data) =>
      onCreateConversation(socket, io, ...data),
    "edit conversation": (...data) => onEditConversation(socket, io, ...data),
    "edit permissions": (...data) => onEditPermissions(socket, io, ...data),
    "join conversation": (...data) => onJoinConversation(socket, io, ...data),
    "join conversation broadcast": (...data) =>
      onJoinConversationBroadcast(socket, io, ...data),
    "leave conversation": (...data) => onLeaveConversation(socket, io, ...data),
    "stopped typing": (...data) => onStoppedTyping(socket, io, ...data),
    typing: (...data) => onTyping(socket, io, ...data),
  };
}

module.exports = conversationHandler;
