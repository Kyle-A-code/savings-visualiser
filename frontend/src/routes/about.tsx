import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "../app/routes/AboutPage";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});