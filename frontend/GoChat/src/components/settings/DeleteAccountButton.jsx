import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteAccount } from "../../hooks/me/useDeleteAccount";
import translations from "../../translations";
import { Spinner } from "../ui/Spinner";
import Button from "../ui/Button";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const PageTranslations = translations["settings"];

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const {
    mutate: deleteAccount,
    isPending,
    error,
    isSuccess,
  } = useDeleteAccount();
  const { logout } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const handleDeleteAccount = () => {
    deleteAccount();
    logout();
    queryClient.clear();
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
                  className="inline-flex gap-1 w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  <span>{PageTranslations[language].DeleteButtonText}</span>
                  {isPending && (
                    <Spinner
                      className={"dark:text-red-500 text-red-600"}
                      size={18}
                    />
                  )}
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
          "text-sm py-2 w-full text-start my-2 flex items-center gap-2 dark:text-gray-100 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700"
        }
      >
        <Trash size={18} />
        <span>{PageTranslations[language].DeleteAccountButtonText}</span>
      </Button>
    </>
  );
}
