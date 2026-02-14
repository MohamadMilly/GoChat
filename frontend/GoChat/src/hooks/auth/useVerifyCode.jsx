import { useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const verifyCode = async ({ code, username }) => {
  const response = await api.post("/auth/login/verification", {
    code: code,
    username: username,
  });
  return response.data;
};

export function useVerifyCode() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: verifyCode,
    onSuccess: (data) => {
      console.log(data);
      login(data.token, data.user);
      api.defaults.headers.common["authorization"] = `Bearer ${data.token}`;
    },
    onError: (error) => {
      console.error("Veification failed: ", error);
    },
  });
}
