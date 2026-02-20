import { useMyPrefrences } from "../../hooks/me/useMyPreferences";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router";
import { ArrowBigLeft } from "lucide-react";
import { usePatchPreferences } from "../../hooks/me/usePatchPreferences";
import { toast } from "react-toastify";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
function PrefrenceSectionSelect({
  options,
  initialOption,
  preferenceTitle,
  preferenceKey,
  isFetching,
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [fadeIsRunning, setFadeIsRunning] = useState(false);
  const { mutate: patch, error, isPending } = usePatchPreferences();

  const handleSelect = (value) => {
    patch({ key: preferenceKey, value: value });
  };
  const toggleMenuVisibility = () => {
    if (isMenuVisible && !isFetching) {
      setFadeIsRunning(true);
      setTimeout(() => {
        setFadeIsRunning(false);
        setIsMenuVisible(false);
      }, 300);
    } else {
      setIsMenuVisible((prev) => !prev);
    }
  };
  if (error && !isPending) {
    toast.error(error.message);
  }
  return (
    <section className="flex items-center justify-between px-2 py-1 my-2">
      {isFetching ? (
        <span className="w-20 inline-block py-2.5 rounded bg-gray-200 animate-pulse"></span>
      ) : (
        <h3 className="text-sm">{preferenceTitle}</h3>
      )}
      <div className="text-gray-700">
        <Button
          onClick={toggleMenuVisibility}
          className={"text-xs text-gray-600 flex items-center gap-x-2"}
        >
          {isMenuVisible ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
          <span
            className={
              isFetching ? "inline-block w-10 py-1.5 rounded bg-gray-200" : ""
            }
          >
            {isFetching ? "" : initialOption}
          </span>
        </Button>
        {isMenuVisible && (
          <ul
            className={`absolute bottom-0 right-0 translate-y-1/3 bg-white shadow-xs p-2 rounded w-50 ${fadeIsRunning ? "animate-fade" : "animate-pop"}`}
          >
            {options.map((option) => {
              return (
                <li>
                  <button
                    className="w-full flex justify-start items-center text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 py-0.5 px-1 rounded cursor-pointer"
                    key={option.key}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.value}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function PreferenceSectionToggle({
  preferenceTitle,
  preferenceKey,
  value,
  isFetching,
}) {
  const { mutate: patch, error, isPending } = usePatchPreferences();
  const handlePatch = (e) => {
    patch({ key: preferenceKey, value: e.target.checked });
  };
  if (error && !isPending) {
    toast.error(error.message);
  }
  return (
    <section className="flex items-center justify-between px-2 py-1 my-2">
      <h3 className="text-sm">{preferenceTitle}</h3>
      {isFetching && (
        <div className="flex items-center">
          <div className="w-9 h-5 bg-gray-300 rounded-full animate-pulse"></div>
          <span className="w-10 ml-3 block py-1.5 rounded bg-gray-200 animate-pulse"></span>
        </div>
      )}
      {typeof value === "boolean" ? (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value}
            onChange={handlePatch}
            disabled={isFetching}
          />

          <div
            className="relative w-9 h-5 bg-gray-300 rounded-full peer-focus:ring-4 peer-focus:ring-cyan-300 
              dark:bg-gray-700 dark:peer-focus:ring-cyan-800
              peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
              peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5
              after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
              peer-checked:bg-cyan-600 dark:peer-checked:bg-cyan-600"
          ></div>

          <span className="ms-3 text-xs text-gray-600">
            {value ? "Enabled" : "Disabled"}
          </span>
        </label>
      ) : null}
    </section>
  );
}

export function MyPreferences() {
  const { preferences, error, isFetching } = useMyPrefrences();
  const navigate = useNavigate();

  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="max-w-200 mx-auto bg-white font-rubik relative p-2">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 rounded-lg my-2">
        <Button onClick={() => navigate(-1)} className="text-gray-600">
          <p className="sr-only">Go Back</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>

      <section className="shadow-xs p-4 rounded-lg my-4 border border-gray-300/50">
        <h2 className="text-lg font-bold tracking-tight text-cyan-600 mb-4">
          Profile prefrences
        </h2>
        <PreferenceSectionToggle
          preferenceTitle={"Hide avatar"}
          value={preferences && preferences.isAvatarHidden}
          preferenceKey={"isAvatarHidden"}
          isFetching={isFetching}
        />
        <PreferenceSectionToggle
          preferenceTitle={"Hide avatar background"}
          value={preferences && preferences.isAvatarBackgroundHidden}
          preferenceKey={"isAvatarBackgroundHidden"}
          isFetching={isFetching}
        />
        <PreferenceSectionToggle
          preferenceTitle={"Hide Bio"}
          value={preferences && preferences.isBioHidden}
          preferenceKey={"isBioHidden"}
          isFetching={isFetching}
        />
        <PreferenceSectionToggle
          preferenceTitle={"Hide phone number"}
          value={preferences && preferences.isPhoneNumberHidden}
          preferenceKey={"isPhoneNumberHidden"}
          isFetching={isFetching}
        />
        <PreferenceSectionToggle
          preferenceTitle={"Hide email"}
          value={preferences && preferences.isEmailHidden}
          preferenceKey={"isEmailHidden"}
          isFetching={isFetching}
        />
        <PreferenceSectionToggle
          preferenceTitle={"Hide Birthday"}
          value={preferences && preferences.isBirthdayHidden}
          preferenceKey={"isBirthdayHidden"}
          isFetching={isFetching}
        />
      </section>

      <section className="shadow-xs p-2 rounded-lg my-4 border border-gray-300/50">
        <PrefrenceSectionSelect
          options={[
            { value: "EMAIL", key: "email" },
            { value: "PHONE", key: "phone" },
          ]}
          initialOption={preferences && preferences.preferredVerification}
          preferenceKey={"preferredVerification"}
          preferenceTitle={"Verification method"}
          isFetching={isFetching}
        />
      </section>
    </main>
  );
}
