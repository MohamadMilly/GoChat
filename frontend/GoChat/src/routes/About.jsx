import { Link } from "../components/ui/Link";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";

export function About() {
  const { language } = useLanguage();
  const t = translations.AboutPage;
  return (
    <main
      dir="auto"
      className="max-w-200 mx-auto p-6  bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
             dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] 
             [background-size:16px_16px] h-full border-x border-[#e5e7eb] dark:border-[#1e293b]"
    >
      <h2 className="font-rubik sm:text-4xl text-3xl text-cyan-600 dark:text-cyan-400 font-bold text-center my-8 sm:my-12">
        {t[language].Title}
      </h2>
      <article>
        <p className="sm:text-lg text-base text-gray-700 dark:text-gray-200 text-balance text-center">
          {t[language].Body}
        </p>
        <aside className="flex justify-between w-full max-w-120 mx-auto shrink-0 mt-8 border border-cyan-600 dark:border-cyan-400 rounded-full overflow-hidden">
          <Link
            route={"https://github.com"}
            className="text-gray-700 text-center grow p-3! text-xs md:text-base bg-gray-50"
          >
            {t[language].Github}
          </Link>
          <Link
            route={"https://t.me/V_7oz"}
            className="text-gray-700 text-xs text-center p-3! grow md:text-base bg-gray-50"
          >
            {t[language].Telegram}
          </Link>
        </aside>
      </article>
    </main>
  );
}
