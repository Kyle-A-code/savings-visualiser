
import Empty from "./Empty";
import BucketCard from "./bucketCard/BucketCard";
import CreateDialog from "./createDialog/CreateDialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bucketsQueryOptions } from "../api/queryOptions";

const List = () => {
  const { data: buckets } = useSuspenseQuery(bucketsQueryOptions);

  if (buckets?.length === 0) return <Empty />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <CreateDialog />
      {buckets?.map((bucket) => (
        <BucketCard key={bucket.id} bucket={bucket} />
      ))}
    </div>
  );
};

export default List;
