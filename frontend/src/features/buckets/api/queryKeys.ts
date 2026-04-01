const queryKeys = {
  list: () => ["buckets"],
  detail: (id: string) => ["buckets", id],
};

export default queryKeys;
