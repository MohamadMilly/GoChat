import { useState } from "react";
import { InputField } from "../components/ui/InputField";
import chatBackground from "../assets/chat_background.png";
import { Link } from "../components/ui/Link";
import Button from "../components/ui/Button";
import { useSignUp } from "../hooks/auth/useSignUp";
import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";

export function SignUpPage() {
  const { language } = useLanguage();
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
  let [maxStep, minStep] = [3, 1];
  const [preferredVerification, setPreferredVerification] = useState("email");
  const onFieldChange = (fieldname, e) => {
    setSignupData((prev) => ({
      ...prev,
      [fieldname]: e.target.value,
    }));
  };
  const [step, setstep] = useState(1);
  const { mutate: signup, isPending, error, isSuccess, data } = useSignUp();
  const { login } = useAuth();
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
    login(data.token, data.user);
    return <Navigate to="/chats" />;
  }
  return (
    <main className="md:flex">
      <section
        className="max-w-250 w-full px-4 hidden md:flex flex-col items-center h-screen relative"
        style={{ backgroundImage: `url(${chatBackground})` }}
      >
        <div className="inset-0 z-1 absolute bg-gray-800/60 backdrop-blur-xs"></div>
        <article className="z-10 relative top-1/3">
          <h2 className="text-5xl font-bold tracking-tight text-cyan-200 text-shadow-cyan-100 text-shadow-xs mb-6">
            {PageTranslations[language].JoinTitle}
          </h2>
          <p className="max-w-120 text-sm text-gray-200">
            {PageTranslations[language].Description}
          </p>
          <p className="text-xs text-gray-300 mt-6">
            {PageTranslations[language].AlreadyHaveAccount}{" "}
            <Link
              className="text-xs text-cyan-200 border-2 border-cyan-200 rounded"
              route={"/auth/login"}
            >
              {PageTranslations[language].LogIn}
            </Link>
          </p>
        </article>
      </section>
      <section className="basis-xl px-4 flex flex-1 flex-col items-center">
        <h2 className="font-rubik text-4xl font-bold text-center my-10 tracking-tight text-cyan-800 ">
          {PageTranslations[language].SignUpButton}
        </h2>
        <form
          onSubmit={handleSignUp}
          className="shadow px-6 py-12 rounded-md w-full max-w-85"
          action="POST"
        >
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
                  onClick={goNext}
                  className={"border border-cyan-600 text-xs text-cyan-600"}
                >
                  {PageTranslations[language].Next}
                </Button>
              </div>
            </section>
          )}

          {step === 2 && preferredVerification === "email" && (
            <section>
              <InputField
                label={PageTranslations[language].Email}
                id="email"
                name="email"
                type="email"
                value={signupData.email}
                onChange={(e) => onFieldChange("email", e)}
              />
              <div className="mt-6 mx-auto flex items-center gap-x-4">
                <Button
                  onClick={goBack}
                  className={"border border-cyan-600 text-xs text-cyan-600"}
                >
                  {translations.Common[language].GoBack}
                </Button>
                <Button
                  onClick={() => setPreferredVerification("phoneNumber")}
                  className={"text-xs bg-cyan-600 text-white"}
                >
                  {PageTranslations[language].ContinueWithPhone}
                </Button>
                <Button
                  onClick={goNext}
                  className={"text-xs border border-cyan-600 text-cyan-600"}
                >
                  {PageTranslations[language].Next}
                </Button>
              </div>
            </section>
          )}

          {step === 2 && preferredVerification === "phoneNumber" && (
            <section>
              <InputField
                label={PageTranslations[language].PhoneNumber}
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={signupData.phoneNumber}
                onChange={(e) => onFieldChange("phoneNumber", e)}
              />
              <div className="mt-6 mx-auto flex items-center gap-x-4">
                <Button
                  onClick={goBack}
                  className={"border border-cyan-600 text-xs text-cyan-600"}
                >
                  {translations.Common[language].GoBack}
                </Button>
                <Button
                  onClick={() => setPreferredVerification("email")}
                  className={"text-xs bg-cyan-600 text-white"}
                >
                  {PageTranslations[language].ContinueWithEmail}
                </Button>
                <Button
                  onClick={goNext}
                  className={"text-xs border border-cyan-600 text-cyan-600"}
                >
                  {PageTranslations[language].Next}
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <div className="text-center">
                <p className="text-sm text-gray-800 mb-6">
                  {PageTranslations[language].YouMadeIt}
                </p>
                <Button
                  type="submit"
                  className={"text-xs bg-cyan-600 text-white"}
                >
                  {PageTranslations[language].CreateAccountButton}
                </Button>
              </div>
            </section>
          )}
        </form>
      </section>
    </main>
  );
}
