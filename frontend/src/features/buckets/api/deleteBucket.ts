import { apiClient } from "../../../lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKeys from "./queryKeys";

export const deleteBucket = async (id: string) => {
  return await apiClient.delete(`/buckets/${id}`);
};

export const useDeleteBucket = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: deleteBucket,
    onSuccess: (_, id) => {
      // refetch the list and detail queries
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.list(), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.detail(id) });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return {
    deleteBucket: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
