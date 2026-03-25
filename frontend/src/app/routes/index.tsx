import { createFileRoute } from "@tanstack/react-router";
import { BucketsList } from "../../features/buckets";

export const Route = createFileRoute("/")({
  component: BucketsList,
});