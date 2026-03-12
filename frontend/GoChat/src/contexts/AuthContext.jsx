import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const initialToken = localStorage.getItem("token");
const initialUser = JSON.parse(localStorage.getItem("user"));

const AuthContext = createContext({
  token: undefined,
  user: undefined,
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);
  const queryClient = useQueryClient();
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };
  const logout = () => {
    setToken("");
    setUser("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.clear();
  };
  const editUser = (data = {}) => {
    const newUserData = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };
  return (
    <AuthContext.Provider value={{ token, user, login, logout, editUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
