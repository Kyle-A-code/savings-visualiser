const queryKeys = {
  buckets: {
    list: () => ["buckets"],
    detail: (id: string) => ["buckets", id],
  },
};

export default queryKeys;
