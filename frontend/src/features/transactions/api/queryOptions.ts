import { queryOptions } from "@tanstack/react-query";
import queryKeys from "./queryKeys";
import { getBucketTransactions } from "./getBucketTransactions";
import { mapTransactionDataToTransaction } from "./mapper";

export const bucketTransactionsQueryOptions = (bucketId: string, limit: number, offset: number) => queryOptions({
  queryKey: queryKeys.bucketList(bucketId, limit, offset),
  queryFn: async () => {
    const response = await getBucketTransactions(bucketId, limit, offset)
    return {
      items: response.items.map(mapTransactionDataToTransaction),
      totalRecords: response.totalRecords,
      limit: response.limit,
      offset: response.offset,
      currentPage: response.currentPage,
    };
  },
});