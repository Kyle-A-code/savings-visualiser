import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Bucket } from "../types";
import queryKeys from "./queryKeys";

export const getBucket = async (id: number): Promise<Bucket> => {
  return await apiClient.get<Bucket>(`/buckets/${id}`);
};

export const useGetBucket = (id: number) => {
  const { data, isError, isLoading } = useQuery<Bucket>({
    queryKey: queryKeys.detail(id),
    queryFn: () => getBucket(id),
  });

  return {
    data,
    isError,
    isLoading,
  };
};
