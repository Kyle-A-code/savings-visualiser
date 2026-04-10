import { createFileRoute } from "@tanstack/react-router";
import { BucketDetail } from "../../features/buckets";
import { bucketQueryOptions } from "../../features/buckets/api/queryOptions";
import { bucketTransactionsQueryOptions } from "../../features/transactions/api/queryOptions";

export const Route = createFileRoute("/buckets/$bucketId")({
  component: BucketDetail,
  loader: ({ context: { queryClient }, params: { bucketId } }) => {
    return Promise.all([
      queryClient.ensureQueryData(bucketQueryOptions(bucketId)),
      queryClient.ensureQueryData(bucketTransactionsQueryOptions(bucketId)),
    ]);
  },
});
