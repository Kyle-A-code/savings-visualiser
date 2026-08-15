import { createFileRoute, notFound } from "@tanstack/react-router";
import { BucketDetail } from "../../features/buckets";
import {
  BUCKET_TRANSACTIONS_DEFAULT_LIMIT,
  BUCKET_TRANSACTIONS_DEFAULT_OFFSET,
} from "../../features/buckets/constants";
import { bucketQueryOptions } from "../../features/buckets/api/queryOptions";
import { bucketTransactionsQueryOptions } from "../../features/transactions/api/queryOptions";
import type {
  TransactionOrder,
  TransactionType,
} from "../../features/transactions/api/getBucketTransactions";

type BucketTransactionsSearch = {
  limit: number;
  offset: number;
  order?: TransactionOrder;
  type?: TransactionType;
  title?: string;
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

const parseBucketId = (value: string) => {
  const bucketId = Number(value);
  if (!Number.isInteger(bucketId) || bucketId <= 0) {
    throw notFound();
  }
  return bucketId;
};

const parseTransactionType = (
  value: unknown,
): TransactionType | undefined => {
  if (value === "credit" || value === "debit") {
    return value;
  }
  return undefined;
};

const parseTransactionOrder = (
  value: unknown,
): TransactionOrder | undefined => {
  if (value === "createdAt" || value === "-createdAt") {
    return value;
  }
  return undefined;
};

const parseTitleFilter = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }

  return trimmed;
};

export const Route = createFileRoute("/buckets/$bucketId")({
  params: {
    parse: (params) => ({
      bucketId: parseBucketId(params.bucketId),
    }),
    stringify: ({ bucketId }) => ({
      bucketId: String(bucketId),
    }),
  },
  validateSearch: (
    search: Record<string, unknown>,
  ): BucketTransactionsSearch => ({
    limit: toPositiveInt(search.limit) ?? BUCKET_TRANSACTIONS_DEFAULT_LIMIT,
    offset:
      toNonNegativeInt(search.offset) ?? BUCKET_TRANSACTIONS_DEFAULT_OFFSET,
    type: parseTransactionType(search.type),
    title: parseTitleFilter(search.title),
    order: parseTransactionOrder(search.order),
  }),
  loaderDeps: ({ search }) => ({
    limit: search.limit,
    offset: search.offset,
    type: search.type,
    title: search.title,
    order: search.order,
  }),
  component: BucketDetail,
  loader: ({
    context: { queryClient },
    params: { bucketId },
    deps: { limit, offset, type, title, order },
  }) => {
    return Promise.all([
      queryClient.ensureQueryData(bucketQueryOptions(bucketId)),
      queryClient.ensureQueryData(
        bucketTransactionsQueryOptions(bucketId, {
          limit,
          offset,
          type,
          title,
          order,
        }),
      ),
    ]);
  },
});
