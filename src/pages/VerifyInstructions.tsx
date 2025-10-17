import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VerifyInstructions = () => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_verified, status")
          .eq("id", user.id)
          .single();

        if (profile?.email_verified) {
          toast.success("Email already verified!");
          navigate("/signin");
          return;
        }
      }
      setIsChecking(false);
    };

    checkVerification();
  }, [navigate]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Session expired", {
          description: "Please register again."
        });
        navigate("/register");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.functions.invoke("send-verification-email", {
        body: {
          userId: user.id,
          email: user.email,
          fullName: profile?.full_name || "User"
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Verification email resent!", {
        description: "Please check your inbox."
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error("Failed to resend email", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ERPOne</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Next Steps:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 mt-2 ml-4 list-decimal">
                    <li>Check your inbox for the verification email</li>
                    <li>Click the verification link in the email</li>
                    <li>You'll be redirected to sign in</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⏰ The link expires in 24 hours</strong>
              </p>
            </div>

            <Button 
              onClick={handleResendEmail} 
              variant="outline" 
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already verified?{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyInstructions;
