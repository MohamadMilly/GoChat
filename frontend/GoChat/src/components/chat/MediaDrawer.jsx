import { useRef } from "react";
import { X, Image, File, Video } from "lucide-react";
import { SlideUpMenu } from "../ui/SlideupMenu";

export function MediaDrawer({
  setMediaFileData,
  isVisible,
  setIsVisible,
  setPreviewFileURl,
  setHasAttached,
}) {
  const handleMediaSet = async (type, e) => {
    const mediaFile = e.target.files[0];
    setHasAttached(true);
    const fileTempURL = URL.createObjectURL(mediaFile);
    setPreviewFileURl(fileTempURL);
    setMediaFileData({ file: mediaFile, mimeType: mediaFile.type });
  };
  const imageFieldRef = useRef(null);
  const fileFieldRef = useRef(null);
  const videoFieldRef = useRef(null);
  return (
    <SlideUpMenu isVisible={isVisible} setIsVisible={setIsVisible}>
      <div className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/10 text-gray-500 dark:text-gray-300 text-sm hover:text-gray-900 dark:hover:text-gray-100 rounded mt-2 mb-1">
        <button
          className="flex items-center gap-2 w-full cursor-pointer "
          type="button"
          onClick={() => imageFieldRef.current.click()}
        >
          <Image size={20} />
          <span>Image</span>
        </button>
        <label className="sr-only" htmlFor="imageField">
          Image
        </label>
        <input
          id="imageField"
          type="file"
          accept="image/*"
          hidden={true}
          name="image"
          onChange={(e) => handleMediaSet("image", e)}
          ref={imageFieldRef}
        />
      </div>
      <div className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/10 text-gray-500 dark:text-gray-300 text-sm hover:text-gray-900 dark:hover:text-gray-100 rounded my-1">
        <button
          className="flex items-center gap-2 w-full cursor-pointer"
          type="button"
          onClick={() => fileFieldRef.current.click()}
        >
          <File size={20} />
          <span>File</span>
        </button>
        <label className="sr-only" htmlFor="fileField">
          File
        </label>
        <input
          id="fileField"
          type="file"
          accept="application/*"
          hidden={true}
          name="file"
          onChange={(e) => handleMediaSet("application", e)}
          ref={fileFieldRef}
        />
      </div>
      <div className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/10 text-gray-500 dark:text-gray-300 text-sm hover:text-gray-900 dark:hover:text-gray-100 rounded mt-1">
        <button
          className="flex items-center gap-2 w-full cursor-pointer"
          type="button"
          onClick={() => videoFieldRef.current.click()}
        >
          <Video size={20} />
          <span>Video</span>
        </button>
        <label className="sr-only" htmlFor="videoField">
          Video
        </label>
        <input
          id="videoField"
          type="file"
          accept="video/*"
          hidden={true}
          name="video"
          onChange={(e) => handleMediaSet("video", e)}
          ref={videoFieldRef}
        />
      </div>
    </SlideUpMenu>
  );
}
