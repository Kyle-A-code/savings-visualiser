import { useQuery } from "@tanstack/react-query";
import type { Pagination } from "../../../types";
import type { Transaction, TransactionData } from "../types";
import queryKeys from "./queryKeys";
import { apiClient } from "../../../lib/apiClient";
import { mapTransactionDataToTransaction } from "./mapper";

export const getBucketTransactions = async (bucketId: string, limit: number, offset: number) => {
  const queryString = new URLSearchParams({
    limit: `${limit}`,
    offset: `${offset}`,
  }).toString();

  return await apiClient.get<Pagination<TransactionData>>(
    `/transactions/bucket/${bucketId}?${queryString}`,
  );
};

const useGetBucketTransactions = (bucketId: string, limit: number, offset: number) => {
  const { data, isError, isLoading } = useQuery<Pagination<Transaction>>({
    queryKey: queryKeys.bucketList(bucketId, limit, offset),
    queryFn: async () => {
      const response = await getBucketTransactions(bucketId, limit, offset);
      return {
        items: response.items.map(mapTransactionDataToTransaction),
        totalRecords: response.totalRecords,
        limit: response.limit,
        offset: response.offset,
        currentPage: response.currentPage,
      };
    },
  });
  return {
    data,
    isError,
    isLoading,
  };
};

export default useGetBucketTransactions;