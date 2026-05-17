const queryKeys = {
  list: () => ["transactions"],
  bucketList: (bucketId: string, limit?: number, offset?: number) =>
    limit === undefined || offset === undefined
      ? ["transactions", "bucket", bucketId]
      : ["transactions", "bucket", bucketId, limit, offset],
  detail: (id: string) => ["transactions", id],
};

export default queryKeys;
