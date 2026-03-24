import { Link } from "../ui/Link";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations.Landing.Footer;
  return (
    <footer className="min-h-75 bg-gray-100 dark:bg-gray-700/5 dark:border-t border-gray-700/40 p-6 mt-12 flex flex-col">
      <div className="flex justify-start max-w-120 w-full mx-auto">
        <img
          className="w-24 h-auto"
          src={"./GoChat_logo.png"}
          alt="GoChat logo"
        />
      </div>
      <div className="flex justify-between w-full max-w-120 mx-auto shrink-0 mt-6 border border-cyan-600 dark:border-cyan-400 rounded-full overflow-hidden">
        <Link
          route={"/about"}
          className="text-gray-700 text-center grow p-3! text-xs md:text-base bg-gray-50"
        >
          {t[language].About}
        </Link>
        <Link
          route={"https://t.me/Mohamadmilly"}
          className="text-gray-700 text-xs text-center p-3! grow md:text-base bg-gray-50"
        >
          {t[language].Contact}
        </Link>
      </div>
      <p className="mt-auto text-center text-gray-700 text-sm dark:text-gray-100">
        GoChat | {new Date().getFullYear()}
      </p>
    </footer>
  );
}
