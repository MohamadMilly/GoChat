import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import feature1Image from "../../assets/feature-1.png";
import feature2Image from "../../assets/feature-2.png";
import feature3Image from "../../assets/feature-3.png";
import feature4Image from "../../assets/feature-4.png";
import feature5Image from "../../assets/feature-5.png";
import feature6Image from "../../assets/feature-6.png";
import feature7Image from "../../assets/feature-7.png";
import feature8Image from "../../assets/feature-8.png";
import feature9Image from "../../assets/feature-9.png";
export default function Features() {
  const { language } = useLanguage();
  const t = translations.Landing.Features;
  return (
    <>
      <h2 className="font-rubik text-4xl font-bold text-center my-12 dark:text-white">
        {t[language].Title}
      </h2>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 dark:border-gray-800 border-gray-200 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          {t[language].Item1}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img className="" src={feature1Image} alt="feature 1 preview" />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          {t[language].Item2}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img
            className="object-cover"
            src={feature2Image}
            alt="feature 2 preview"
          />
        </aside>
      </section>

      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          {t[language].Item4}
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature3Image} />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          change theme and language from the general settings in settings page.
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature4Image} />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          Send Images , files , and videos with supported file formats like PDFs
          , JSON , and ZIP .
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature5Image} />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          You don't have to join anonymous group just to see the messages ,
          preview the group before joining it !
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature6Image} />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          Know your message seen status by a double checkmark and know who has
          seen it by the readers menu.
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature7Image} />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          Reply to others messages by dragging the message.
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature8Image} />
        </aside>
      </section>
      <section className="flex items-center justify-between flex-wrap gap-10 max-w-200 mx-auto pb-6 border-b-2 border-gray-200 dark:border-gray-800 my-6">
        <article className="text-lg font-rubik text-gray-700 dark:text-gray-200 basis-2xs h-full flex-1">
          Built-in preview for images
        </article>
        <aside className="flex justify-center items-center rounded bg-gray-700/10 w-full max-w-100 h-100 shrink-0">
          <img src={feature9Image} />
        </aside>
      </section>
    </>
  );
}
