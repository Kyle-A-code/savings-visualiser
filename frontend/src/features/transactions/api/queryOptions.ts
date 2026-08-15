import { queryOptions } from "@tanstack/react-query";
import queryKeys from "./queryKeys";
import {
  getBucketTransactions,
  type GetBucketTransactionsParams,
} from "./getBucketTransactions";

export const bucketTransactionsQueryOptions = (
  bucketId: number,
  params: GetBucketTransactionsParams,
) =>
  queryOptions({
    queryKey: queryKeys.bucketList(bucketId, params),
    queryFn: () => getBucketTransactions(bucketId, params),
  });