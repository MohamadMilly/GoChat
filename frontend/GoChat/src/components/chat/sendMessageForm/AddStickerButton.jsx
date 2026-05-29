import { Plus } from "lucide-react";
import { usePatchUser } from "../../../hooks/me/usePatchUser";
import { useUpload } from "../../../hooks/utils/useUpload";
import Button from "../../ui/Button";
import { useRef } from "react";
import { LoadingLayer } from "../../ui/LoadingLayer";

export function AddStickerButton() {
  const {
    mutate: patchUser,
    isPending,
    error: patchUserError,
  } = usePatchUser();
  const { upload, error: uploadingError, isUploading } = useUpload();
  const inputRef = useRef(null);
  const triggerInput = () => {
    const input = inputRef.current;
    if (input) {
      input.click();
    }
  };
  const handleAddSticker = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await upload(file, "images");
    patchUser({
      addStickers: [url],
      removeStickers: [],
    });
  };

  return (
    <div>
      <Button
        disabled={isUploading}
        className={
          "rounded-xl max-w-md overflow-hidden relative w-24 h-24 flex items-center justify-center"
        }
        onClick={triggerInput}
      >
        {isUploading ? (
          <LoadingLayer title={"Uploading"} className={"rounded-lg"} />
        ) : isPending ? (
          <LoadingLayer title={"Pending..."} className={"rounded-lg"} />
        ) : (
          <Plus size={30} />
        )}
        <input
          type="file"
          hidden={true}
          onChange={handleAddSticker}
          ref={inputRef}
          accept="image/*"
        />
      </Button>
    </div>
  );
}
