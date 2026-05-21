import { apiClient } from "../../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../api/queryKeys";
import bucketQueryKeys from "../../buckets/api/queryKeys";
import { type Transaction, type CreateTransactionRequest } from "../types";

export const createTransaction = async (
  transaction: CreateTransactionRequest,
) => {
  return await apiClient.post<Transaction>("/transactions", transaction);
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation<
    Transaction,
    Error,
    CreateTransactionRequest
  >({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bucketList(data.bucketId),
      });
      queryClient.invalidateQueries({
        queryKey: bucketQueryKeys.detail(data.bucketId),
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
    error,
  };
};
