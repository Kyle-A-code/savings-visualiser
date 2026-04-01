import { apiClient } from "../../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "./queryKeys";
import { type BucketData, type CreateBucketRequest } from "../types";

export const createBucket = async (bucket: CreateBucketRequest) => {
  return await apiClient.post<BucketData>("/buckets", bucket);
};

export const useCreateBucket = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: createBucket,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      },
      onError: (error) => {
        console.error(error);
      },
    });
  return {
    createBucket: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
