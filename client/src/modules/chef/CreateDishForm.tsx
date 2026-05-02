import { useState } from "react";
import { dishApi } from "../../api/endpoints";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import type { MealSlot } from "../../types";

interface CreateDishFormProps {
  onCreated: () => void;
}

const MEAL_SLOTS: { value: MealSlot; label: string; icon: string }[] = [
  { value: "BREAKFAST", label: "Breakfast", icon: "🌅" },
  { value: "LUNCH", label: "Lunch", icon: "☀️" },
  { value: "DINNER", label: "Dinner", icon: "🌙" },
  { value: "ANY", label: "Any Time", icon: "🕐" },
];

export function CreateDishForm({ onCreated }: CreateDishFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mealSlot, setMealSlot] = useState<MealSlot>("ANY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantity) {
      setError("Name, price and quantity are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await dishApi.create({
        name,
        price: Number(price),
        quantity: Number(quantity),
        mediaUrl: mediaUrl || undefined,
        mealSlot,
      });
      setName("");
      setPrice("");
      setQuantity("");
      setMediaUrl("");
      setMealSlot("ANY");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create dish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input
        label="Dish Name"
        placeholder="Paneer Butter Masala"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (₹)"
          type="number"
          min="1"
          placeholder="120"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          label="Quantity"
          type="number"
          min="1"
          placeholder="10"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Meal Slot
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_SLOTS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMealSlot(value)}
              className={`py-2 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                mealSlot === value
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Image / Video URL (optional)"
        placeholder="https://..."
        value={mediaUrl}
        onChange={(e) => setMediaUrl(e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      {name.length >= 3 && (
        <p className="text-xs text-stone-400 bg-stone-50 rounded-xl px-4 py-2">
          🤖 AI will auto-generate calories & health score based on the dish
          name once published.
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        🍴 Publish Dish
      </Button>
    </form>
  );
}
