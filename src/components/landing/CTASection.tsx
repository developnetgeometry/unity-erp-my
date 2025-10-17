import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container max-w-4xl">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
            <span className="text-sm font-semibold">Get Started</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            🚀 Start Your Digital Transformation Today
          </h2>
          <p className="text-lg text-muted-foreground">
            Register your company now and experience how ERPOne can streamline your business — 
            from HR to Finance, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Register Company
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};
