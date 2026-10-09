import { createFileRoute } from "@tanstack/react-router";
import { Derby } from "../derby/Derby";

export const Route = createFileRoute("/")({
  component: Derby,
});
