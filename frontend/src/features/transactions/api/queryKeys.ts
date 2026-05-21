const queryKeys = {
  list: () => ["transactions"],
  bucketList: (bucketId: number, limit?: number, offset?: number) =>
    limit === undefined || offset === undefined
      ? ["transactions", "bucket", bucketId]
      : ["transactions", "bucket", bucketId, limit, offset],
  detail: (id: number) => ["transactions", id],
};

export default queryKeys;
