const onBlockUser = require("../listeners/user/blockUser");
const onUnblockUser = require("../listeners/user/unblockUser");
const onRecover = require("../listeners/user/recover");
const onDisconnect = require("../listeners/user/disconnect");

function userHandler(socket, io) {
  return {
    "block user": (...data) => onBlockUser(socket, io, ...data),
    "unblock user": (...data) => onUnblockUser(socket, io, ...data),
    disconnect: (...data) => onDisconnect(socket, io, ...data),
  };
}

module.exports = userHandler;
