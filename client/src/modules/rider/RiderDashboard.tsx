import { useState, useEffect, useCallback } from "react";
import { riderApi, userApi } from "../../api/endpoints";
import type { Order } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { Layout } from "../../components/Layout";
import { Card, CardBody } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { EmptyState } from "../../components/EmptyState";
import { Spinner } from "../../components/Spinner";
import { RiderOrderCard } from "./RiderOrderCard";

export function RiderDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showLocationEdit, setShowLocationEdit] = useState(
    !user?.lat || !user?.lng,
  );
  const [latInput, setLatInput] = useState(user?.lat?.toString() ?? "");
  const [lngInput, setLngInput] = useState(user?.lng?.toString() ?? "");
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await riderApi.orders();
      setOrders((res.data as { orders: Order[] }).orders);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleToggleAvailability = async () => {
    setTogglingAvail(true);
    try {
      const res = await riderApi.toggleAvailability();
      setIsAvailable((res.data as { isAvailable: boolean }).isAvailable);
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await riderApi.accept(orderId);
      await fetchOrders();
    } finally {
      setActionLoading(null);
    }
  };

  const handlePickedUp = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await riderApi.updateStatus(orderId, "PICKED_UP");
      await fetchOrders();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelivered = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await riderApi.updateStatus(orderId, "DELIVERED");
      await fetchOrders();
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveLocation = async () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      setLocationMsg("Please enter valid numbers.");
      return;
    }
    setSavingLocation(true);
    setLocationMsg("");
    try {
      await userApi.updateLocation(lat, lng);
      setLocationMsg(
        "✓ Location saved! You are now matchable to nearby orders.",
      );
      setShowLocationEdit(false);
    } catch {
      setLocationMsg("Failed to save location. Please try again.");
    } finally {
      setSavingLocation(false);
    }
  };

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  );
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  return (
    <Layout subtitle="Rider Dashboard">
      <Card className="mb-6 overflow-hidden">
        <div
          className={`h-2 w-full transition-all duration-500 ${
            isAvailable ? "bg-green-400" : "bg-stone-200"
          }`}
        />
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-stone-800 text-base">
              {isAvailable ? "🟢 You're Online" : "⚫ You're Offline"}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {isAvailable
                ? "You'll receive new delivery jobs automatically."
                : "Toggle on to start receiving deliveries."}
            </p>
          </div>
          <button
            onClick={() => void handleToggleAvailability()}
            disabled={togglingAvail}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
              isAvailable ? "bg-green-500" : "bg-stone-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transform ring-0 transition duration-200 ease-in-out ${
                isAvailable ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </CardBody>
      </Card>

      {showLocationEdit ? (
        <Card className="mb-6">
          <CardBody>
            <p className="font-bold text-stone-800 text-sm mb-1">
              📍 Your Location
            </p>
            <p className="text-xs text-stone-400 mb-3">
              Required for the 2 km rider-matching algorithm. Without this,
              you’ll only be matched as a fallback.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                label="Latitude"
                type="number"
                step="any"
                placeholder="28.6139"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                placeholder="77.2090"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
              />
            </div>
            {locationMsg && (
              <p
                className={`text-xs mb-2 ${
                  locationMsg.startsWith("✓")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {locationMsg}
              </p>
            )}
            <Button
              size="sm"
              loading={savingLocation}
              onClick={() => void handleSaveLocation()}
              className="w-full"
            >
              Save Location
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => setShowLocationEdit(true)}
            className="text-xs text-stone-400 hover:text-stone-600 underline"
          >
            📍 Update my location
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Active Jobs", value: activeOrders.length, icon: "📦" },
          { label: "Completed", value: completedOrders.length, icon: "✅" },
          {
            label: "Earnings",
            value: `₹${completedOrders
              .reduce((s, o) => s + (o.Dish?.price ?? 0) * 0.15, 0)
              .toFixed(0)}`,
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-stone-700 text-sm uppercase tracking-wide">
          Delivery Jobs
        </h2>
        <Button variant="ghost" size="sm" onClick={() => void fetchOrders()}>
          ↻ Refresh
        </Button>
      </div>

      {loadingOrders ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🛵"
          title="No jobs yet"
          description={
            isAvailable
              ? "Waiting for orders to be assigned to you…"
              : "Go online to start receiving delivery jobs."
          }
        />
      ) : (
        <div className="space-y-3">
          {activeOrders.length > 0 && (
            <>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
                Active
              </p>
              {activeOrders.map((order) => (
                <RiderOrderCard
                  key={order.id}
                  order={order}
                  onAccept={(id) => void handleAccept(id)}
                  onPickedUp={(id) => void handlePickedUp(id)}
                  onDelivered={(id) => void handleDelivered(id)}
                  loading={actionLoading === order.id}
                />
              ))}
            </>
          )}

          {completedOrders.length > 0 && (
            <>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1 mt-6">
                Completed
              </p>
              {completedOrders.map((order) => (
                <RiderOrderCard key={order.id} order={order} />
              ))}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
