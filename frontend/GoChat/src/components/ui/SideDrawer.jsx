import { useMe } from "../../hooks/me/useMe";
import { Avatar } from "../chat/Avatar";
import { Link } from "./Link";
import {
  CircleUserRound,
  Heart,
  Settings,
  UsersRound,
  MessageCircle,
  Plus,
} from "lucide-react";
import Line from "./Line";
import { useState } from "react";
import { TransitionLink } from "./TransitionLink";
import { IdentityLoading } from "../skeletonLoadingComponents/IdentityLoading";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
export function SideDrawer() {
  const { user, isFetching, error } = useMe();
  const { language } = useLanguage();

  const fullname = !isFetching && user && user.firstname + " " + user.lastname;
  const [transitionId, setTransitionId] = useState(null);

  return (
    <el-dialog>
      <dialog
        dir={language === "Arabic" ? "rtl" : "ltr"}
        id="drawer"
        aria-labelledby="drawer-title"
        className="fixed inset-0 size-auto max-h-none max-w-none overflow-hidden bg-transparent not-open:hidden backdrop:bg-transparent"
      >
        <el-dialog-backdrop className="absolute inset-0 bg-gray-500/75 dark:bg-gray-800/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0" />

        <div
          tabIndex={0}
          className="absolute inset-0 pl-10 focus:outline-none sm:pl-16"
        >
          <el-dialog-panel className="group/dialog-panel relative ml-auto block size-full max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700">
            <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out group-data-closed/dialog-panel:opacity-0 sm:-ml-10 sm:pr-4">
              <button
                command="close"
                commandfor="drawer"
                type="button"
                className="relative rounded-md text-gray-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
              >
                <span className="absolute -inset-2.5"></span>
                <span className="sr-only">
                  {translations.SideDrawer[language].ClosePanelSR}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className="size-6"
                >
                  <path
                    d="M6 18 18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="relative flex h-full flex-col overflow-y-auto bg-white dark:bg-gray-900 py-6 shadow-xl">
              <div className="px-4 sm:px-6">
                {isFetching ? (
                  <IdentityLoading isCurrentUserIdentity={true} />
                ) : user ? (
                  <div className="flex items-center gap-x-2">
                    <Avatar
                      chatAvatar={user.profile?.avatar || ""}
                      chatTitle={fullname}
                      color={user?.accountColor || null}
                      dynamicTransitionId={transitionId}
                    />
                    <strong className="text-sm text-gray-700 dark:text-gray-200">
                      {fullname}
                    </strong>
                  </div>
                ) : error ? (
                  <p>Error: {error.message}</p>
                ) : null}
              </div>
              <div className="relative mt-6 flex-1 px-4 sm:px-6">
                <TransitionLink
                  className="flex w-full items-center gap-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 py-2 text-sm px-3 rounded-md hover:scale-105 dark:bg-gray-800/70 shadow dark:shadow-white/5 dark:shadow-inner transition-all duration-300"
                  route={"/users/me/profile"}
                  setDynamicTransitionId={setTransitionId}
                >
                  <CircleUserRound size={20} />
                  <span>{translations.SideDrawer[language].MyProfile}</span>
                </TransitionLink>
                <Line />
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
                    {translations.SideDrawer[language].AccountHeading}
                  </h3>
                  <Link
                    className="flex items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 py-2 px-3 rounded-md hover:scale-105 dark:bg-gray-800/70 shadow dark:shadow-white/5 dark:shadow-inner transition-all duration-300"
                    route={"/users/me/preferences"}
                  >
                    <Heart size={20} />
                    <span>
                      {translations.SideDrawer[language].AccountPreferences}
                    </span>
                  </Link>
                  <Link
                    className="flex items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 py-2 px-3 rounded-md hover:scale-105 dark:bg-gray-800/70 shadow dark:shadow-white/5 dark:shadow-inner transition-all duration-300"
                    route={"/users/me/settings"}
                  >
                    <Settings size={20} />
                    <span>{translations.SideDrawer[language].Settings}</span>
                  </Link>
                </div>
                <Line />
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
                    {translations.SideDrawer[language].ChatsHeading}
                  </h3>
                  <Link
                    className="flex items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 py-2 px-3 rounded-md hover:scale-105 dark:bg-gray-800/70 shadow dark:shadow-white/5 dark:shadow-inner transition-all duration-300"
                    route={"/chats/group/new"}
                  >
                    <UsersRound size={20} />
                    <span>{translations.SideDrawer[language].NewGroup}</span>
                  </Link>
                  <Link
                    route={"/chats/direct/new"}
                    className="flex items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 py-2 px-3 rounded-md hover:scale-105 dark:bg-gray-800/70 shadow dark:shadow-white/5 dark:shadow-inner transition-all duration-300"
                  >
                    <Plus size={20} />
                    <span>{translations.SideDrawer[language].NewChat}</span>
                  </Link>
                  <Link
                    route={"/chats/groups"}
                    className="flex items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 py-2 px-3 rounded-md hover:scale-105 dark:bg-gray-800/70 shadow dark:shadow-white/5 dark:shadow-inner transition-all duration-300"
                  >
                    <MessageCircle size={20} />
                    <span>{translations.SideDrawer[language].FindGroup}</span>
                  </Link>
                </div>
              </div>
            </div>
          </el-dialog-panel>
        </div>
      </dialog>
    </el-dialog>
  );
}
