import { Form, useLocation, useSubmit } from "react-router";

export function SearchBar({ query = "", name = "query", label }) {
  const submit = useSubmit();
  const location = useLocation();
  return (
    <Form onSubmit={(e) => e.preventDefault()} action={location.pathname}>
      <div className="w-full p-4 flex flex-col gap-2">
        <label className="tracking-tight text-cyan-600/80" htmlFor="search">
          {label}
        </label>
        <input
          className="px-4 py-1.5 outline-2 outline-gray-200/50 focus:outline-cyan-600/50 focus:outline-offset-2 focus:bg-gray-200/20 transition-all rounded-full text-sm text-gray-800"
          type="search"
          name={name}
          value={query || ""}
          onChange={(e) => {
            let isFirstSearch = !query;
            submit(e.currentTarget.form, {
              replace: !isFirstSearch,
            });
          }}
        />
      </div>
    </Form>
  );
}
