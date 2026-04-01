const queryKeys = {
  list: () => ["transactions"],
  bucketList: (bucketId: number) => ["transactions", bucketId],
  detail: (id: string) => ["transactions", id],
};

export default queryKeys;
