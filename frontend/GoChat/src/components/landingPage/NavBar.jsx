import { NavLink } from "react-router";
import Button from "../ui/Button";
import { Link } from "../ui/Link";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export function NavBar() {
  const { language } = useLanguage();
  const t = translations.Landing.NavBar;
  return (
    <nav className="flex px-4 justify-between items-center bg-white sticky left-0 right-0 top-0 z-10 border-b-2 border-gray-100">
      <div className="flex justify-center items-center">
        <img
          className="w-auto h-16 rounded-full"
          src="./GoChat_logo.png"
          alt="GoChat logo"
        />
      </div>
      <div className="flex items-center gap-2">
        <Link
          className={"bg-cyan-600 text-white rounded text-xs md:text-base"}
          route={"/auth/login"}
        >
          {t[language].Login}
        </Link>
        <Link
          className={"bg-cyan-600 text-white rounded text-xs md:text-base"}
          route={"/auth/signup"}
        >
          {t[language].Signup}
        </Link>
      </div>
    </nav>
  );
}
