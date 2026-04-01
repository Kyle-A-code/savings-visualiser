import { apiClient } from "../../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../api/queryKeys";
import bucketQueryKeys from "../../buckets/api/queryKeys";
import { type TransactionData, type CreateTransactionRequest } from "../types";

export const createTransaction = async (
  transaction: CreateTransactionRequest,
) => {
  return await apiClient.post<TransactionData>("/transactions", transaction);
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bucketList(data.BucketId),
      });
      queryClient.invalidateQueries({
        queryKey: bucketQueryKeys.detail(data.BucketId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: bucketQueryKeys.list(),
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return {
    createTransaction: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
