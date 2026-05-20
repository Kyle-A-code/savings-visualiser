import ThemeProvider from "../providers/ThemeProvider.tsx";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";

import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

// TODO: Add default components
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultErrorComponent: () => <div>Error</div>,
  defaultPendingComponent: () => <div>Loading...</div>,
  defaultNotFoundComponent: () => <div>Not Found</div>,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
