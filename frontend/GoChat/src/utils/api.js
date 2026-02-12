import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

if (token) {
  api.defaults.headers.common["authorization"] = `Bearer ${token}`;
}

export { api };
