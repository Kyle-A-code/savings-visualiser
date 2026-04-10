import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Bucket, BucketData } from "../types";
import queryKeys from "./queryKeys";
import { mapBucketDataToBucket } from "./mappers";

export const getBucket = async (id: string) : Promise<BucketData> => {
  return await apiClient.get<BucketData>(`/buckets/${id}`);
};

export const useGetBucket = (id: string) => {
  const { data, isError, isLoading } = useQuery<Bucket>({
    queryKey: queryKeys.detail(id),
    queryFn: async () => {
      const response = await getBucket(id);
      return mapBucketDataToBucket(response);
    },
  });

  return {
    data,
    isError,
    isLoading,
  };
};
