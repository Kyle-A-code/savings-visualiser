import { useBuckets } from "../api/getBuckets";
import Empty from "./Empty";
import BucketCard from "./BucketCard";

const BucketsList = () => {
  const { data, isError, isLoading } = useBuckets();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error:</div>;

  if (data?.length === 0) return <Empty />;

  return (
    <div>
      {data?.map((bucket) => (
          <BucketCard key={bucket.id} bucket={bucket}/>
      ))}
    </div>
  );
};

export default BucketsList;
