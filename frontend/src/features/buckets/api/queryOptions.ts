import { queryOptions } from "@tanstack/react-query";
import { getBucket } from "./getBucket";
import queryKeys from "./queryKeys";
import { getBuckets } from "./getBuckets";

export const bucketsQueryOptions = queryOptions({
  queryKey: queryKeys.list(),
  queryFn: getBuckets,
});

export const bucketQueryOptions = (bucketId: number) =>
  queryOptions({
    queryKey: queryKeys.detail(bucketId),
    queryFn: () => getBucket(bucketId),
  });
