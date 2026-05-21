import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Goal, UpsertBucketGoalRequest } from "../types";
import queryKeys from "./queryKeys";

export const createBucketGoal = async ({
  bucketId,
  title,
  amount,
}: UpsertBucketGoalRequest) => {
  return await apiClient.post<Goal>(`/buckets/${bucketId}/goal`, {
    title,
    amount,
  });
};

export const useCreateBucketGoal = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation<
    Goal,
    Error,
    UpsertBucketGoalRequest
  >({
    mutationFn: createBucketGoal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.bucketId),
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    createBucketGoal: mutate,
    isPending,
    isError,
    isSuccess,
    error,
  };
};
