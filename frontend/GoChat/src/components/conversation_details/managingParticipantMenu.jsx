import { EllipsisVertical, X } from "lucide-react";
import Button from "../ui/Button";
import { useState } from "react";
import { useCallback } from "react";
import { ChatDetailsContext } from "../../routes/ChatDetails";

import { useRemoveParticipant } from "../../hooks/chat/useRemoveParticipant";
import { useParams } from "react-router";
import { useAddAdmin } from "../../hooks/chat/useAddAdmin";
import { useRemoveAdmin } from "../../hooks/chat/useRemoveAdmin";

export function ManagingParticipantMenu(props) {
  const [open, setOpen] = useState(false);
  const handleToggleMenu = useCallback(() => {
    setOpen(!open);
  }, [open]);
  const {
    mutate: kick,
    isPending: isPendingAddition,
    error: additionError,
  } = useRemoveParticipant();
  const {
    mutate: promote,
    isPending: isPendingPromotion,
    error: promotionError,
  } = useAddAdmin();
  const {
    mutate: dismissAdmin,
    isPending: isPendingDemotion,
    error: demotionError,
  } = useRemoveAdmin();

  const { id: conversationId } = useParams();
  const handleKick = useCallback(() => {
    kick({
      participantId: props.participantId,
      conversationId: conversationId,
    });
  }, [kick, conversationId, props.participantId]);

  const handleAddAdmin = () => {
    promote({
      participantId: props.participantId,
      conversationId: conversationId,
    });
  };
  const handleRemoveAdmin = () => {
    dismissAdmin({
      conversationId: conversationId,
      userId: props.userId,
    });
  };
  return (
    <div className="relative">
      <Button onClick={handleToggleMenu}>
        {open ? <X size={20} /> : <EllipsisVertical size={20} />}
      </Button>
      {open && (
        <ul className="flex flex-col gap-1 w-42 dark:bg-gray-800 bg-gray-50 border dark:border-gray-700/80 border-gray-100/80 rounded-md shadow-md/5 absolute z-999 ltr:right-0 rtl:left-0 mt-1 p-2 animate-pop">
          <li>
            <Button onClick={handleKick} className={"w-full"}>
              kick
            </Button>
          </li>
          <li>
            {props.isAdmin ? (
              <Button className={"w-full"} onClick={handleRemoveAdmin}>
                Dismiss admin
              </Button>
            ) : (
              <Button className={"w-full"} onClick={handleAddAdmin}>
                Promote admin
              </Button>
            )}
          </li>
        </ul>
      )}
    </div>
  );
}
