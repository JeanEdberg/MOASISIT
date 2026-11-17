import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { AdditionalsView } from "@/lib/hr/AdditionalsView";

export const Route = createFileRoute("/adicionales")({
  component: AdditionalsPage,
});

function AdditionalsPage() {
  return (
    <Shell>
      <AdditionalsView />
    </Shell>
  );
}
