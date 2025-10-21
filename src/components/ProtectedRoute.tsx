import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!session?.user) {
        setIsCheckingProfile(false);
        setIsActive(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", session.user.id)
          .single();

        console.log('ProtectedRoute - Profile status:', profile?.status);

        if (profile?.status === "active") {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } catch (error) {
        console.error("Profile check error:", error);
        setIsActive(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [session, authLoading]);

  if (authLoading || isCheckingProfile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !isActive) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
