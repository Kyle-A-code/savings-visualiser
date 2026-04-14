import { createFileRoute } from "@tanstack/react-router";
import { bucketsQueryOptions } from "../../features/buckets/api/queryOptions";
import Home from "../../features/buckets/components/home";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(bucketsQueryOptions);
  }
});