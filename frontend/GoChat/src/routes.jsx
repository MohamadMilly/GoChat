// pages

import App from "./App";
import { About } from "./routes/about";
import { ChatPage } from "./routes/ChatPage";
import { ChatsListPage } from "./routes/ChatsListPage";
import { LogInPage } from "./routes/LoginPage";
import { NewChatPage } from "./routes/newChatPage";
import { NewGroupPage } from "./routes/NewGroupPage";
import { SignUpPage } from "./routes/SignUpPage";
import { UserProfile } from "./routes/UserProfile";

export const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/auth/signup",
    element: <SignUpPage />,
  },
  {
    path: "/auth/login",
    element: <LogInPage />,
  },
  {
    path: "/chats",
    element: <ChatsListPage />,
    children: [
      {
        path: "/chats:id",
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "/chats/direct/new",
    element: <NewChatPage />,
  },
  {
    path: "/chats/group/new",
    element: <NewGroupPage />,
  },
  {
    path: "/chats/:id",
    element: <ChatPage />,
  },
  {
    path: "/users/:userId",
    element: <UserProfile />,
  },
];
