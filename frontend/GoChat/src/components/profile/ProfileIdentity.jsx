import { useLanguage } from "../../contexts/LanguageContext";
import translations from "../../translations";

export function ProfileIdentity({ fullname, isConnected, lastSeen }) {
  const { language } = useLanguage();
  return (
    <section className="text-center mt-12">
      <h1 className="text-lg dark:text-gray-50">{fullname}</h1>
      <p
        className={`text-sm ${isConnected ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-200"}  `}
      >
        {isConnected ? (
          translations.Profile[language].OnlineLabel
        ) : (
          <>
            {translations.Profile[language].LastSeenPrefix}{" "}
            {new Date(lastSeen).toLocaleTimeString(
              language === "Arabic" ? "ar-EG" : "en-GB",
            )}
          </>
        )}
      </p>
    </section>
  );
}
