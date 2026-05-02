import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authApi, societyApi, userApi } from "../../api/endpoints";
import type { Society } from "../../types";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

type Mode = "login" | "register";

export function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [societies, setSocieties] = useState<Society[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RESIDENT");
  const [societyId, setSocietyId] = useState("");
  const [newSociety, setNewSociety] = useState("");
  const [riderLat, setRiderLat] = useState("");
  const [riderLng, setRiderLng] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void societyApi.list().then((r) => {
      const list = (r.data as { societies: Society[] }).societies;
      setSocieties(list);
      if (list.length > 0) setSocietyId(list[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        let finalSocietyId = societyId;

        if (newSociety.trim()) {
          const res = await societyApi.create(newSociety.trim());
          finalSocietyId = (res.data as { society: Society }).society.id;
        }

        await authApi.register({
          name,
          email,
          password,
          role,
          societyId: finalSocietyId,
        });
        await login(email, password);

        if (role === "RIDER" && riderLat && riderLng) {
          const lat = parseFloat(riderLat);
          const lng = parseFloat(riderLng);
          if (!isNaN(lat) && !isNaN(lng)) {
            await userApi.updateLocation(lat, lng).catch(() => {
              // Ignore location update errors during registration
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏠</div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">
            Society HomeChef
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Hyperlocal home-cooked meals, just a floor away
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8">
          <div className="flex bg-stone-100 rounded-2xl p-1 mb-6">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-500"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {mode === "register" && (
              <Input
                label="Full Name"
                type="text"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === "register" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    I am a
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "RESIDENT", label: "🛒 Resident" },
                        { value: "CHEF", label: "👨‍🍳 Chef" },
                        { value: "RIDER", label: "🛵 Rider" },
                      ] as const
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          role === value
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-stone-200 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {role === "RIDER" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Your location coordinates
                    </label>
                    <p className="text-xs text-stone-400">
                      Used to match you with nearby orders (within 2 km).
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Latitude"
                        type="number"
                        step="any"
                        placeholder="28.6139"
                        value={riderLat}
                        onChange={(e) => setRiderLat(e.target.value)}
                      />
                      <Input
                        label="Longitude"
                        type="number"
                        step="any"
                        placeholder="77.2090"
                        value={riderLng}
                        onChange={(e) => setRiderLng(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-orange-400">
                      Tip: find your lat/lng at{" "}
                      <a
                        href="https://www.latlong.net/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        latlong.net
                      </a>
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Society
                  </label>
                  {societies.length > 0 && (
                    <select
                      value={societyId}
                      onChange={(e) => setSocietyId(e.target.value)}
                      disabled={newSociety.trim().length > 0}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-40"
                    >
                      {societies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <Input
                    placeholder="Or create new: Green Park Residency"
                    value={newSociety}
                    onChange={(e) => setNewSociety(e.target.value)}
                  />
                  {newSociety.trim() && (
                    <p className="text-xs text-orange-500">
                      A new society named &quot;{newSociety}&quot; will be
                      created.
                    </p>
                  )}
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Society HomeChef · MVP
        </p>
      </div>
    </div>
  );
}
