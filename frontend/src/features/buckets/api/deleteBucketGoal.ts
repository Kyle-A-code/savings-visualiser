import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import queryKeys from "./queryKeys";

export const deleteBucketGoal = async (bucketId: number) => {
  return await apiClient.delete(`/buckets/${bucketId}/goal`);
};

export const useDeleteBucketGoal = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: deleteBucketGoal,
    onSuccess: (_, bucketId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(bucketId) });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    deleteBucketGoal: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
