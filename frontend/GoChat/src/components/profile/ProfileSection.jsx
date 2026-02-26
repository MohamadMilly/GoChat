export function ProfileSection({
  value,
  title,
  icon = null,
  isHidden = false,
}) {
  return (
    <article className="my-2 p-1">
      <p className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{value || "No " + title}</span>
      </p>
      <h2 className="text-sm text-cyan-600/80 dark:text-cyan-400/80 mt-1">
        {title}
        {isHidden && (
          <span className="mx-1 text-xs text-gray-400">
            (Only visible to you)
          </span>
        )}
      </h2>
    </article>
  );
}
