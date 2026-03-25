import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Bucket, BucketData } from "../types";
import queryKeys from "./queryKeys";

export const getBuckets = async () : Promise<BucketData[]> => {
  return await apiClient.get<BucketData[]>("/buckets");
};

export const useBuckets = () => {
  const { data, isError, isLoading } = useQuery<Bucket[]>({
    queryKey: queryKeys.buckets.list(),
    queryFn: async () => {
      const response = await getBuckets();
      return response.map((bucket) => {
        return {
          id: bucket.ID,
          title: bucket.Title,
          balance: bucket.Balance,
          createdAt: bucket.CreatedAt,
          updatedAt: bucket.UpdatedAt,
        };
      });
    },
  });

  return {
    data,
    isError,
    isLoading,
  };
};
