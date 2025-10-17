import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        // Find profile with matching token
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, verification_token, verification_token_expires_at, email_verified")
          .eq("verification_token", token)
          .maybeSingle();

        if (profileError) {
          console.error("Profile query error:", profileError);
          throw new Error("Failed to verify token");
        }

        if (!profile) {
          setStatus("error");
          setMessage("Invalid or expired verification link.");
          return;
        }

        // Check if already verified
        if (profile.email_verified) {
          setStatus("success");
          setMessage("Your email is already verified! Redirecting to sign in...");
          toast.success("Email already verified!");
          setTimeout(() => navigate("/signin"), 2000);
          return;
        }

        // Check token expiry
        const expiresAt = new Date(profile.verification_token_expires_at);
        const now = new Date();

        if (now > expiresAt) {
          setStatus("error");
          setMessage("Verification link has expired. Please request a new one.");
          return;
        }

        // Update profile to mark email as verified
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            email_verified: true,
            verification_token: null,
            verification_token_expires_at: null,
            status: "active",
            verified_at: new Date().toISOString()
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Update error:", updateError);
          throw new Error("Failed to verify email");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");
        toast.success("Email verified successfully!");
        
        // Redirect to sign in after 4 seconds
        setTimeout(() => {
          navigate("/signin");
        }, 4000);
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(error.message || "An error occurred during verification.");
        toast.error("Verification failed");
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ERPOne</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" && (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              )}
              {status === "success" && (
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
              )}
              {status === "error" && (
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                  <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === "loading" && "Verifying Your Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ Your account has been activated. You can now log in to your ERPOne account.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to="/signin">Go to Sign In</Link>
                </Button>
              </div>
            )}
            {status === "error" && (
              <div className="space-y-4">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/verify-instructions">Request New Verification Email</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/register">Register Again</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
