import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const complianceItems = [
  { label: "LHDN e-Invoice", status: "Certified" },
  { label: "KWSP (EPF)", status: "Integrated" },
  { label: "SOCSO", status: "Automated" },
  { label: "SST/GST", status: "Compliant" },
  { label: "Companies Act 2016", status: "Aligned" },
];

export const ComplianceSection = () => {
  return (
    <section id="compliance" className="py-16 md:py-24 bg-background">
      <div className="container max-w-4xl">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">Compliance</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ✅ 100% Malaysian Compliance
          </h2>
          <p className="text-lg text-muted-foreground">
            ERPOne ensures every process aligns with national standards and regulatory frameworks.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {complianceItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
              >
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{item.label}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
