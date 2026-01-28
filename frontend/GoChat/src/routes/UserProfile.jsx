import { useParams } from "react-router";
import { useUser } from "../hooks/useUser";
import { abbreviateText } from "../utils/abbreviateText";
import { useSocket } from "../contexts/SocketContext";
export function UserProfile() {
  const { userId } = useParams();
  const { connectedUsers } = useSocket();
  const { user, isFetching, error } = useUser(userId);
  if (isFetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const fullname = user.firstname + " " + user.lastname;
  const isConnected = connectedUsers.find((id) => id == userId);
  return (
    <main>
      <section
        style={{
          backgroundImage: `url(${user.profile?.avatarBackground || ""})`,
        }}
      >
        {user.profile?.avatar ? (
          <img src={user.profile?.avatar} />
        ) : (
          abbreviateText(fullname)
        )}
      </section>
      <section>
        <h1>{fullname}</h1>
        <p>{isConnected ? "Online" : "Offline"}</p>
      </section>
      <section>
        <article>
          <h2>Username</h2>
          <p>{user.username}</p>
        </article>
        <article>
          <h2>Bio</h2>
          <p>{user.profile?.bio || "No Bio"}</p>
        </article>
        {user.profile?.phoneNumber && (
          <article>
            <h2>Phone number</h2>
            <p>{user.profile.phoneNumber}</p>
          </article>
        )}
        {user.profile?.email && (
          <article>
            <h2>Email</h2>
            <p>{user.profile.email}</p>
          </article>
        )}
        {user.profile?.birthday && (
          <article>
            <h2>Birthday</h2>
            <p>{user.profile.birthday}</p>
          </article>
        )}
      </section>
    </main>
  );
}
