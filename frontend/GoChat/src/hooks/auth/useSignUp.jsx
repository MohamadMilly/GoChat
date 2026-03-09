import { useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

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
    },
  });
}
