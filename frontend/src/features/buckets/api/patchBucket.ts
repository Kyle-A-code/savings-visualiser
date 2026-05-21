import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import queryKeys from "./queryKeys";
import { type Bucket, type PatchBucketRequest } from "../types";

const patchBucket = async ({ id, title }: PatchBucketRequest) => {
  return await apiClient.patch<Bucket>(`/buckets/${id}`, { title });
};

export const usePatchBucket = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation<
    Bucket,
    Error,
    PatchBucketRequest
  >({
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
    error,
  };
};
