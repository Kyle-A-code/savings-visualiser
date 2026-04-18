import { apiClient } from "../../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../api/queryKeys";
import bucketQueryKeys from "../../buckets/api/queryKeys";
import { type TransactionData, type TransferRequest } from "../types";

export const createTransaction = async (
  transfer: TransferRequest,
) => {
  return await apiClient.post<TransactionData>("/transactions/transfer", transfer);
};

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bucketList(data.BucketId.toString()),
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
    transfer: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
