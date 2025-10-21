import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
      <div className="container py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Empowering Malaysian Businesses,{" "}
              <span className="text-primary">From Kampung to City</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              ERPOne is a comprehensive Enterprise Resource Planning system built for Malaysian SMEs — 
              bridging the gap between rural and urban enterprises, helping every business thrive in the 
              modern digital economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Explore Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative lg:order-last animate-fade-in">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-border shadow-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-sm text-muted-foreground">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
