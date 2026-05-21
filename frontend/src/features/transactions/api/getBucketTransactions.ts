import { useQuery } from "@tanstack/react-query";
import type { Pagination } from "../../../types";
import type { Transaction } from "../types";
import queryKeys from "./queryKeys";
import { apiClient } from "../../../lib/apiClient";

export const getBucketTransactions = async (bucketId: number, limit: number, offset: number) => {
  const queryString = new URLSearchParams({
    limit: `${limit}`,
    offset: `${offset}`,
  }).toString();

  return await apiClient.get<Pagination<Transaction>>(
    `/transactions/bucket/${bucketId}?${queryString}`,
  );
};

const useGetBucketTransactions = (bucketId: number, limit: number, offset: number) => {
  const { data, isError, isLoading } = useQuery<Pagination<Transaction>>({
    queryKey: queryKeys.bucketList(bucketId, limit, offset),
    queryFn: () => getBucketTransactions(bucketId, limit, offset),
  });
  return {
    data,
    isError,
    isLoading,
  };
};

export default useGetBucketTransactions;