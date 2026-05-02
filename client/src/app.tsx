import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./modules/auth/AuthPage";
import { ChefDashboard } from "./modules/chef/ChefDashboard";
import { ResidentDashboard } from "./modules/resident/ResidentDashboard";
import { RiderDashboard } from "./modules/rider/RiderDashboard";
import { FullPageSpinner } from "./components/Spinner";

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <AuthPage />;

  switch (user.role) {
    case "CHEF":
      return <ChefDashboard />;
    case "RESIDENT":
      return <ResidentDashboard />;
    case "RIDER":
      return <RiderDashboard />;
    default:
      return <AuthPage />;
  }
}

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
