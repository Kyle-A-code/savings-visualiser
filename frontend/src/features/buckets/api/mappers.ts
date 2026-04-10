import type { Bucket, BucketData } from "../types";

export const mapBucketDataToBucket = (bucket: BucketData): Bucket => {
  return {
    id: bucket.ID,
    title: bucket.Title,
    balance: bucket.Balance,
    createdAt: bucket.CreatedAt,
    updatedAt: bucket.UpdatedAt,
  };
};

