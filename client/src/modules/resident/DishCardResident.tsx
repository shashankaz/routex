import type { Dish } from "../../types";
import { Card, CardBody } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

interface DishCardResidentProps {
  dish: Dish;
  onOrder: (id: string) => void;
  ordering?: boolean;
}

function healthPillClass(score?: number | null): string {
  if (!score) return "bg-stone-50 text-stone-600 border-stone-200";
  if (score >= 7) return "bg-green-50 text-green-700 border-green-200";
  if (score >= 5) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-600 border-red-200";
}

export function DishCardResident({
  dish,
  onOrder,
  ordering,
}: DishCardResidentProps) {
  return (
    <Card className="overflow-hidden flex flex-col">
      {dish.mediaUrl ? (
        <img
          src={dish.mediaUrl}
          alt={dish.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-5xl">
          🍛
        </div>
      )}

      <CardBody className="flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-stone-800 text-base leading-tight">
            {dish.name}
          </h3>
          <span className="text-orange-600 font-black text-xl whitespace-nowrap">
            ₹{dish.price}
          </span>
        </div>

        <p className="text-xs text-stone-400 mb-3">
          by {dish.Chef?.name ?? "Chef"} · {dish.quantity} left
          {dish.mealSlot && dish.mealSlot !== "ANY" && (
            <span className="ml-2 text-amber-600 font-medium">
              {dish.mealSlot === "BREAKFAST"
                ? "🌅"
                : dish.mealSlot === "LUNCH"
                  ? "☀️"
                  : "🌙"}{" "}
              {dish.mealSlot.charAt(0) + dish.mealSlot.slice(1).toLowerCase()}
            </span>
          )}
        </p>

        <div className="flex gap-2 mb-2 flex-wrap">
          {dish.calories != null && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              🔥 {dish.calories} kcal
            </span>
          )}
          {dish.healthScore != null && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${healthPillClass(dish.healthScore)}`}
            >
              💚 {dish.healthScore}/10
            </span>
          )}
        </div>

        {dish.calories != null && dish.healthScore != null && (
          <p className="text-xs text-stone-400 font-mono mb-3 truncate">
            {dish.name} | ₹{dish.price} | {dish.calories} kcal | Score:{" "}
            {dish.healthScore}/10
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {dish.isVeg && <Badge label="🌿 Veg" color="green" />}
          {dish.tags.map((t) => (
            <Badge key={t} label={t} color="stone" />
          ))}
        </div>

        <div className="mt-auto">
          {dish.isSoldOut ? (
            <div className="w-full text-center py-2.5 rounded-xl bg-stone-100 text-stone-400 text-sm font-semibold">
              Sold Out
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => onOrder(dish.id)}
              loading={ordering}
            >
              Order Now
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
