import { useQuery } from "@tanstack/react-query";
import type { Transaction, TransactionData } from "../types";
import queryKeys from "./queryKeys";
import { apiClient } from "../../../lib/apiClient";
import { mapTransactionDataToTransaction } from "./mapper";

export const getBucketTransactions = async (bucketId: string) => {
  return await apiClient.get<TransactionData[]>(`/transactions/bucket/${bucketId}`);
};

const useGetBucketTransactions = (bucketId: string) => {
  const { data, isError, isLoading } = useQuery<Transaction[]>({
    queryKey: queryKeys.bucketList(bucketId),
    queryFn: async () => {
      const response = await getBucketTransactions(bucketId);
      return response.map((transaction) => {
        return mapTransactionDataToTransaction(transaction);
      });
    },
  });
  return {
    data,
    isError,
    isLoading,
  };
};

export default useGetBucketTransactions;