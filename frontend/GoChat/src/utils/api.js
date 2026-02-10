import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
console.log(token);
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export { api };
