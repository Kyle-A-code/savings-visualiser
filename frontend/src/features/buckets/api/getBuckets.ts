import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Bucket } from "../types";
import queryKeys from "./queryKeys";

export const getBuckets = async (): Promise<Bucket[]> => {
  return await apiClient.get<Bucket[]>("/buckets");
};

export const useBuckets = () => {
  const { data, isError, isLoading } = useQuery<Bucket[]>({
    queryKey: queryKeys.list(),
    queryFn: getBuckets,
  });

  return {
    data,
    isError,
    isLoading,
  };
};
