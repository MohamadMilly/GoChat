import { useState } from "react";
import { createContext, useContext } from "react";

const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const [conversation, setConversation] = useState(null);

  return (
    <ConversationContext.Provider value={{ conversation, setConversation }}>
      {children}
    </ConversationContext.Provider>
  );
}

export const useConversationContext = () => useContext(ConversationContext);
