import { Navigate, useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  ArrowBigLeft,
  Languages,
  LogOut,
  Palette,
  RotateCcwKey,
  Trash,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDeleteAccount } from "../../hooks/me/useDeleteAccount";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const PageTranslations = {
  Arabic: {
    RouteTitle: "الإعدادات",
    GoBackSR: "العودة",
    AccountSectionTitle: "الحساب",
    logOutButtonText: "تسجيل الخروج",
    ChangePassword: "تغيير كلمة المرور",
    GeneralSectionTitle: "عام",
    LanguageLabel: "اللغة",
    OptionArabic: "العربية",
    OptionEnglish: "الإنجليزية",
    ThemeLabel: "المظهر",
    ThemeNames: { light: "فاتح", dark: "داكن" },
    DangerZoneTitle: "منطقة الخطر",
    DeleteAccountButtonText: "حذف الحساب",
    DeleteAccountDialogTitle: "حذف الحساب",
    DeleteAccountDialogBody:
      "هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
    DeleteButtonText: "حذف",
    CancelButtonText: "إلغاء",
  },
  English: {
    RouteTitle: "Settings",
    GoBackSR: "Go Back",
    AccountSectionTitle: "Account",
    logOutButtonText: "Log out",
    ChangePassword: "Change password",
    GeneralSectionTitle: "General",
    LanguageLabel: "Language",
    OptionArabic: "Arabic",
    OptionEnglish: "English",
    ThemeLabel: "Theme",
    ThemeNames: { light: "light", dark: "dark" },
    DangerZoneTitle: "Danger Zone",
    DeleteAccountButtonText: "Delete Account",
    DeleteAccountDialogTitle: "Delete account",
    DeleteAccountDialogBody:
      "Are you sure you want to delete your account? This action cannot be undone.",
    DeleteButtonText: "Delete",
    CancelButtonText: "Cancel",
  },
};

function ThemeButton() {
  const { theme, handleSetTheme } = useTheme();
  const { language } = useLanguage();
  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    handleSetTheme(nextTheme);
  };
  return (
    <Button
      onClick={handleToggleTheme}
      className={
        "text-sm py-2 w-full text-start my-2 flex items-center justify-between dark:text-gray-100  text-gray-500"
      }
    >
      {" "}
      <div className="flex items-center gap-2">
        <Palette size={18} />
        <span>{PageTranslations[language].ThemeLabel}</span>
      </div>
      <span>{PageTranslations[language].ThemeNames[theme] ?? theme}</span>
    </Button>
  );
}

function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const {
    mutate: deleteAccount,
    isPending,
    error,
    isSuccess,
  } = useDeleteAccount();
  const { logout } = useAuth();
  const { language } = useLanguage();
  const handleDeleteAccount = () => {
    deleteAccount();
    logout();
  };
  if (isSuccess) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon
                      aria-hidden="true"
                      className="size-6 text-red-600"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      {PageTranslations[language].DeleteAccountDialogTitle}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {PageTranslations[language].DeleteAccountDialogBody}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteAccount();
                    setOpen(false);
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  {PageTranslations[language].DeleteButtonText}
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  {PageTranslations[language].CancelButtonText}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Button
        onClick={() => setOpen(true)}
        className={
          "text-sm py-2 w-full text-start my-2 flex items-center gap-2 dark:text-gray-100 text-gray-500"
        }
      >
        <Trash size={18} />
        <span>{PageTranslations[language].DeleteAccountButtonText}</span>
      </Button>
    </>
  );
}

function LanguageButton() {
  const { language, handleLanguageSet } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        className={
          "text-sm py-2 w-full text-start my-2 flex items-center justify-between dark:text-gray-100 text-gray-500"
        }
      >
        <div className="flex items-center gap-2">
          <Languages size={18} />
          <span>{PageTranslations[language].LanguageLabel}</span>
        </div>

        <span className="text-sm">{language}</span>
      </Button>
      {open && (
        <div className="absolute top-2 right-4 z-10 p-2 rounded bg-gray-50 shadow dark:bg-gray-700">
          <button
            onClick={() => {
              handleLanguageSet("Arabic");
              setOpen(false);
            }}
            className="w-full text-start text-sm dark:text-gray-200 text-gray-400 dark:hover:bg-gray-600/30 hover:bg-gray-100 cursor-pointer p-1 rounded"
          >
            {PageTranslations[language].OptionArabic}
          </button>
          <button
            onClick={() => {
              handleLanguageSet("English");
              setOpen(false);
            }}
            className="w-full text-start text-sm dark:text-gray-200 text-gray-400 dark:hover:bg-gray-600/30 hover:bg-gray-100 p-1 rounded  cursor-pointer"
          >
            {PageTranslations[language].OptionEnglish}
          </button>
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <main className="max-w-200 mx-auto bg-white dark:bg-gray-900 font-rubik relative p-2">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg my-2">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{PageTranslations[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      <section dir={language === "Arabic" ? "rtl" : "ltr"} className="p-4 my-4">
        <h2 className="text-lg tracking-tight font-bold text-cyan-600">
          {PageTranslations[language].RouteTitle}
        </h2>
        <div className="my-4 bg-gray-50 dark:bg-gray-800 shadow-xs border border-gray-100 dark:border-gray-700 p-4 rounded">
          <h3 className="text-gray-600 dark:text-gray-50 tracking-tight mb-4 font-medium">
            {PageTranslations[language].AccountSectionTitle}
          </h3>
          <Button
            className={
              "text-sm w-full text-start my-2 flex items-center gap-2 dark:text-gray-100 text-gray-500"
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
            className={
              "text-sm py-2 w-full text-start my-2 flex items-center gap-2 dark:text-gray-100 text-gray-500"
            }
          >
            <RotateCcwKey size={18} />
            <span>{PageTranslations[language].ChangePassword}</span>
          </Button>
        </div>
        <div className="my-4 bg-gray-50 dark:bg-gray-800 shadow-xs border border-gray-100 dark:border-gray-700 p-4 rounded">
          <h3 className="text-gray-600 dark:text-gray-50 tracking-tight mb-4 font-medium">
            {PageTranslations[language].GeneralSectionTitle}
          </h3>
          <LanguageButton />
          <ThemeButton />
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
