import { useState } from "react";
import { useLogIn } from "../hooks/auth/useLogIn";
import { useVerifyCode } from "../hooks/auth/useVerifyCode";
import { Navigate } from "react-router";

import { InputField } from "../components/ui/InputField";
import { ToastContainer } from "react-toastify";
import chatBackground from "../assets/chat_background.png";
import darkChatBackground from "../assets/chat_background_dark.png";
import { Link } from "../components/ui/Link";
import Button from "../components/ui/Button";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

export function LogInPage() {
  const { language } = useLanguage();
  const PageTranslations = translations.LogInPage;
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const { theme } = useTheme();
  // const [code, setCode] = useState("");
  const {
    mutate: login,
    data,
    error: loginError,
    isPending: isLoggingIn,
    isSuccess: isSuccessLogin,
  } = useLogIn();
  /* const {
    mutate: verify,
    error: verificationError,
    isPending: isVerifying,
    isSuccess: isSuccessVerification,
  } = useVerifyCode(); */
  // const [isLoginSucceed, setIsLogInSucceed] = useState(false);

  /* let [maxStep, minStep] = [2, 1];
  const [step, setstep] = useState(1);
  const goNext = () => {
    if (step >= maxStep) return;
    setstep((prev) => prev + 1);
  };
  const goBack = () => {
    if (step <= minStep) return;
    setstep((prev) => prev - 1);
  };
  */
  if (isSuccessLogin) {
    return <Navigate to={"/chats"} />;
  }
  const onFieldChange = (fieldname, e) => {
    setLoginData((prev) => ({ ...prev, [fieldname]: e.target.value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(loginData);
  };

  return (
    <main className="md:flex ">
      <ToastContainer position="top-right" draggable={true} autoClose={3000} />
      <section
        className="max-w-250 w-full px-4 hidden md:flex flex-col items-center h-screen relative"
        style={{
          backgroundImage: `url(${theme === "light" ? chatBackground : darkChatBackground})`,
        }}
      >
        <div className="inset-0 z-1 absolute bg-gray-800/60 backdrop-blur-xs"></div>
        <article className="z-10 relative top-1/3">
          <h2
            dir="auto"
            className="text-5xl font-bold tracking-tight text-cyan-200 mb-6 text-shadow-xs text-shadow-cyan-100"
          >
            {PageTranslations[language].Welcome}
          </h2>
          <p className="max-w-120 text-sm text-gray-200">
            {PageTranslations[language].Description}
          </p>
          <p className="text-xs text-gray-300 mt-6">
            {translations.LogInPage[language].DontHaveAccount}{" "}
            <Link
              className="text-xs text-cyan-200 border-2 border-cyan-200 bg-white/5 rounded"
              route={"/auth/signup"}
            >
              {PageTranslations[language].SignUp}
            </Link>
          </p>
        </article>
      </section>
      <section className="basis-xl px-4 flex flex-1 flex-col items-center">
        <h3 className="font-rubik text-4xl font-bold text-center my-12 tracking-tight text-cyan-800 dark:text-cyan-400 ">
          {PageTranslations[language].LogInButton}
        </h3>
        <form
          onSubmit={handleLoginSubmit}
          className="shadow px-6 py-12 rounded-md w-full max-w-85 border border-gray-100 dark:border-gray-800"
          action="POST"
        >
          <section>
            <InputField
              label={PageTranslations[language].Username}
              id="username"
              type={"text"}
              name={"username"}
              value={loginData.username}
              onChange={(e) => onFieldChange("username", e)}
            />
            <InputField
              label={PageTranslations[language].Password}
              id="password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={(e) => onFieldChange("password", e)}
            />
            <Button
              type="submit"
              className={
                "block mx-auto mt-6 border border-cyan-600 dark:border-cyan-400 text-xs text-cyan-600 dark:text-cyan-400!"
              }
            >
              {PageTranslations[language].LoginButton}
            </Button>
          </section>
        </form>
      </section>
    </main>
  );
}
