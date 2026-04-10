import { createRootRouteWithContext } from "@tanstack/react-router";
import { RootLayout } from "../../components/layouts";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
});
