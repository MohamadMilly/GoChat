import { io } from "socket.io-client";

const user = JSON.parse(localStorage.getItem("user"));

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  import.meta.env.NODE_ENV === "production"
    ? undefined
    : import.meta.env.VITE_API_URL;

export const socket = io(URL, {
  autoConnect: false,
  auth: {
    userId: user ? user.id : undefined,
    serverOffset: {},
  },
});
