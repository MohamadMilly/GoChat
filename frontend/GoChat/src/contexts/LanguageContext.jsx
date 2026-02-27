import { useState } from "react";
import { useContext, createContext } from "react";

const LanguageContext = createContext();

const storedLanguageSelection = localStorage.getItem("language");

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    storedLanguageSelection || "English",
  );

  const handleLanguageSet = (value) => {
    setLanguage(value);
    localStorage.setItem("language", value);
  };

  return (
    <LanguageContext value={{ language, handleLanguageSet }}>
      {children}
    </LanguageContext>
  );
}

export const useLanguage = () => useContext(LanguageContext);
