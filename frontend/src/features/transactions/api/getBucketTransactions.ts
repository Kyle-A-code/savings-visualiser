import { useQuery } from "@tanstack/react-query";
import type { Transaction, TransactionData } from "../types";
import queryKeys from "./queryKeys";
import { apiClient } from "../../../lib/apiClient";

const getBucketTransactions = async (bucketId: number) => {
  return await apiClient.get<TransactionData[]>(`/transactions/bucket/${bucketId}`);
};

const useGetBucketTransactions = (bucketId: number) => {
  const { data, isError, isLoading } = useQuery<Transaction[]>({
    queryKey: queryKeys.bucketList(bucketId),
    queryFn: async () => {
      const response = await getBucketTransactions(bucketId);
      return response.map((transaction) => {
        return {
          id: transaction.ID,
          title: transaction.Title,
          amount: transaction.Amount,
          bucketId: transaction.BucketId,
          createdAt: transaction.CreatedAt,
          updatedAt: transaction.UpdatedAt,
        };
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