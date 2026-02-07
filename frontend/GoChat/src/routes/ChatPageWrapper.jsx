import { useParams } from "react-router";
import { ChatPage } from "./ChatPage";

export function ChatPageWrapper() {
  const { id } = useParams();
  return <ChatPage key={id} />;
}
