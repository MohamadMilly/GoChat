import { createContext, useCallback, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../socket";
import { useMemo } from "react";

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
  const login = useCallback((token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, []);
  const logout = useCallback(() => {
    setToken("");
    setUser("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.clear();
    socket.disconnect();
  }, [queryClient]);
  const editUser = useCallback(
    (data = {}) => {
      const newUserData = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(newUserData));
      setUser(newUserData);
    },
    [user],
  );
  const contextValue = useMemo(
    () => ({ token, user, login, logout, editUser }),
    [token, user, login, logout, editUser],
  );
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
