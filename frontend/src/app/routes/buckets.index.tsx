import { createFileRoute } from "@tanstack/react-router";
import { List } from "../../features/buckets";
import { bucketsQueryOptions } from "../../features/buckets/api/queryOptions";

export const Route = createFileRoute("/buckets/")({
  component: List,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(bucketsQueryOptions);
  },
});
