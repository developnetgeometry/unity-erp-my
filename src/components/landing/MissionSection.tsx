import { Target } from "lucide-react";

export const MissionSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-4xl">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
            <span className="text-sm font-semibold">Core Mission</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            🎯 Core Mission
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              Born from insights at nadi.my, ERPOne is designed to bridge the digital divide 
              between rural kampung enterprises and urban businesses.
            </p>
            <p>
              Our mission is to provide enterprise-grade tools accessible to Malaysian businesses 
              of all sizes, ensuring that digital transformation benefits every entrepreneur — 
              from local traders to corporate leaders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
