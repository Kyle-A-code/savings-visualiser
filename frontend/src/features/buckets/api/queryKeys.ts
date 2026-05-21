const queryKeys = {
  list: () => ["buckets"],
  detail: (id: number) => ["buckets", id],
};

export default queryKeys;
