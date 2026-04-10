import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Bucket, BucketData } from "../types";
import queryKeys from "./queryKeys";
import { mapBucketDataToBucket } from "./mappers";

export const getBuckets = async () : Promise<BucketData[]> => {
  return await apiClient.get<BucketData[]>("/buckets");
};

export const useBuckets = () => {
  const { data, isError, isLoading } = useQuery<Bucket[]>({
    queryKey: queryKeys.list(),
    queryFn: async () => {
      const response = await getBuckets();
      return response.map(mapBucketDataToBucket);
    },
  });

  return {
    data,
    isError,
    isLoading,
  };
};
