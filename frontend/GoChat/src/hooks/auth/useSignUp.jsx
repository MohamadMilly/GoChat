import { useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";

const signup = async (data) => {
  const response = await api.post("/auth/signup", {
    ...data,
  });
  return response.data;
};

export function useSignUp() {
  return useMutation({
    mutationFn: signup,
    mutationKey: ["signup"],
  });
}
