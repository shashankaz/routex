import { useState, useEffect, useCallback } from "react";
import { dishApi } from "../../api/endpoints";
import type { Dish, ChefAnalytics } from "../../types";
import { Layout } from "../../components/Layout";
import { Card, CardBody } from "../../components/Card";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { Spinner } from "../../components/Spinner";
import { CreateDishForm } from "./CreateDishForm";
import { DishCardChef } from "./DishCardChef";

type View = "listings" | "create" | "analytics";

export function ChefDashboard() {
  const [view, setView] = useState<View>("listings");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [analytics, setAnalytics] = useState<ChefAnalytics | null>(null);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDishes = useCallback(async () => {
    setLoadingDishes(true);
    try {
      const res = await dishApi.myDishes();
      setDishes((res.data as { dishes: Dish[] }).dishes);
    } finally {
      setLoadingDishes(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await dishApi.analytics();
      setAnalytics((res.data as { analytics: ChefAnalytics }).analytics);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    void fetchDishes();
  }, [fetchDishes]);

  useEffect(() => {
    if (view === "analytics") void fetchAnalytics();
  }, [view, fetchAnalytics]);

  const handleMarkSoldOut = async (id: string) => {
    setActionLoading(id);
    try {
      await dishApi.markSoldOut(id);
      await fetchDishes();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestock = async (id: string) => {
    const input = window.prompt("How many to restock?", "5");
    const qty = Number(input);
    if (!input || isNaN(qty) || qty < 1) return;
    setActionLoading(id);
    try {
      await dishApi.restock(id, qty);
      await fetchDishes();
    } finally {
      setActionLoading(null);
    }
  };

  const totalRevenuePotential = dishes.reduce(
    (sum, d) => sum + d.price * d.quantity,
    0,
  );

  return (
    <Layout subtitle="Chef Dashboard">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Dishes", value: dishes.length, icon: "🍽️" },
          {
            label: "Active",
            value: dishes.filter((d) => !d.isSoldOut).length,
            icon: "✅",
          },
          {
            label: "Revenue Potential",
            value: `₹${totalRevenuePotential}`,
            icon: "💰",
          },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardBody className="py-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-lg font-black text-stone-800">{value}</div>
              <div className="text-xs text-stone-400">{label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={view === "listings" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setView("listings")}
        >
          My Dishes
        </Button>
        <Button
          variant={view === "create" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setView("create")}
        >
          + Publish New Dish
        </Button>
        <Button
          variant={view === "analytics" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setView("analytics")}
        >
          📊 Analytics
        </Button>
      </div>

      {view === "analytics" && (
        <>
          {loadingAnalytics ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : !analytics ? (
            <EmptyState
              icon="📊"
              title="No analytics yet"
              description="Publish dishes to see analytics."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total Orders",
                    value: analytics.totalOrders,
                    icon: "📦",
                  },
                  {
                    label: "Delivered",
                    value: analytics.deliveredOrders,
                    icon: "✅",
                  },
                  {
                    label: "Revenue (delivered)",
                    value: `₹${analytics.totalRevenue.toFixed(0)}`,
                    icon: "💰",
                  },
                  {
                    label: "Active Dishes",
                    value: analytics.activeDishes,
                    icon: "🍽️",
                  },
                ].map(({ label, value, icon }) => (
                  <Card key={label}>
                    <CardBody className="py-4 text-center">
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-lg font-black text-stone-800">
                        {value}
                      </div>
                      <div className="text-xs text-stone-400">{label}</div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {analytics.topDish && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                      ⭐ Top Dish
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-800">
                          {analytics.topDish.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {analytics.topDish.orders} orders · ₹
                          {analytics.topDish.revenue.toFixed(0)} revenue
                        </p>
                      </div>
                      <span className="text-orange-600 font-black text-lg">
                        ₹{analytics.topDish.price}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardBody>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                    All Dishes
                  </p>
                  <div className="space-y-2">
                    {analytics.dishes.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-stone-800">
                            {d.name}
                          </p>
                          <p className="text-xs text-stone-400">
                            {d.orders} orders · {d.delivered} delivered
                          </p>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          ₹{d.revenue.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}

      {view === "create" && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="font-bold text-stone-800 mb-4">
              Publish a Dish of the Day
            </h2>
            <CreateDishForm
              onCreated={() => {
                void fetchDishes();
                setView("listings");
              }}
            />
          </CardBody>
        </Card>
      )}

      {view === "listings" && (
        <>
          {loadingDishes ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : dishes.length === 0 ? (
            <EmptyState
              icon="👨‍🍳"
              title="No dishes published yet"
              description="Tap 'Publish New Dish' to list your first creation."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {dishes.map((dish) => (
                <DishCardChef
                  key={dish.id}
                  dish={dish}
                  onMarkSoldOut={(id) => void handleMarkSoldOut(id)}
                  onRestock={(id) => void handleRestock(id)}
                  loading={actionLoading === dish.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
