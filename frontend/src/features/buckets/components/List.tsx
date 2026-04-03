import { useBuckets } from "../api/getBuckets";
import Empty from "./Empty";
import BucketCard from "./bucketCard/BucketCard";
import CreateDialog from "./createDialog/CreateDialog";

const List = () => {
  const { data, isError, isLoading } = useBuckets();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error:</div>;

  if (data?.length === 0) return <Empty />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <CreateDialog />
      {data?.map((bucket) => (
        <BucketCard key={bucket.id} bucket={bucket} />
      ))}
    </div>
  );
};

export default List;
