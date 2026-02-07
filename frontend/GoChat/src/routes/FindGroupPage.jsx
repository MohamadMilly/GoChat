import { useNavigate, useSearchParams } from "react-router";
import { SearchBar } from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { Avatar } from "../components/chat/Avatar";

function GroupPreviewCard(props) {
  return (
    <li className="flex items-center gap-2">
      <Avatar avatar={props.avatar} chatTitle={props.title} />
      <div>
        <strong className="text-gray-700 text-sm">{props.title}</strong>
        <p className="text-xs text-gray-400">Created At : {props.createdAt}</p>
      </div>
    </li>
  );
}

function GroupsList({ query }) {
  const { groups, error, isFetching } = useGroups(query);

  if (isFetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (groups.length <= 0) return <p>No groups are found.</p>;
  return (
    <ul className="w-full flex flex-col animate-slideup">
      {groups.map((group) => {
        return (
          <GroupPreviewCard
            title={group.title}
            avatar={group.avatar}
            createdAt={group.createdAt}
          />
        );
      })}
    </ul>
  );
}

export function FindGroupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("title");
  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 rounded-lg mt-2 mb-4">
        <Button onClick={() => navigate(-1)} className="text-gray-600">
          <p className="sr-only">Go Back</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      <SearchBar name="title" label={"Search Group"} query={query} />
      <section className="p-2 mt-4">
        <GroupsList query={query} />
      </section>
    </main>
  );
}
