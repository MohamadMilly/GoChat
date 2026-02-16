import { useNavigate } from "react-router";
import { useMe } from "../../hooks/me/useMe";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { getGenertedTransitionId } from "../../utils/transitionId";
import { ProfileIdentity } from "../../components/profile/ProfileIdentity";
import { useSocket } from "../../contexts/SocketContext";
import { ProfileSection } from "../../components/profile/ProfileSection";
import { AtSign, ArrowBigLeft, Pen } from "lucide-react";
import Button from "../../components/ui/Button";
import { UserProfileLoading } from "../../components/skeletonLoadingComponents/UserProfileLoading";

export function MyProfile() {
  const { user, preferences, isFetching, error } = useMe();
  const navigate = useNavigate();
  const { isConnected } = useSocket();

  if (error) return <p>Error: {error.message}</p>;

  const fullname = !isFetching && user && user.firstname + " " + user.lastname;
  const transitionId = getGenertedTransitionId();
  const dynamicTransitionName = fullname
    ? `${fullname.replaceAll(" ", "-")}-${transitionId}`
    : null;

  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative">
      <div className="flex justify-between items-center p-2 bg-gray-50/30 rounded-lg my-2">
        <Button onClick={() => navigate(-1)} className="text-gray-600">
          <p className="sr-only">Go Back</p>
          <ArrowBigLeft size={20} />
        </Button>
        <Button
          onClick={() =>
            navigate("/users/me/profile/edit", { viewTransition: true })
          }
          className="text-gray-600"
        >
          <p className="sr-only">Edit Profile</p>
          <Pen size={20} />
        </Button>
      </div>
      {isFetching ? (
        <UserProfileLoading isCurrentUserProfile={true} />
      ) : (
        <>
          <ProfileHeader
            dynamicTransitionName={dynamicTransitionName}
            user={user}
          />
          <ProfileIdentity
            fullname={fullname}
            isConnected={isConnected}
            lastSeen={user.profile.lastSeen}
          />
          <section className="px-4 mt-4 py-2 bg-white shadow-sm rounded-md">
            <ProfileSection
              value={user.username}
              title={"Username"}
              icon={<AtSign size={20} />}
            />
            <ProfileSection
              title={"Bio"}
              value={user.profile?.bio}
              isHidden={preferences.isBioHidden}
            />

            <ProfileSection
              title={"Phone number"}
              value={user.profile?.phoneNumber}
              isHidden={preferences.isPhoneNumberHidden}
            />

            <ProfileSection
              isHidden={preferences.isEmailHidden}
              title={"Email"}
              value={user.profile?.email}
            />

            <ProfileSection
              isHidden={preferences.isBirthdayHidden}
              title={"Birthday"}
              value={user.profile?.bidthday}
            />
          </section>
        </>
      )}
    </main>
  );
}
