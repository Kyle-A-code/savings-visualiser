import { apiClient } from "../../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "../api/queryKeys";
import bucketQueryKeys from "../../buckets/api/queryKeys";
import { type TransferRequest } from "../types";

interface TransferResponse {
  status: string;
}

export const createTransfer = async (
  transfer: TransferRequest,
) => {
  return await apiClient.post<TransferResponse>("/transactions/transfer", transfer);
};

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation<
    TransferResponse,
    Error,
    TransferRequest
  >({
    mutationFn: createTransfer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bucketList(variables.fromBucketId),
      });
      queryClient.invalidateQueries({
        queryKey: bucketQueryKeys.detail(variables.fromBucketId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bucketList(variables.toBucketId),
      });
      queryClient.invalidateQueries({
        queryKey: bucketQueryKeys.detail(variables.toBucketId),
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
    error,
  };
};
