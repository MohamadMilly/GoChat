export function ProfileIdentity({ fullname, isConnected, lastSeen }) {
  return (
    <section className="text-center mt-12">
      <h1 className="text-lg">{fullname}</h1>
      <p
        className={`text-sm ${isConnected ? "text-cyan-600" : "text-gray-500"}  `}
      >
        {isConnected
          ? "Online"
          : `lastseen at ${new Date(lastSeen).toLocaleTimeString()}`}
      </p>
    </section>
  );
}
