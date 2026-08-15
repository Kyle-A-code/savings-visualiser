import { useQuery } from "@tanstack/react-query";
import type { Pagination } from "../../../types";
import type { Transaction } from "../types";
import queryKeys from "./queryKeys";
import { apiClient } from "../../../lib/apiClient";

export type TransactionOrder = "createdAt" | "-createdAt";
export type TransactionType = "credit" | "debit";

export interface GetBucketTransactionsParams {
  limit: number;
  offset: number;
  order?: TransactionOrder;
  type?: TransactionType;
  title?: string;
}

export const getBucketTransactions = async (
  bucketId: number,
  params: GetBucketTransactionsParams,
) => {
  const queryParams = new URLSearchParams({
    limit: `${params.limit}`,
    offset: `${params.offset}`,
  });

  if (params.order) {
    queryParams.append("order", params.order);
  }
  if (params.type) {
    queryParams.append("filter[type]", params.type);
  }
  if (params.title) {
    queryParams.append("filter[title]", params.title);
  }

  return await apiClient.get<Pagination<Transaction>>(
    `/transactions/bucket/${bucketId}?${queryParams.toString()}`,
  );
};

const useGetBucketTransactions = (
  bucketId: number,
  params: GetBucketTransactionsParams,
) => {
  const { data, isError, isLoading } = useQuery<Pagination<Transaction>>({
    queryKey: queryKeys.bucketList(bucketId, params),
    queryFn: () => getBucketTransactions(bucketId, params),
  });
  return {
    data,
    isError,
    isLoading,
  };
};

export default useGetBucketTransactions;
