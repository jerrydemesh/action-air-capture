import { useAuth } from "@/hooks/useAuth";
import PhotographerDashboard from "./PhotographerDashboard";
import SurferDashboard from "./SurferDashboard";

const DashboardRouter = () => {
  const { loading, profile } = useAuth();

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (profile.role === 'photographer') {
    return <PhotographerDashboard />;
  }

  return <SurferDashboard />;
};

export default DashboardRouter;
