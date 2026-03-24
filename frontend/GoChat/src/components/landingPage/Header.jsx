import { Link } from "../ui/Link";
import chatBackground from "../../assets/chat_background.png";
import darkChatBackground from "../../assets/chat_background_dark.png";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
export default function Header() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const Page = translations.Landing.Header;
  return (
    <header
      className="flex min-h-150 px-4 pt-10 items-center flex-col relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
             dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-white dark:bg-slate-950 [background-size:16px_16px] shadow-inner shadow-gray-100/50 dark:shadow-gray-800/50"
      style={{
        backgroundRepeat: "repeat",
      }}
    >
      <div className="flex justify-center items-center -mb-6 z-5">
        <img
          className="rounded-full w-auto max-h-60 md:max-h-80 drop-shadow-cyan-300/30 animate-slideup drop-shadow-2xl"
          src="GoChat_logo.png"
          alt="GoChat logo"
        />
      </div>
      <div className="z-5 flex flex-col items-center">
        <h1 className="dark:text-gray-100 text-gray-800 font-medium tracking-tight sm:text-6xl text-5xl mb-4 font-rubik text-balance text-center">
          {Page[language].Title}{" "}
          <span className="font-bold text-cyan-600">
            {Page[language].Blink}
          </span>
        </h1>
        <p className="dark:text-gray-200 text-gray-400 text-center text-lg">
          {Page[language].Subtitle}
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            className={
              "bg-gray-50! dark:bg-transparent! shadow-inner! shadow-cyan-600/10! border border-cyan-600 text-cyan-600! rounded"
            }
            route={"/auth/login"}
          >
            {translations.Landing.Header[language].Login}
          </Link>
          <Link
            className={
              "bg-cyan-600! dark:text-white backdrop-blur-lg shadow-inner! shadow-gray-50/30! border border-cyan-500 text-gray-100 rounded"
            }
            route={"/auth/signup"}
          >
            {translations.Landing.Header[language].Signup}
          </Link>
        </div>
      </div>
    </header>
  );
}
