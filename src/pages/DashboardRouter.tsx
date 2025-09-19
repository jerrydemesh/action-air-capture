import { useAuth } from "@/hooks/useAuth";
import PhotographerDashboard from "./PhotographerDashboard";
import SurferDashboard from "./SurferDashboard";

const DashboardRouter = () => {
  const { loading, profile, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const role = (profile?.role || session?.user?.user_metadata?.role) as 'photographer' | 'surfer' | undefined;

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return role === 'photographer' ? <PhotographerDashboard /> : <SurferDashboard />;
};

export default DashboardRouter;
