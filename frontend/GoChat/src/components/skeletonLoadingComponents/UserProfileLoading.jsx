import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";

export function UserProfileLoading({ isCurrentUserProfile }) {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  return (
    <>
      <section className="bg-gray-50 animate-pulse min-h-60 flex justify-center items-end">
        <div className="shrink-0 relative translate-y-1/3 rounded-full shadow-md">
          <div className="w-[120px] h-[120px] bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </section>
      <section className="text-center mt-12">
        {isCurrentUserProfile ? (
          <>
            <h1 className="text-lg">{user.firstname + " " + user.lastname}</h1>
            <p
              className={`text-sm ${isConnected ? "text-cyan-600" : "text-gray-500"}  `}
            >
              {isConnected ? (
                "Online"
              ) : (
                <span className="inline-block p-1.5 w-20 rounded bg-gray-100 animate-pulse"></span>
              )}
            </p>
          </>
        ) : (
          <>
            <span className="block mx-auto bg-gray-100 animate-pulse p-2.5 w-30 rounded mb-2"></span>
            <span className="block mx-auto p-1.5 w-20 rounded bg-gray-100 animate-pulse"></span>
          </>
        )}
      </section>
      <section className="px-4 mt-4 py-2 bg-white shadow-sm rounded-md">
        <article className="pb-2 border-b-2 my-2 border-gray-100">
          <span className="block w-35 p-2.5 rounded bg-gray-100 animate-pulse"></span>

          <h2 className="mt-1 w-20 p-2 rounded bg-gray-100 animate-pulse"></h2>
        </article>
        <article className="pb-2 border-b-2 my-2 border-gray-100">
          <span className="block w-35 p-2.5 rounded bg-gray-100 animate-pulse"></span>

          <h2 className="mt-1 w-20 p-2 rounded bg-gray-100 animate-pulse"></h2>
        </article>
        <article className="pb-2 border-b-2 my-2 border-gray-100">
          <span className="block w-35 p-2.5 rounded bg-gray-100 animate-pulse"></span>

          <h2 className="mt-1 w-20 p-2 rounded bg-gray-100 animate-pulse"></h2>
        </article>
      </section>
    </>
  );
}
