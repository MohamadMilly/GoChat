import { useParams } from "react-router";
import { useSendMessage } from "../../../hooks/chat/useSendMessage";
import { useMe } from "../../../hooks/me/useMe";
import { LoadingLayer } from "../../ui/LoadingLayer";
import { Sticker } from "../ChatBubble";
import { useContext, useEffect, useRef, useState } from "react";
import { SendMessageFormContext } from "../SendMessageForm";
import { AddStickerButton } from "./AddStickerButton";

export function StickerButton({ stickerURL, onClick, size = 96 }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer mb-1">
      <Sticker size={size} stickerURL={stickerURL} />
    </button>
  );
}

function StickersContent({ isFetching, stickers, setOpen }) {
  const { id: conversationId } = useParams();
  const { repliedMessage, scroll } = useContext(SendMessageFormContext);

  const send = useSendMessage();
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
  const handleSendSticker = (stickerURL) => {
    if (!stickerURL) return;
    const extension = stickerURL.slice(stickerURL.lastIndexOf(".") + 1);
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
    <div className="flex flex-row flex-wrap gap-1.5">
      {stickers.map((stickerURL) => (
        <StickerButton
          key={stickerURL}
          stickerURL={stickerURL}
          onClick={() => handleSendSticker(stickerURL)}
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

  const handleManualClose = () => {
    setIsSlidingDown(true);
    setTimeout(() => {
      setOpen(false);
      setIsSlidingDown(false);
    }, 500);
  };

  if (!open) return null;

  return (
    <aside
      ref={stickersPanelRef}
      className={`absolute bottom-0 left-0 right-0 z-700 flex h-90 w-full flex-col rounded-t-xl border border-dashed border-gray-300 bg-linear-to-t from-gray-100 to-gray-50 px-4 pt-8 pb-4 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 [--slide-offset:100%] ${
        isSlidingDown ? "animate-slidedown" : "animate-slideup"
      }`}
    >
      <span className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600"></span>

      <button
        onClick={handleManualClose}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200/50 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-600/50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100 transition-colors"
        aria-label="Close panel"
      >
        <svg
          xmlns="http://w3.org"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="h-full overflow-y-auto pr-1 md:-mb-2">
        <StickersContent
          isFetching={isFetching}
          stickers={stickers}
          setOpen={setOpen}
        />
      </div>
    </aside>
  );
}
