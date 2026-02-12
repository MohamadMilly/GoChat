import { useState } from "react";
import { useLogIn } from "../hooks/auth/useLogIn";
import { useVerifyCode } from "../hooks/auth/useVerifyCode";
import { Navigate } from "react-router";

import { InputField } from "../components/ui/InputField";
import { toast, ToastContainer } from "react-toastify";
import chatBackground from "../assets/chat_background.png";
import { Link } from "../components/ui/Link";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

export function LogInPage() {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [code, setCode] = useState("");
  const {
    mutate: login,
    data,
    error: loginError,
    isPending: isLoggingIn,
    isSuccess: isSuccessLogin,
  } = useLogIn();
  const {
    mutate: verify,
    error: verificationError,
    isPending: isVerifying,
    isSuccess: isSuccessVerification,
  } = useVerifyCode();
  const [isLoginSucceed, setIsLogInSucceed] = useState(false);

  let [maxStep, minStep] = [2, 1];
  const [step, setstep] = useState(1);
  const goNext = () => {
    if (step >= maxStep) return;
    setstep((prev) => prev + 1);
  };
  const goBack = () => {
    if (step <= minStep) return;
    setstep((prev) => prev - 1);
  };

  if (isSuccessLogin) {
    if (!isLoginSucceed) {
      goNext();
      toast.success(data.message);
      setIsLogInSucceed(true);
    }
  }
  const onFieldChange = (fieldname, e) => {
    setLoginData((prev) => ({ ...prev, [fieldname]: e.target.value }));
  };
  if (isSuccessVerification) {
    return <Navigate to={"/"} />;
  }

  const handleVerifyCode = (e) => {
    e.preventDefault();
    verify({ code, username: loginData.username });
  };

  return (
    <main className="md:flex">
      <ToastContainer position="top-right" draggable={true} autoClose={3000} />
      <section
        className="max-w-250 w-full px-4 hidden md:flex flex-col items-center h-screen relative"
        style={{ backgroundImage: `url(${chatBackground})` }}
      >
        <div className="inset-0 z-1 absolute bg-gray-800/60 backdrop-blur-xs"></div>
        <article className="z-10 relative top-1/3">
          <h2 className="text-5xl font-bold tracking-tight text-cyan-200 mb-6 text-shadow-xs text-shadow-cyan-100">
            Welcome to GoChat{" "}
          </h2>
          <p className="max-w-120 text-sm text-gray-200">
            If you already have an account , fill the login form with your
            credentials,then wait for the verification code.{" "}
          </p>
          <p className="text-xs text-gray-300 mt-6">
            Don't have an accont?{" "}
            <Link
              className="text-xs text-cyan-200 border-2 border-cyan-200 rounded"
              route={"/auth/signup"}
            >
              Sign up
            </Link>
          </p>
        </article>
      </section>
      <section className="basis-xl px-4 flex flex-1 flex-col items-center">
        <h2 className="font-rubik text-4xl font-bold text-center my-12 tracking-tight text-cyan-800 ">
          Log in
        </h2>
        <form
          onSubmit={handleVerifyCode}
          className="shadow px-6 py-12 rounded-md w-full max-w-85"
          action="POST"
        >
          {step === 1 && (
            <section>
              <InputField
                label={"Username"}
                id="username"
                type={"text"}
                name={"username"}
                value={loginData.username}
                onChange={(e) => onFieldChange("username", e)}
              />
              <InputField
                label={"Password"}
                id="password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={(e) => onFieldChange("password", e)}
              />
              <Button
                className={
                  "block mx-auto mt-6 border border-cyan-600 text-xs text-cyan-600"
                }
                onClick={() => {
                  setIsLogInSucceed(false);
                  login(loginData);
                }}
              >
                Login
              </Button>
            </section>
          )}

          {step === 2 && (
            <section>
              <p className="text-sm text-gray-800">
                We have sent a verification code as{" "}
                {data.preferredVerification === "EMAIL"
                  ? "Email message"
                  : "SMS message"}{" "}
                to{" "}
                <span className="text-cyan-600">
                  {data.phoneNumber || data.email}
                </span>
              </p>
              <InputField
                label={"Verification Code"}
                id="code"
                name="code"
                type={"text"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="mt-6 mx-auto flex items-center gap-x-4">
                <Button
                  onClick={goBack}
                  className={"border border-cyan-600 text-xs text-cyan-600"}
                >
                  Go back and edit
                </Button>
                <Button
                  type="submit"
                  className={"text-xs bg-cyan-600 text-white"}
                >
                  Verify code
                </Button>
              </div>
            </section>
          )}
        </form>
      </section>
    </main>
  );
}
