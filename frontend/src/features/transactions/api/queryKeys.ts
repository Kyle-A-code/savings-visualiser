import type { GetBucketTransactionsParams } from "./getBucketTransactions";

const queryKeys = {
  list: () => ["transactions"],
  bucketList: (bucketId: number, params?: GetBucketTransactionsParams) =>
    ["transactions", "bucket", bucketId, params],
  detail: (id: number) => ["transactions", id],
};

export default queryKeys;
