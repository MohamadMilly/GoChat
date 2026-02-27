import { Link } from "../components/ui/Link";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";

export function About() {
  const { language } = useLanguage();
  const t = translations.AboutPage;
  return (
    <main className="max-w-200 mx-auto p-6">
      <h2 className="font-rubik text-4xl text-cyan-600 font-bold text-center my-12">
        {t[language].Title}
      </h2>
      <article>
        <p className="text-lg text-gray-700">{t[language].Body}</p>
        <aside className="flex justify-between w-full max-w-120 mx-auto shrink-0 mt-6 border-2 border-cyan-500 rounded-md p-3">
          <Link
            route={"https://github.com/MohamadMilly"}
            className="text-cyan-600 text-sm md:text-base rounded"
          >
            {t[language].Github}
          </Link>
          <Link
            route={"https://t.me/Mohamadmilly"}
            className="text-cyan-600 text-sm md:text-base rounded"
          >
            {t[language].Telegram}
          </Link>
        </aside>
      </article>
    </main>
  );
}
