import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('ProtectedRoute - Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          email: session?.user?.email 
        });
        
        if (session?.user) {
          // Check profile and auto-activate if needed
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email_verified, status")
            .eq("id", session.user.id)
            .single();

          console.log('ProtectedRoute - Profile check:', { 
            profile, 
            profileError: profileError?.message 
          });

          // Auto-activate users who are pending verification (for development)
          if (profile && profile.status === "pending_verification") {
            console.log('Auto-activating user...');
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ status: "active", email_verified: true })
              .eq("id", session.user.id);
            
            if (updateError) {
              console.error('Failed to auto-activate user:', updateError);
            } else {
              console.log('User auto-activated successfully');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
          }

          // Check if account is active
          if (profile?.status === "active") {
            setIsAuthenticated(true);
          } else {
            console.log('User not active, status:', profile?.status);
            setIsAuthenticated(false);
          }
        } else {
          console.log('No session found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
