import { Link } from "../ui/Link";
import chatBackground from "../../assets/chat_background.png";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
export default function Header() {
  const { language } = useLanguage();
  const Page = translations.Landing.Header;
  return (
    <header
      className="flex min-h-150 px-4 pt-10 items-center flex-col relative"
      style={{ backgroundImage: `url(${chatBackground})` }}
    >
      <div className="inset-0 bg-gray-800/60 absolute backdrop-blur-xs"></div>
      <div className="flex justify-center items-center -mb-6 z-5">
        <img
          className="rounded-full w-auto max-h-60 md:max-h-80 brightness-150"
          src="GoChat_logo.png"
          alt="GoChat logo"
        />
      </div>
      <div className="z-5 flex flex-col items-center">
        <h1 className="text-gray-100 font-medium tracking-tight md:text-6xl text-5xl mb-4 font-rubik">
          {Page[language].Title}{" "}
          <span className="font-bold text-cyan-400">
            {Page[language].Blink}
          </span>
        </h1>
        <p className="text-gray-200 text-center text-lg">
          {Page[language].Subtitle}
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            className={"bg-cyan-600 text-white rounded"}
            route={"/auth/login"}
          >
            {translations.Landing.Header[language].Login}
          </Link>
          <Link
            className={"bg-cyan-600 text-white rounded"}
            route={"/auth/signup"}
          >
            {translations.Landing.Header[language].Signup}
          </Link>
        </div>
      </div>
    </header>
  );
}
