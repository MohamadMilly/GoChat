import { Navigate, useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";

import {
  ArrowBigLeft,
  Languages,
  LogOut,
  Palette,
  RotateCcwKey,
  Trash,
} from "lucide-react";

import { useLanguage } from "../../contexts/LanguageContext";

import { toast, ToastContainer } from "react-toastify";
import translations from "../../translations";
import { LanguageButton } from "../../components/settings/LanguageButton";
import { ThemeButton } from "../../components/settings/ThemeButton";
import { DeleteAccountButton } from "../../components/settings/DeleteAccountButton";
import { MuteChatBubbleSoundToggle } from "../../components/settings/MuteChatBubbleSoundButton";

const PageTranslations = translations["settings"];

export function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <main className="max-w-200 mx-auto dark:bg-gray-900 font-rubik relative px-4 pb-6">
      <ToastContainer position="top-right" draggable={true} autoClose={3000} />
      <div className="flex justify-start items-center p-2 bg-white dark:bg-gray-800/80 rounded-lg my-2 shadow-xs">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{PageTranslations[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      <section dir={language === "Arabic" ? "rtl" : "ltr"} className="p-2 my-4">
        <h2 className="text-xl tracking-tight font-bold text-cyan-600 dark:text-cyan-400">
          {PageTranslations[language].RouteTitle}
        </h2>
        <div className="my-4 bg-white dark:bg-gray-800 shadow-xs border border-gray-100 dark:border-gray-700 p-4 rounded">
          <h3 className="text-gray-600 dark:text-gray-50 tracking-tight mb-4 font-medium">
            {PageTranslations[language].AccountSectionTitle}
          </h3>
          <Button
            className={
              "text-sm w-full text-start my-2 flex items-center gap-2 dark:text-gray-100 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700"
            }
            onClick={() => {
              logout();
              navigate("/auth/login");
            }}
          >
            <LogOut size={18} />
            <span>{PageTranslations[language].logOutButtonText}</span>
          </Button>
          <Button
            onClick={() => toast.warning("This feature is under development.")}
            className={
              "text-sm py-2 w-full text-start my-2 flex items-center gap-2 dark:text-gray-100 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700"
            }
          >
            <RotateCcwKey size={18} />
            <span>{PageTranslations[language].ChangePassword}</span>
          </Button>
        </div>
        <div className="my-4 bg-white dark:bg-gray-800 shadow-xs border border-gray-100 dark:border-gray-700 p-4 rounded">
          <h3 className="text-gray-600 dark:text-gray-50 tracking-tight mb-4 font-medium">
            {PageTranslations[language].GeneralSectionTitle}
          </h3>
          <LanguageButton />
          <ThemeButton />
          <MuteChatBubbleSoundToggle />
        </div>
        <div className="my-4 bg-red-50 dark:bg-red-900/20 shadow-xs border border-red-300 dark:border-red-600 p-4 rounded">
          <h3 className="text-red-600 tracking-tight mb-4 font-medium">
            {PageTranslations[language].DangerZoneTitle}
          </h3>

          <DeleteAccountButton />
        </div>
      </section>
    </main>
  );
}
