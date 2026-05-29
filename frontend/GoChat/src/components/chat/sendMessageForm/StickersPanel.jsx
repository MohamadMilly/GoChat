import { useParams } from "react-router";
import { useSendMessage } from "../../../hooks/chat/useSendMessage";
import { useMe } from "../../../hooks/me/useMe";
import { LoadingLayer } from "../../ui/LoadingLayer";
import { Sticker } from "../ChatBubble";
import { useContext, useEffect, useRef, useState } from "react";
import { SendMessageFormContext } from "../SendMessageForm";
import { AddStickerButton } from "./AddStickerButton";

function StickerButton({ stickerURL, setOpen }) {
  const { id: conversationId } = useParams();
  const { repliedMessage, scroll } = useContext(SendMessageFormContext);
  const extension = stickerURL.split(".")[1];
  const send = useSendMessage();
  const handleSendSticker = () => {
    const messageData = {
      message: "",
      previewFileURL: stickerURL,
      mediaFileData: {
        mimeType: `image/${extension}`,
        file: null,
      },
      repliedMessage: repliedMessage,
      type: "STICKER",
    };
    send(messageData, {}, conversationId);
    setOpen(false);
    scroll();
  };
  return (
    <button
      type="button"
      onClick={handleSendSticker}
      className="cursor-pointer"
    >
      <Sticker size={96} stickerURL={stickerURL} />
    </button>
  );
}

function StickersContent({ isFetching, stickers, setOpen }) {
  if (isFetching) {
    return <LoadingLayer title={"Loading..."} />;
  }

  if (stickers.length === 0) {
    return (
      <div className="grid place-items-center w-full h-full">
        <p className="text-gray-500 dark:text-gray-400">
          You have no stickers yet.
        </p>
        <AddStickerButton />
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-1.5">
      {stickers.map((stickerURL) => (
        <StickerButton
          key={stickerURL}
          stickerURL={stickerURL}
          setOpen={setOpen}
        />
      ))}
      <AddStickerButton />
    </div>
  );
}

export function StickersPanel({ open, setOpen }) {
  const { stickers, isFetching, error } = useMe();
  const [isSlidingDown, setIsSlidingDown] = useState(false);
  const stickersPanelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const stickersPanelElement = stickersPanelRef.current;
    const handleClickOutSide = (e) => {
      if (stickersPanelElement && !stickersPanelElement.contains(e.target)) {
        setIsSlidingDown(true);
        setTimeout(() => {
          setOpen(false);
          setIsSlidingDown(false);
        }, 500);
      }
    };
    const timeoutId = setTimeout(() => {
      window.addEventListener("click", handleClickOutSide);
    }, 0);

    return () => {
      window.removeEventListener("click", handleClickOutSide);
      clearTimeout(timeoutId);
    };
  }, [setOpen, open]);
  if (!open) return null;
  
  return (
    <aside
      ref={stickersPanelRef}
      className={`pt-6 pb-4 md:-mb-4 -mb-2 px-2 [--slide-offset:100%] overflow-y-auto  w-full dakr:border-gray-800 border backdrop-blur-md border-dashed bg-linear-to-t dark:from-gray-800 dark:to-gray-900 border-gray-700/40 from-gray-100 to-gray-50 absolute z-900 bottom-0 h-90 rounded-t-lg shadow-lg ${isSlidingDown ? "animate-slidedown" : "animate-slideup"}`}
    > 
      <span className="absolute left-[50%] translate-x-[-50%] top-0 translate-y-[-50%]  w-8 h-2 dark:bg-gray-600 bg-gray-700 rounded-full"></span>
      <StickersContent
        isFetching={isFetching}
        stickers={stickers}
        setOpen={setOpen}
      />
    </aside>
  );
}
