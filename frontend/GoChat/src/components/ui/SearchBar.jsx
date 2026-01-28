import { Form, useSubmit } from "react-router";

export function SearchBar({ query = "", name = "query" }) {
  const submit = useSubmit();

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="search">Search</label>
        <input
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
