import { useAuth } from "../../contexts/AuthContext";
import { socket } from "../../socket";
import { api } from "../../utils/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
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
      socket.auth.userId = data.user.id;
      socket.auth.serverOffset = {};
    },
    onError: (_err, args, context) => {
      toast.error(_err?.response?.data?.message || _err.message);
    },
  });
}
