import { createFileRoute } from "@tanstack/react-router";
import { BucketDetail } from "../../features/buckets";

export const Route = createFileRoute("/buckets/$bucketId")({
  component: BucketDetail,
});
