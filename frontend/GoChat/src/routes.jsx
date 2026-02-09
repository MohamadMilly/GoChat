// pages

import App from "./App";
import { GroupPreview } from "./components/chat/GroupPreview";
import { About } from "./routes/About";
import { ChatDetails } from "./routes/ChatDetails";

import { ChatPageWrapper } from "./routes/ChatPageWrapper";
import { ChatsListLanding } from "./routes/ChatsListLanding";
import { ChatsListPage } from "./routes/ChatsListPage";
import { FindGroupPage } from "./routes/FindGroupPage";
import { LogInPage } from "./routes/LogInPage";
import { EditProfilePage } from "./routes/me/EditProfile";
import { MyPreferences } from "./routes/me/MyPreferences";
import { MyProfile } from "./routes/me/MyProfile";
import { Settings } from "./routes/me/Settings";
import { NewChatPage } from "./routes/NewChatPage";
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
    path: "/chats/groups",
    element: <FindGroupPage />,
    children: [
      {
        path: "/chats/groups/:id/preview",
        element: <GroupPreview />,
      },
    ],
  },

  {
    path: "/chats",
    element: <ChatsListPage />,
    children: [
      {
        index: true,
        element: <ChatsListLanding />,
      },
      {
        path: "/chats/:id",
        element: <ChatPageWrapper />,
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
    element: <ChatPageWrapper />,
  },
  {
    path: "/users/:userId",
    element: <UserProfile />,
  },
  {
    path: "/users/me/profile",
    element: <MyProfile />,
  },
  {
    path: "/users/me/settings",
    element: <Settings />,
  },
  {
    path: "/users/me/profile/edit",
    element: <EditProfilePage />,
  },
  {
    path: "/users/me/preferences",
    element: <MyPreferences />,
  },
  {
    path: "/chats/:id/details",
    element: <ChatDetails />,
  },
];
