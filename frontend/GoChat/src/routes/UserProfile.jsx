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

export function UserProfile() {
  const { userId } = useParams();
  const { connectedUsers } = useSocket();
  const { user, isFetching, error } = useUser(userId);
  const navigate = useNavigate();

  if (isFetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const fullname = user.firstname + " " + user.lastname;
  const isConnected = connectedUsers.find((id) => id == userId);
  const transitionId = getGenertedTransitionId();
  const dynamicTransitionName = `${fullname.replaceAll(" ", "-")}-${transitionId}`;
  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 rounded-lg my-2">
        <Button onClick={() => navigate(-1)} className="text-gray-600">
          <p className="sr-only">Go Back</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      <ProfileHeader
        user={user}
        dynamicTransitionName={dynamicTransitionName}
      />
      <ProfileIdentity
        fullname={fullname}
        isConnected={isConnected}
        lastSeen={user.profile.lastSeen}
      />
      <section className="px-4 mt-4 py-2 bg-white shadow-sm rounded-md">
        <ProfileSection
          title={"Username"}
          value={user.username}
          icon={<AtSign size={20} />}
        />
        <ProfileSection title={"Bio"} value={user.profile?.bio} />
        {user.profile?.phoneNumber && (
          <ProfileSection
            title={"Phone number"}
            value={user.profile?.phoneNumber}
          />
        )}
        {user.profile?.email && (
          <ProfileSection title={"Email"} value={user.profile?.email} />
        )}
        {user.profile?.birthday && (
          <ProfileSection title={"Birthday"} value={user.profile?.bidthday} />
        )}
      </section>
    </main>
  );
}
