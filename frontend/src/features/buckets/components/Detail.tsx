import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/buckets/$bucketId");

const Detail = () => {
  const { bucketId } = routeApi.useParams();
  return <div>Bucket {bucketId}</div>;
};

export default Detail;