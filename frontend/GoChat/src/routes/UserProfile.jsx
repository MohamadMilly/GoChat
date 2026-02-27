import { useNavigate, useParams } from "react-router";
import { useUser } from "../hooks/useUser";
import { useSocket } from "../contexts/SocketContext";
import { getGenertedTransitionId } from "../utils/transitionId";
import Button from "../components/ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileSection } from "../components/profile/ProfileSection";
import { ProfileIdentity } from "../components/profile/ProfileIdentity";
import { AtSign } from "lucide-react";
import { UserProfileLoading } from "../components/skeletonLoadingComponents/UserProfileLoading";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";

export function UserProfile() {
  const { language } = useLanguage();
  const PageTranslations = translations.Profile;
  const { userId } = useParams();
  const { connectedUsers } = useSocket();
  const { user, isFetching, error } = useUser(userId);
  const navigate = useNavigate();

  if (error) return <p>Error: {error.message}</p>;

  const fullname = user && !isFetching && user.firstname + " " + user.lastname;
  const isConnected = connectedUsers.find((id) => id == userId);
  const transitionId = getGenertedTransitionId();
  const dynamicTransitionName = fullname
    ? `${fullname.replaceAll(" ", "-")}-${transitionId}`
    : null;
  return (
    <main className="max-w-200 mx-auto bg-white dark:bg-gray-900 font-rubik relative">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg my-2">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{translations.Common[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      {isFetching ? (
        <UserProfileLoading isCurrentUserProfile={false} />
      ) : (
        <>
          <ProfileHeader
            user={user}
            dynamicTransitionName={dynamicTransitionName}
          />
          <ProfileIdentity
            fullname={fullname}
            isConnected={isConnected}
            lastSeen={user.profile.lastSeen}
          />
          <section className="px-4 mt-4 py-2 bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700 shadow-sm rounded-md">
            <ProfileSection
              title={PageTranslations[language].Username}
              value={user.username}
              icon={<AtSign size={20} />}
            />
            <ProfileSection
              title={PageTranslations[language].Bio}
              value={user.profile?.bio}
            />
            {user.profile?.phoneNumber && (
              <ProfileSection
                title={PageTranslations[language].Phone}
                value={user.profile?.phoneNumber}
              />
            )}
            {user.profile?.email && (
              <ProfileSection
                title={PageTranslations[language].Email}
                value={user.profile?.email}
              />
            )}
            {user.profile?.birthday && (
              <ProfileSection
                title={PageTranslations[language].Birthday}
                value={user.profile?.bidthday}
              />
            )}
          </section>
        </>
      )}
    </main>
  );
}
