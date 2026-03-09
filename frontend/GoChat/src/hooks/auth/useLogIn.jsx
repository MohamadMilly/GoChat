import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../utils/api";
import { useMutation } from "@tanstack/react-query";

const login = async (data) => {
  const response = await api.post("/auth/login", {
    ...data,
  });
  return response.data;
};

export function useLogIn() {
  const { login: loginInLocalStorage } = useAuth();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      loginInLocalStorage(data.token, data.user);
      api.defaults.headers.common["authorization"] = `Bearer ${data.token}`;
    },
  });
}
