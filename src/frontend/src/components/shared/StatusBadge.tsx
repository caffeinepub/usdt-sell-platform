import type { OrderStatus } from "../../backend.d";
import { statusClass, statusLabel } from "../../utils/format";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cls = statusClass(status);
  const label = statusLabel(status);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-3 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${cls}`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
      {label}
    </span>
  );
}
