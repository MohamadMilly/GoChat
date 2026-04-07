import { useState } from "react";
import { InputField } from "../components/ui/InputField";
import chatBackground from "../assets/chat_background.png";
import darkChatBackground from "../assets/chat_background_dark.png";
import { Link } from "../components/ui/Link";
import Button from "../components/ui/Button";
import { useSignUp } from "../hooks/auth/useSignUp";
import { Navigate } from "react-router";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import { Spinner } from "../components/ui/Spinner";
export function SignUpPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const PageTranslations = translations.SignUpPage;
  const [signupData, setSignupData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    email: "",
    phoneNumber: "",
  });
  let [maxStep, minStep] = [1, 1];
  const [preferredVerification, setPreferredVerification] = useState("email");
  const onFieldChange = (fieldname, e) => {
    setSignupData((prev) => ({
      ...prev,
      [fieldname]: e.target.value,
    }));
  };
  const [step, setstep] = useState(1);
  const {
    mutate: signup,
    isPending: isSigningUp,
    error,
    isSuccess,
    data,
  } = useSignUp();

  const goNext = () => {
    if (step >= maxStep) return;
    setstep((prev) => prev + 1);
  };
  const goBack = () => {
    if (step <= minStep) return;
    setstep((prev) => prev - 1);
  };
  const handleSignUp = (e) => {
    e.preventDefault();
    signup(signupData);
  };
  if (isSuccess) {
    return <Navigate to="/chats" />;
  }
  return (
    <main className="md:flex">
      <ToastContainer position="top-right" draggable={true} autoClose={3000} />
      <section
        className="max-w-250 w-full px-4 hidden md:flex flex-col items-center h-screen relative"
        style={{
          backgroundImage: `url(${theme === "light" ? chatBackground : darkChatBackground})`,
        }}
      >
        <div className="inset-0 z-1 absolute bg-gray-600/60 backdrop-blur-xs"></div>
        <article className="z-10 relative top-1/3">
          <h2
            dir="auto"
            className="text-5xl font-bold tracking-tight text-cyan-100 dark:text-cyan-200 text-shadow-cyan-100 text-shadow-xs mb-6"
          >
            {PageTranslations[language].JoinTitle}
          </h2>
          <p className="max-w-120 text-sm text-gray-100">
            {PageTranslations[language].Description}
          </p>
          <p className="text-xs text-gray-200 mt-6">
            {PageTranslations[language].AlreadyHaveAccount}{" "}
            <Link
              className="text-xs text-cyan-200! border-2 border-cyan-200! bg-white/5! rounded"
              route={"/auth/login"}
            >
              {PageTranslations[language].LogIn}
            </Link>
          </p>
        </article>
      </section>
      <section className="basis-xl md:h-dvh px-4 flex flex-1 flex-col items-center mb-10 md:mb-0 md:overflow-y-auto">
        <h2 className="font-rubik text-4xl font-bold text-center my-10 tracking-tight text-cyan-800 dark:text-cyan-400 ">
          {PageTranslations[language].SignUpButton}
        </h2>
        <form
          onSubmit={handleSignUp}
          className="shadow px-6 py-12 rounded-md w-full max-w-85 border dark:border-gray-800 border-gray-100"
          action="POST"
        >
          {" "}
          <ul className="mx-auto">
            {error?.response?.data?.errors.length > 0 &&
              error.response.data.errors.map((error, index) => {
                return (
                  <li
                    className="text-sm my-0.5 bg-gray-100 dark:bg-gray-800 p-1 rounded list-inside list-disc text-red-600 dark:text-red-500"
                    key={index}
                  >
                    {error.msg}
                  </li>
                );
              })}
          </ul>
          {step === 1 && (
            <section>
              <InputField
                label={PageTranslations[language].Firstname}
                id="firstname"
                name="firstname"
                type="text"
                value={signupData.firstname}
                onChange={(e) => onFieldChange("firstname", e)}
              />
              <InputField
                label={PageTranslations[language].Lastname}
                id="lastname"
                name="lastname"
                type="text"
                value={signupData.lastname}
                onChange={(e) => onFieldChange("lastname", e)}
              />
              <InputField
                label={PageTranslations[language].Username}
                id="username"
                name="username"
                type="text"
                value={signupData.username}
                onChange={(e) => onFieldChange("username", e)}
              />
              <InputField
                label={PageTranslations[language].Password}
                id="password"
                name="password"
                type="password"
                value={signupData.password}
                onChange={(e) => onFieldChange("password", e)}
              />
              <InputField
                label={PageTranslations[language].ConfirmPassword}
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                value={signupData.passwordConfirmation}
                onChange={(e) => onFieldChange("passwordConfirmation", e)}
              />
              <div className="mt-6 mx-auto text-center">
                <Button
                  disabled={isSigningUp}
                  type="submit"
                  className={
                    "border mx-auto flex items-center gap-2 px-4 border-cyan-600 text-base text-cyan-600"
                  }
                >
                  <span>{PageTranslations[language].CreateAccountButton}</span>
                  {isSigningUp && (
                    <Spinner
                      className={"text-cyan-600 dark:text-cyan-400"}
                      size={18}
                    />
                  )}
                </Button>
              </div>
            </section>
          )}
        </form>
        <p className="text-xs dark:text-gray-300 text-gray-600 mt-6 md:hidden">
          {PageTranslations[language].AlreadyHaveAccount}{" "}
          <Link
            className="text-xs dark:text-cyan-200 text-cyan-500 rounded"
            route={"/auth/login"}
          >
            {PageTranslations[language].LogIn}
          </Link>
        </p>
      </section>
    </main>
  );
}
