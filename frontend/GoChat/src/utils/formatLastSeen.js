export const formatLastSeen = (date) => {
  if (!date) return "Unknown";

  const now = new Date();
  const lastSeen = new Date(date);
  const diffInMs = now - lastSeen;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 60) {
    return "a long time ago";
  }

  if (diffInDays >= 7) {
    return "last seen within a week";
  }

  if (diffInDays === 1) {
    const time = lastSeen.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `yesterday at ${time}`;
  }

  if (diffInDays === 0) {
    return `today at ${lastSeen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  }

  return `${diffInDays} days ago`;
};
