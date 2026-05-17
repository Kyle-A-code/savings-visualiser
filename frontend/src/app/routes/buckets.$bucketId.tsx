import { createFileRoute } from "@tanstack/react-router";
import { BucketDetail } from "../../features/buckets";
import {
  BUCKET_TRANSACTIONS_DEFAULT_LIMIT,
  BUCKET_TRANSACTIONS_DEFAULT_OFFSET,
} from "../../features/buckets/constants";
import { bucketQueryOptions } from "../../features/buckets/api/queryOptions";
import { bucketTransactionsQueryOptions } from "../../features/transactions/api/queryOptions";

type BucketTransactionsSearch = {
  limit: number;
  offset: number;
};

const toPositiveInt = (value: unknown) => {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return undefined;
};

const toNonNegativeInt = (value: unknown) => {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }
  return undefined;
};

export const Route = createFileRoute("/buckets/$bucketId")({
  validateSearch: (search: Record<string, unknown>): BucketTransactionsSearch => ({
    limit: toPositiveInt(search.limit) ?? BUCKET_TRANSACTIONS_DEFAULT_LIMIT,
    offset: toNonNegativeInt(search.offset) ?? BUCKET_TRANSACTIONS_DEFAULT_OFFSET,
  }),
  loaderDeps: ({ search }) => ({
    limit: search.limit,
    offset: search.offset,
  }),
  component: BucketDetail,
  loader: ({ context: { queryClient }, params: { bucketId }, deps: { limit, offset } }) => {
    return Promise.all([
      queryClient.ensureQueryData(bucketQueryOptions(bucketId)),
      queryClient.ensureQueryData(bucketTransactionsQueryOptions(bucketId, limit, offset)),
    ]);
  },
});
