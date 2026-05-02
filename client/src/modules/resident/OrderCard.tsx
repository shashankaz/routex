import type { Order } from "../../types";
import { Card, CardBody } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

const statusConfig: Record<
  string,
  {
    label: string;
    color: "stone" | "orange" | "blue" | "green" | "red" | "yellow";
  }
> = {
  PENDING: { label: "Waiting for rider", color: "stone" },
  ASSIGNED: { label: "Rider assigned", color: "orange" },
  ACCEPTED: { label: "Rider accepted", color: "blue" },
  PICKED_UP: { label: "On the way", color: "yellow" },
  DELIVERED: { label: "Delivered", color: "green" },
  CANCELLED: { label: "Cancelled", color: "red" },
};

const statusHint: Record<string, string> = {
  PENDING: "Looking for a nearby rider… This may take a moment.",
  ASSIGNED: "A rider has been assigned and will accept shortly.",
  ACCEPTED: "Your rider is heading to the chef to pick up your order.",
  PICKED_UP: "Your food is on the way!",
  DELIVERED: "Enjoy your meal!",
  CANCELLED: "This order was cancelled.",
};

interface OrderCardProps {
  order: Order;
  onCancel?: (id: string) => void;
  cancelLoading?: boolean;
}

export function OrderCard({ order, onCancel, cancelLoading }: OrderCardProps) {
  const cfg = statusConfig[order.status] ?? {
    label: order.status,
    color: "stone",
  };
  const hint = statusHint[order.status] ?? "";
  const canCancel = order.status === "PENDING" || order.status === "ASSIGNED";

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="font-bold text-stone-800 text-sm">
              {order.Dish?.name ?? "Dish"}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge label={cfg.label} color={cfg.color} />
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-500 mb-2">
          <span>₹{order.Dish?.price ?? "—"}</span>
          {order.Rider ? (
            <span>🛵 {order.Rider.name}</span>
          ) : order.status === "PENDING" ? (
            <span className="text-amber-500 font-medium animate-pulse">
              🔍 Finding rider…
            </span>
          ) : null}
          <span>
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {hint && (
          <p className="text-xs text-stone-400 mb-3 leading-relaxed">{hint}</p>
        )}

        <div className="flex gap-1 mb-3">
          {["PENDING", "ASSIGNED", "ACCEPTED", "PICKED_UP", "DELIVERED"].map(
            (s) => {
              const statuses = [
                "PENDING",
                "ASSIGNED",
                "ACCEPTED",
                "PICKED_UP",
                "DELIVERED",
              ];
              const currentIdx = statuses.indexOf(order.status);
              const stepIdx = statuses.indexOf(s);
              const active =
                stepIdx <= currentIdx && order.status !== "CANCELLED";
              return (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    active ? "bg-orange-400" : "bg-stone-100"
                  }`}
                />
              );
            },
          )}
        </div>

        {canCancel && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            loading={cancelLoading}
            onClick={() => onCancel(order.id)}
            className="text-red-500 hover:bg-red-50 w-full"
          >
            Cancel Order
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
