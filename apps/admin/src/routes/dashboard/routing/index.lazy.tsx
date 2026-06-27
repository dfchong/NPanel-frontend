import { createLazyFileRoute } from "@tanstack/react-router";
import Routing from "@/sections/routing";

export const Route = createLazyFileRoute("/dashboard/routing/")({
  component: Routing,
});
