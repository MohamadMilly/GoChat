import { Outlet, useNavigate, useSearchParams } from "react-router";
import { SearchBar } from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { Avatar } from "../components/chat/Avatar";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useDebounce } from "../hooks/utils/useDebounce";

function GroupPreviewCard(props) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  return (
    <li className="flex grow-0 items-center gap-2 py-2">
      <Avatar avatar={props.avatar} chatTitle={props.title} />
      <div className="flex-1">
        <strong className="text-gray-700 dark:text-gray-200 text-sm">
          {props.title}
        </strong>
        <p className="text-xs text-gray-400 dark:text-gray-300">
          {translations.FindGroupPage[language].CreatedAtLabel}{" "}
          {new Date(props.createdAt).toLocaleDateString(
            language === "Arabic" ? "ar-EG" : "en-GB",
          )}
        </p>
      </div>
      <div className="flex justify-center items-center ">
        <Button
          onClick={() =>
            navigate(`/chats/groups/${props.groupId}/preview`, {
              viewTransition: true,
            })
          }
          className={"text-xs dark:text-gray-200"}
        >
          {translations.FindGroupPage[language].Preview}
        </Button>
      </div>
    </li>
  );
}

function GroupsList({ query }) {
  const { groups, error, isFetching } = useGroups(query);
  const { language } = useLanguage();

  if (isFetching)
    return (
      <p className="text-sm text-center text-gray-600 dark:text-gray-200">
        {translations.FindGroupPage[language].Loading}
      </p>
    );
  if (error)
    return (
      <p className="text-red-500">
        {translations.FindGroupPage[language].ErrorPrefix} {error.message}
      </p>
    );
  if (query && groups.length <= 0)
    return (
      <p className="text-sm text-center text-gray-600 dark:text-gray-200">
        {translations.FindGroupPage[language].NoGroupsFound}
      </p>
    );
  return (
    <ul className="w-full flex flex-col animate-slideup divide-gray-100 dark:divide-gray-700 divide-y">
      {groups.map((group) => {
        return (
          <GroupPreviewCard
            key={group.id}
            groupId={group.id}
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
  /* Debouncing query with useDebounce */
  const debouncedQuery = useDebounce(query, 500);

  const { language } = useLanguage();
  return (
    <>
      <main className="max-w-200 mx-auto dark:bg-gray-900 font-rubik px-4 pb-6">
        <div className="flex justify-start items-center p-2 bg-white dark:bg-gray-800/80 rounded-lg mt-2 mb-4">
          <Button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-300"
          >
            <p className="sr-only">{translations.Common[language].GoBackSR}</p>
            <ArrowBigLeft size={20} />
          </Button>
        </div>
        <SearchBar
          name="title"
          label={translations.SearchBar[language].SearchGroup}
          query={query}
        />
        <section
          dir={language === "Arabic" ? "rtl" : "ltr"}
          className="p-2 mt-4"
        >
          <GroupsList query={debouncedQuery} />
        </section>
      </main>
      <Outlet />
    </>
  );
}
