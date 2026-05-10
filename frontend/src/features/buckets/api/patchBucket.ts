import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import queryKeys from "./queryKeys";
import { type BucketData, type PatchBucketRequest } from "../types";

const patchBucket = async ({ id, title }: PatchBucketRequest) => {
  return await apiClient.patch<BucketData>(`/buckets/${id}`, { title });
};

export const usePatchBucket = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: patchBucket,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    patchBucket: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
