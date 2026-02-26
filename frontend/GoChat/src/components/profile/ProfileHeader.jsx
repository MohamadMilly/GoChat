import { Avatar } from "../chat/Avatar";

export function ProfileHeader({ dynamicTransitionName, user }) {
  const fullname = user.firstname + " " + user.lastname;
  return (
    <section
      style={{
        backgroundImage: `url(${user.profile?.avatarBackground || ""})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="bg-gray-50 dark:bg-gray-800 min-h-60 flex justify-center items-end"
    >
      <Avatar
        avatar={null}
        chatAvatar={user?.profile.avatar}
        chatTitle={fullname}
        color={user?.accountColor || null}
        size="120px"
        viewTransitionName={dynamicTransitionName}
        className={"translate-y-1/3 rounded-full shadow-md"}
      />
    </section>
  );
}
