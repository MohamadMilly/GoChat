import { useNavigate, useParams } from "react-router";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { usePermissions } from "../hooks/usePermissions";
import { ToggleInput } from "../components/ui/ToggleInput";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { ArrowBigLeft, Check } from "lucide-react";
import { useEditPermissions } from "../hooks/useEditPermissions";
export function GroupPermisstionsPage() {
  const { id: conversationId } = useParams();

  const { permissions, error, isFetching } = usePermissions(conversationId);
  const {
    mutate: update,
    isPending,
    error: editingError,
    isSuccess,
  } = useEditPermissions();
  const [newPermissions, setNewPermissions] = useState({
    sendingMessages: false,
    sendingMedia: false,
    onlineMembers: false,
    hideUsersForVisitors: false,
    messageReaders: false,
    viewMembers: false,
  });
  const navigate = useNavigate();
  const { language } = useLanguage();
  const handleConfirm = () => {
    update({ conversationId: conversationId, data: newPermissions });
  };
  if (isSuccess) {
    navigate(-1);
  }
  useEffect(() => {
    function setInitialPermissions() {
      if (isFetching) return;
      setNewPermissions({
        sendingMessages: permissions.sendingMessages,
        sendingMedia: permissions.sendingMedia,
        onlineMembers: permissions.onlineMembers,
        hideUsersForVisitors: permissions.hideUsersForVisitors,
        messageReaders: permissions.messageReaders,
        viewMembers: permissions.viewMembers,
      });
    }
    setInitialPermissions();
  }, [isFetching, permissions]);

  const handleTogglePermissions = (key, value) => {
    if (typeof key === "undefined" || typeof value === "undefined") return;
    setNewPermissions((prev) => ({ ...prev, [key]: value }));
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
          disabled={isFetching || isPending}
          onClick={handleConfirm}
          className={"text-gray-600 dark:text-gray-300"}
        >
          <p className="sr-only">Confirm edits</p>
          <Check size={20} />
        </Button>
      </div>
      <section className="px-4">
        <div className="border-t border-b dark:border-gray-800 border-gray-200 my-4">
          <h3 className="text-lg tracking-tight font-bold text-cyan-600 dark:text-cyan-400">
            Permissions
          </h3>
          <p className="text-sm dark:text-gray-600 text-gray-400">
            What people can do in the group?
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 shadow-xs border border-gray-100 dark:border-gray-700 p-4 rounded">
          <div className="flex items-center justify-between my-3">
            <span className="text-sm dark:text-gray-100 grow">
              Sending messages
            </span>
            <ToggleInput
              value={newPermissions.sendingMessages || undefined}
              disabled={isFetching}
              onChange={(e) => {
                handleTogglePermissions("sendingMessages", e.target.checked);
              }}
            />
          </div>
          <div className="flex items-center justify-between my-3">
            <span className="text-sm dark:text-gray-100 grow">
              Sending media
            </span>
            <ToggleInput
              value={newPermissions.sendingMedia || undefined}
              disabled={isFetching}
              onChange={(e) => {
                handleTogglePermissions("sendingMedia", e.target.checked);
              }}
            />
          </div>
          <div className="flex items-center justify-between my-3">
            <span className="text-sm dark:text-gray-100 grow">
              Show online members
            </span>
            <ToggleInput
              value={newPermissions.onlineMembers || undefined}
              disabled={isFetching}
              onChange={(e) => {
                handleTogglePermissions("onlineMembers", e.target.checked);
              }}
            />
          </div>
          <div className="flex items-center justify-between my-3">
            <span className="text-sm dark:text-gray-100 grow">
              Hide members for visitors
            </span>
            <ToggleInput
              value={newPermissions.hideUsersForVisitors || undefined}
              disabled={isFetching}
              onChange={(e) => {
                handleTogglePermissions(
                  "hideUsersForVisitors",
                  e.target.checked,
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between my-3">
            <span className="text-sm dark:text-gray-100 grow">
              Show messages readers
            </span>
            <ToggleInput
              value={newPermissions.messageReaders || undefined}
              disabled={isFetching}
              onChange={(e) => {
                handleTogglePermissions("messageReaders", e.target.checked);
              }}
            />
          </div>
          <div className="flex items-center justify-between my-3">
            <span className="text-sm dark:text-gray-100 grow">
              View members
            </span>
            <ToggleInput
              value={newPermissions.viewMembers || undefined}
              disabled={isFetching}
              onChange={(e) => {
                handleTogglePermissions("viewMembers", e.target.checked);
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
