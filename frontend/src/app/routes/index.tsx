import { createFileRoute } from "@tanstack/react-router";
import { List } from "../../features/buckets";

export const Route = createFileRoute("/")({
  component: List,
});