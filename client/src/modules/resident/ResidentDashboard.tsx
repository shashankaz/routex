import { useState, useEffect, useCallback } from "react";
import { feedApi, orderApi } from "../../api/endpoints";
import type { Dish, Order, MealSlot } from "../../types";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { Spinner } from "../../components/Spinner";
import { DishCardResident } from "./DishCardResident";
import { OrderCard } from "./OrderCard";

type View = "feed" | "orders";

interface Filters {
  veg: boolean;
  highProtein: boolean;
  lowCalorie: boolean;
  mealSlot: MealSlot;
}

export function ResidentDashboard() {
  const [view, setView] = useState<View>("feed");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<Filters>({
    veg: false,
    highProtein: false,
    lowCalorie: false,
    mealSlot: "ANY",
  });
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchFeed = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const res = await feedApi.get({
        veg: filters.veg,
        highProtein: filters.highProtein,
        lowCalorie: filters.lowCalorie,
        mealSlot: filters.mealSlot,
      });
      setDishes((res.data as { dishes: Dish[] }).dishes);
    } finally {
      setLoadingFeed(false);
    }
  }, [filters]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await orderApi.myOrders();
      setOrders((res.data as { orders: Order[] }).orders);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (view === "orders") void fetchOrders();
  }, [view, fetchOrders]);

  const handleOrder = async (dishId: string) => {
    setOrderingId(dishId);
    try {
      await orderApi.place(dishId);
      setSuccessMsg("🎉 Order placed! A rider will be assigned shortly.");
      setTimeout(() => setSuccessMsg(""), 4000);
      void fetchFeed();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setOrderingId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await orderApi.cancel(orderId);
      void fetchOrders();
    } finally {
      setCancellingId(null);
    }
  };

  const toggleFilter = (key: keyof Omit<Filters, "mealSlot">) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setMealSlot = (slot: MealSlot) => {
    setFilters((prev) => ({
      ...prev,
      mealSlot: prev.mealSlot === slot ? "ANY" : slot,
    }));
  };

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  );

  return (
    <Layout subtitle="Resident Feed">
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <Button
          variant={view === "feed" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setView("feed")}
        >
          🍽️ Browse
        </Button>
        <Button
          variant={view === "orders" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setView("orders")}
        >
          📦 My Orders
          {activeOrders.length > 0 && (
            <span className="ml-1 bg-orange-200 text-orange-800 text-xs font-bold px-1.5 rounded-full">
              {activeOrders.length}
            </span>
          )}
        </Button>
      </div>

      {view === "feed" && (
        <>
          <div className="space-y-2 mb-5">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "veg", label: "🌿 Veg Only" },
                  { key: "highProtein", label: "💪 High Protein" },
                  { key: "lowCalorie", label: "🥗 Low Calorie" },
                ] as { key: keyof Omit<Filters, "mealSlot">; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    filters[key]
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { slot: "BREAKFAST" as MealSlot, label: "🌅 Breakfast" },
                { slot: "LUNCH" as MealSlot, label: "☀️ Lunch" },
                { slot: "DINNER" as MealSlot, label: "🌙 Dinner" },
              ].map(({ slot, label }) => (
                <button
                  key={slot}
                  onClick={() => setMealSlot(slot)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    filters.mealSlot === slot
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loadingFeed ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : dishes.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No dishes available"
              description="Chefs in your society haven't listed anything yet. Check back later!"
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {dishes.map((dish) => (
                <DishCardResident
                  key={dish.id}
                  dish={dish}
                  onOrder={(id) => void handleOrder(id)}
                  ordering={orderingId === dish.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {view === "orders" && (
        <>
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchOrders()}
            >
              ↻ Refresh
            </Button>
          </div>

          {loadingOrders ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="🛒"
              title="No orders yet"
              description="Place your first order from the Browse tab."
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={(id) => void handleCancel(id)}
                  cancelLoading={cancellingId === order.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
