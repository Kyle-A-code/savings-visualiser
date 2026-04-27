import { createFileRoute } from "@tanstack/react-router";
import { bucketsQueryOptions } from "../../features/buckets/api/queryOptions";
import Overview from "../../features/buckets/components/overview/Overview";

export const Route = createFileRoute("/")({
  component: Overview,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(bucketsQueryOptions);
  }
});