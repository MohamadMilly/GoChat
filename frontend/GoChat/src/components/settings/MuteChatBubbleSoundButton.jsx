import { useSound } from "../../contexts/SoundPreferencesContext";
import translations from "../../translations";
import { ToggleInput } from "../ui/ToggleInput";

const pageTranslation = translations["settings"];

export function MuteChatBubbleSoundToggle() {
  const { handlePreferencesChange, preferences } = useSound();
  const handleToggleSound = () => {
    const next = !preferences.chatBubbleSound;
    handlePreferencesChange({ chatBubbleSound: next });
  };

  return (
    <div className="text-sm  py-2 w-full text-start my-2 flex items-center justify-between dark:text-gray-100  text-gray-500 border border-dashed border-gray-200 dark:border-gray-700  px-3 rounded-md shadow-xs bg-white dark:bg-gray-700/50">
      <span className="text-sm dark:text-gray-100">Chat bubble sound</span>
      <ToggleInput
        onChange={handleToggleSound}
        disabled={false}
        value={preferences?.chatBubbleSound}
      />
    </div>
  );
}
