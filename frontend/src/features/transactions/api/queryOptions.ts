import { queryOptions } from "@tanstack/react-query";
import queryKeys from "./queryKeys";
import { getBucketTransactions } from "./getBucketTransactions";

export const bucketTransactionsQueryOptions = (bucketId: number, limit: number, offset: number) =>
  queryOptions({
    queryKey: queryKeys.bucketList(bucketId, limit, offset),
    queryFn: () => getBucketTransactions(bucketId, limit, offset),
  });