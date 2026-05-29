import { X } from "lucide-react";
import Button from "../../ui/Button";
import { useMe } from "../../../hooks/me/useMe";
import { usePatchUser } from "../../../hooks/me/usePatchUser";
import { useState } from "react";
export function StickerActionDialog({ oncloseDialog, stickerURL }) {
  const { stickers } = useMe();
  const { mutate: patchUser } = usePatchUser();
  const [isSlidingDown, setIsSlidingDown] = useState(false);
  if (!stickerURL) return null;
  const handleDeleteSticker = () => {
    patchUser({
      removeStickers: [stickerURL],
    });
    setIsSlidingDown(true);
    setTimeout(() => {
      oncloseDialog();
      setIsSlidingDown(false);
    }, 500);
  };
  const handleAddSticker = () => {
    patchUser({
      addStickers: [stickerURL],
    });
    setIsSlidingDown(true);
    setTimeout(() => {
      oncloseDialog();
      setIsSlidingDown(false);
    }, 500);
  };
  return (
    <div className="fixed inset-0 z-50 flex md:items-center items-end justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative max-w-180 w-full h-120 rounded p-6 shadow-xl bg-gray-50 dark:bg-gray-800 animate-in fade-in zoom-in-95 duration-200 ${isSlidingDown ? "animate-slidedown" : "animate-slideup"} [--slide-offset:100%]`}
      >
        <div className="absolute top-4 right-4">
          <Button onClick={oncloseDialog}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex w-fit mx-auto flex-col items-center mt-12 h-full gap-4">
          <img
            src={stickerURL}
            alt="Sticker"
            className="max-h-50 object-contain rounded"
          />
          <div className="w-full">
            {stickers &&
            stickers?.length > 0 &&
            stickers.includes(stickerURL) ? (
              <Button
                onClick={handleDeleteSticker}
                className={
                  "w-full border border-dashed border-gray-200 dark:border-gray-700"
                }
              >
                Delete
              </Button>
            ) : (
              <Button
                onClick={handleAddSticker}
                className={
                  "w-full border border-dashed border-gray-200 dark:border-gray-700"
                }
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
