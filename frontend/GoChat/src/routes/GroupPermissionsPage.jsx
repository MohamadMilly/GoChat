import { useNavigate } from "react-router";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { usePermissions } from "../hooks/usePermissions";
export function GroupPermisstionsPage() {
  const { permissions, error, isFetching } = usePermissions();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const handleConfirm = () => {
    /* didn't create a controller or resource for patching permissions */
  };
  return (
    <main className="max-w-200 pb-4 mx-auto bg-white dark:bg-gray-900 font-rubik relative">
      <div className="flex justify-between items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg my-2">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{translations.Common[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
        <Button
          disabled={false}
          onClick={handleConfirm}
          className={"text-gray-600 dark:text-gray-300"}
        >
          <p className="sr-only">Confirm edits</p>
          <Check size={20} />
        </Button>
      </div>
      <section>
        <h3 className={""}>Permissions</h3>
      </section>
    </main>
  );
}
