import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/buckets")({
  component: Outlet,
});