import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";

export function ErrorPage({
  title,
  status = "",
  message = "",
  backRoute = "/",
  embedded = false,
}) {
  const navigate = useNavigate();
  const error = useRouteError();

  let errorStatus = status;
  let errorTitle = title;
  let errorMessage = message;

  // 1. Handle React Router boundary responses (Loaders / Actions)
  if (isRouteErrorResponse(error)) {
    errorStatus = errorStatus || String(error.status);
    errorTitle =
      errorTitle || (error.status === 404 ? "Page not found." : "Route error.");
    errorMessage = errorMessage || error.data?.message || error.statusText;
  }
  // 2. Handle standard native JavaScript Error instances
  else if (error instanceof Error) {
    errorStatus = errorStatus || "Runtime Error";
    errorTitle = errorTitle || error.name || "Application Crash";
    errorMessage = errorMessage || error.message;
  }
  // 3. Handle raw thrown TanStack Query / Axios object structures
  else if (error && typeof error === "object") {
    errorStatus =
      errorStatus || String(error.status || error.statusCode || "Fetch Error");
    errorTitle = errorTitle || error.name || error.code || "Data Loading Error";
    errorMessage =
      errorMessage ||
      error.message ||
      error.data?.message ||
      "Failed to fetch remote data.";
  }
  // 4. Handle plain primitive values (strings, numbers)
  else if (error) {
    errorMessage = errorMessage || String(error);
  }

  // Fallback defaults if properties remain blank
  errorStatus = errorStatus || "Error";
  errorTitle = errorTitle || "Something went wrong.";
  errorMessage = errorMessage || "An unexpected error occurred.";

  const containerClasses = embedded
    ? "w-full py-12 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
    : "grid min-h-full place-items-center dark:bg-gray-900 bg-white px-6 py-24 sm:py-32 lg:px-8";

  const titleClasses = embedded
    ? "mt-2 text-2xl font-bold tracking-tight dark:text-white text-gray-900"
    : "mt-4 text-5xl font-semibold tracking-tight text-balance dark:text-white text-gray-900 sm:text-7xl";

  const messageClasses = embedded
    ? "mt-4 text-sm font-medium dark:text-gray-400 text-gray-600"
    : "mt-6 text-lg font-medium text-pretty dark:text-gray-400 text-gray-600 sm:text-xl/8";

  return (
    <main className={containerClasses}>
      <div className="text-center">
        <p className="text-base font-semibold dark:text-cyan-400 text-cyan-600">
          {errorStatus}
        </p>
        <h1 className={titleClasses}>{errorTitle}</h1>
        <p className={messageClasses}>{errorMessage}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={() => navigate(backRoute)}
            className="rounded-md bg-cyan-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
          >
            Go back
          </button>
          {!embedded && (
            <a
              href="https://t.me"
              className="text-sm font-semibold dark:text-white text-gray-900"
            >
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
