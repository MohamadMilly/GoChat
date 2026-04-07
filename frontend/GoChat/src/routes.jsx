// pages
import App from "./App";
import { GroupPreview } from "./components/chat/GroupPreview";
import { ErrorPage } from "./components/errorElements/ErrorPage";
import { About } from "./routes/About";
import { ChatDetails } from "./routes/ChatDetails";
import { ChatPageWrapper } from "./routes/ChatPageWrapper";
import { ChatsListLanding } from "./routes/ChatsListLanding";
import { ChatsListPage } from "./routes/ChatsListPage";
import { EditGroupPage } from "./routes/EditGroupPage";
import { FindGroupPage } from "./routes/FindGroupPage";
import { GroupPermisstionsPage } from "./routes/GroupPermissionsPage";
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
        errorElement: <ErrorPage backRoute={-1} embedded={true} />,
      },
    ],
  },

  {
    path: "/chats",
    element: <ChatsListPage />,
    errorElement: <ErrorPage backRoute={"/"} />,
    children: [
      {
        index: true,
        element: <ChatsListLanding />,
      },
      {
        path: "/chats/direct/:id",
        element: <ChatPageWrapper />,
      },
      {
        path: "/chats/group/:id",
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
    path: "/users/:userId",
    element: <UserProfile />,
    errorElement: <ErrorPage backRoute={-1} />,
  },
  {
    path: "/users/me/profile",
    element: <MyProfile />,
    errorElement: <ErrorPage embedded={true} />,
  },
  {
    path: "/users/me/settings",
    element: <Settings />,
  },
  {
    path: "/users/me/profile/edit",
    element: <EditProfilePage />,
    errorElement: <ErrorPage embedded={true} />,
  },
  {
    path: "/users/me/preferences",
    element: <MyPreferences />,
    errorElement: <ErrorPage embedded={true} backRoute={-1} />,
  },
  {
    path: "/chats/:id/details",
    element: <ChatDetails />,
    errorElement: <ErrorPage backRoute={-1} />,
  },
  {
    path: "/chats/groups/:id/edit",
    element: <EditGroupPage />,
    errorElement: <ErrorPage backRoute={-1} />,
  },
  {
    path: "/chats/groups/:id/permissions",
    element: <GroupPermisstionsPage />,
    errorElement: <ErrorPage backRoute={-1} />,
  },
  {
    path: "*",
    element: (
      <ErrorPage
        title={"Page not found"}
        message={"Sorry, we couldn’t find the page you’re looking for."}
        status={"404"}
        backRoute={-1}
      />
    ),
  },
];
