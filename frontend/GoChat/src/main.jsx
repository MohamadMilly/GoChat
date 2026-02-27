import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router";
import { routes } from "./routes.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// contexts
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ConversationProvider } from "./contexts/ConversationContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <ConversationProvider>
            <LanguageProvider>
              <ThemeProvider>
                <RouterProvider router={router} />
              </ThemeProvider>
            </LanguageProvider>
          </ConversationProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
