const queryKeys = {
  list: () => ["transactions"],
  bucketList: (bucketId: string) => ["transactions", bucketId],
  detail: (id: string) => ["transactions", id],
};

export default queryKeys;
