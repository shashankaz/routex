import type { Order } from "../../types";
import { Card, CardBody } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

interface RiderOrderCardProps {
  order: Order;
  onAccept?: (id: string) => void;
  onPickedUp?: (id: string) => void;
  onDelivered?: (id: string) => void;
  loading?: boolean;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: "stone" | "orange" | "blue" | "green" | "red" | "yellow";
  }
> = {
  PENDING: { label: "Pending", color: "stone" },
  ASSIGNED: { label: "Assigned", color: "orange" },
  ACCEPTED: { label: "Accepted", color: "blue" },
  PICKED_UP: { label: "Picked Up", color: "yellow" },
  DELIVERED: { label: "Delivered", color: "green" },
  CANCELLED: { label: "Cancelled", color: "red" },
};

export function RiderOrderCard({
  order,
  onAccept,
  onPickedUp,
  onDelivered,
  loading,
}: RiderOrderCardProps) {
  const cfg = statusConfig[order.status] ?? {
    label: order.status,
    color: "stone",
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="font-bold text-stone-800">
              {order.Dish?.name ?? "Dish"}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge label={cfg.label} color={cfg.color} />
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-stone-500 mb-4">
          <span>💰 ₹{order.Dish?.price ?? "—"}</span>
          <span>🧑 {order.Customer?.name ?? "Customer"}</span>
          <span>
            🕐{" "}
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex gap-2">
          {order.status === "ASSIGNED" && onAccept && (
            <Button
              className="flex-1"
              loading={loading}
              onClick={() => onAccept(order.id)}
            >
              ✅ Accept Job
            </Button>
          )}
          {order.status === "ACCEPTED" && onPickedUp && (
            <Button
              className="flex-1"
              loading={loading}
              onClick={() => onPickedUp(order.id)}
            >
              📦 Mark Picked Up
            </Button>
          )}
          {order.status === "PICKED_UP" && onDelivered && (
            <Button
              variant="secondary"
              className="flex-1 border-green-400 text-green-700 hover:bg-green-50"
              loading={loading}
              onClick={() => onDelivered(order.id)}
            >
              🏠 Mark Delivered
            </Button>
          )}
          {order.status === "DELIVERED" && (
            <div className="text-sm text-green-600 font-semibold">
              ✓ Completed
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
