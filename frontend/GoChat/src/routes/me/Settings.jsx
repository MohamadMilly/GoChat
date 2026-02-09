import { useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";

export function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative">
      <h2 className="text-lg tracking-tight font-bold text-cyan-600">
        Settings
      </h2>
      <section>
        <h3>Account</h3>
        <Button
          onClick={() => {
            logout();
            navigate("/auth/login");
          }}
        >
          Logout
        </Button>
      </section>
    </main>
  );
}
