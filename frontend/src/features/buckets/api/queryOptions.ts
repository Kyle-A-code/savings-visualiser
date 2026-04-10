import { queryOptions } from "@tanstack/react-query";
import { getBucket } from "./getBucket";
import queryKeys from "./queryKeys";
import { mapBucketDataToBucket } from "./mappers";
import { getBuckets } from "./getBuckets";

export const bucketsQueryOptions = queryOptions({
  queryKey: queryKeys.list(),
  queryFn: async () => (await getBuckets()).map(mapBucketDataToBucket),
});

export const bucketQueryOptions = (bucketId: string) =>
  queryOptions({
    queryKey: queryKeys.detail(bucketId),
    queryFn: async () => mapBucketDataToBucket(await getBucket(bucketId)),
  });
