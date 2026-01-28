import { Navigate } from "react-router";
import { useAuth } from "./contexts/AuthContext";
import { NavBar } from "./components/landingPage/NavBar";
import Header from "./components/landingPage/Header";
import Features from "./components/landingPage/Features";
import Footer from "./components/landingPage/Footer";

function App() {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/chats" />;
  }
  return (
    <>
      <NavBar />
      <Header />
      <main className="p-6">
        <Features />
      </main>
      <Footer />
    </>
  );
}

export default App;
