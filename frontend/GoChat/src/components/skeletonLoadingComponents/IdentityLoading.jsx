import { useAuth } from "../../contexts/AuthContext";

export function IdentityLoading({ isCurrentUserIdentity }) {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-x-2">
      <div className="shrink-0 relative">
        <div className="w-[48px] h-[48px] bg-gray-200 animate-pulse rounded-full"></div>
      </div>
      {isCurrentUserIdentity ? (
        <strong className="text-sm text-gray-700">
          {user.firstname + " " + user.lastname}
        </strong>
      ) : (
        <span className="inline-block p-1.5 rounded w-20 bg-gray-200 animate-pulse"></span>
      )}
    </div>
  );
}
