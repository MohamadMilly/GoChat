import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  getSoundPreferences,
  setSoundPreferences,
} from "../utils/prefrencesUtils/soundPreferences";

const SoundPreferencesContext = createContext({
  chatBubbleSound: true,
});

const DEFAULT_PREFERENCES = { chatBubbleSound: true };
const INITIAL_SOUND_PREFERENCES = getSoundPreferences() || DEFAULT_PREFERENCES;

export function SoundPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(INITIAL_SOUND_PREFERENCES);
  const handlePreferencesChange = useCallback(
    ({ chatBubbleSound }) => {
      const nextPrefs = { ...preferences, chatBubbleSound: chatBubbleSound };

      setPreferences(nextPrefs);
      setSoundPreferences({ chatBubbleSound });
    },
    [preferences],
  );

  const contextValue = useMemo(
    () => ({ preferences, handlePreferencesChange }),
    [handlePreferencesChange, preferences],
  );

  return (
    <SoundPreferencesContext value={contextValue}>
      {children}
    </SoundPreferencesContext>
  );
}

export const useSound = () => useContext(SoundPreferencesContext);
