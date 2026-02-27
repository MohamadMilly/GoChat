import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Features() {
  const { language } = useLanguage();
  const t = translations.Landing.Features;
  return (
    <>
      <h2 className="font-rubik text-4xl font-bold text-center my-12">
        {t[language].Title}
      </h2>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 my-6">
        <article className="text-lg font-rubik text-gray-700 basis-2xs h-full flex-1">
          {t[language].Item1}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          {t[language].Placeholder}
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 my-6">
        <article className="text-lg font-rubik text-gray-700 basis-2xs h-full flex-1">
          {t[language].Item2}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          {t[language].Placeholder}
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 my-6">
        <article className="text-lg font-rubik text-gray-700 basis-2xs h-full flex-1">
          {t[language].Item3}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          {t[language].Placeholder}
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 my-6">
        <article className="text-lg font-rubik text-gray-700 basis-2xs h-full flex-1">
          {t[language].Item4}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          {t[language].Placeholder}
        </aside>
      </section>
    </>
  );
}
