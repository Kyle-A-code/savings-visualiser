import { queryOptions } from "@tanstack/react-query";
import queryKeys from "./queryKeys";
import { getBucketTransactions } from "./getBucketTransactions";
import { mapTransactionDataToTransaction } from "./mapper";

export const bucketTransactionsQueryOptions = (bucketId: string) => queryOptions({
  queryKey: queryKeys.bucketList(bucketId),
  queryFn: async () => (await getBucketTransactions(bucketId)).map(mapTransactionDataToTransaction),
});