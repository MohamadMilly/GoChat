import { useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { socket } from "../../socket";

const signup = async (data) => {
  const response = await api.post("/auth/signup", {
    ...data,
  });
  return response.data;
};

export function useSignUp() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: signup,
    mutationKey: ["signup"],
    onSuccess: (data) => {
      login(data.token, data.user);
      api.defaults.headers.common["authorization"] = `Bearer ${data.token}`;
      socket.auth.userId = data.user.id;
      socket.auth.serverOffset = {};
    },
    onError: (_err) => {
      toast.error(_err?.response?.data?.message || _err.message);
    },
  });
}
