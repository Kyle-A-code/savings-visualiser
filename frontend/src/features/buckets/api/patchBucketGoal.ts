import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Goal, UpsertBucketGoalRequest } from "../types";
import queryKeys from "./queryKeys";

export const patchBucketGoal = async ({
  bucketId,
  title,
  amount,
}: UpsertBucketGoalRequest) => {
  return await apiClient.patch<Goal>(`/buckets/${bucketId}/goal`, {
    title,
    amount,
  });
};

export const usePatchBucketGoal = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: patchBucketGoal,
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
    patchBucketGoal: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
