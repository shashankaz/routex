import type { Dish } from "../../types";
import { Card, CardBody } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

interface DishCardChefProps {
  dish: Dish;
  onMarkSoldOut: (id: string) => void;
  onRestock: (id: string) => void;
  loading?: boolean;
}

function healthScoreClass(score?: number): string {
  if (!score) return "text-stone-700";
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-yellow-600";
  return "text-red-500";
}

export function DishCardChef({
  dish,
  onMarkSoldOut,
  onRestock,
  loading,
}: DishCardChefProps) {
  return (
    <Card className="overflow-hidden">
      {dish.mediaUrl ? (
        <img
          src={dish.mediaUrl}
          alt={dish.name}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-5xl">
          🍛
        </div>
      )}

      <CardBody>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-stone-800 text-base leading-tight">
            {dish.name}
          </h3>
          <span className="text-orange-600 font-black text-lg whitespace-nowrap">
            ₹{dish.price}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {dish.isSoldOut && <Badge label="Sold Out" color="red" />}
          {dish.isVeg && <Badge label="Veg" color="green" />}
          {dish.mealSlot && dish.mealSlot !== "ANY" && (
            <Badge
              label={`${
                dish.mealSlot === "BREAKFAST"
                  ? "🌅"
                  : dish.mealSlot === "LUNCH"
                    ? "☀️"
                    : "🌙"
              } ${dish.mealSlot.charAt(0) + dish.mealSlot.slice(1).toLowerCase()}`}
              color="stone"
            />
          )}
          {dish.tags.map((t) => (
            <Badge key={t} label={t} color="stone" />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-stone-50 rounded-xl p-2 text-center">
            <p className="text-xs text-stone-400 mb-0.5">Calories</p>
            <p className="text-sm font-bold text-stone-700">
              {dish.calories != null ? `${dish.calories} kcal` : "—"}
            </p>
          </div>
          <div className="bg-stone-50 rounded-xl p-2 text-center">
            <p className="text-xs text-stone-400 mb-0.5">Health</p>
            <p
              className={`text-sm font-bold ${healthScoreClass(dish.healthScore ?? undefined)}`}
            >
              {dish.healthScore != null ? `${dish.healthScore}/10` : "—"}
            </p>
          </div>
          <div className="bg-stone-50 rounded-xl p-2 text-center">
            <p className="text-xs text-stone-400 mb-0.5">Qty Left</p>
            <p className="text-sm font-bold text-stone-700">{dish.quantity}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {dish.isSoldOut ? (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              loading={loading}
              onClick={() => onRestock(dish.id)}
            >
              Restock
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              loading={loading}
              onClick={() => onMarkSoldOut(dish.id)}
            >
              Mark Sold Out
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
