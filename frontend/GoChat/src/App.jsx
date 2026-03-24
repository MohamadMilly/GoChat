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
      <main className="relative grid min-h-screen grid-cols-[1fr_2rem_auto_2rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr] bg-white [--pattern-fg:var(--color-gray-950)]/5 dark:bg-gray-950 dark:[--pattern-fg:var(--color-white)]/10">
        <div className="col-start-3 row-start-3 flex w-full max-w-7xl flex-col bg-gray-100 p-1 dark:bg-white/10 my-12 mx-auto">
          <div className="rounded-xl bg-white p-4 dark:bg-gray-950">
            <Features />
          </div>
        </div>

        <div className="relative -right-px col-start-2 row-span-full row-start-1 border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
        <div className="relative -left-px col-start-4 row-span-full row-start-1 border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
        <div className="relative -bottom-px col-span-full col-start-1 row-start-2 h-px bg-(--pattern-fg)"></div>
        <div className="relative -top-px col-span-full col-start-1 row-start-4 h-px bg-(--pattern-fg)"></div>
      </main>
      <Footer />
    </>
  );
}

export default App;
