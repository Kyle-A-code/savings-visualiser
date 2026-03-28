import { useBuckets } from "../api/getBuckets";
import Empty from "./Empty";
import Card from "./card/Card";
import CreateDialog from "./createButton/CreateDialog";

const List = () => {
  const { data, isError, isLoading } = useBuckets();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error:</div>;

  if (data?.length === 0) return <Empty />;

  return (
    <div>
      <CreateDialog />
      {data?.map((bucket) => (
          <Card key={bucket.id} bucket={bucket}/>
      ))}
    </div>
  );
};

export default List;
