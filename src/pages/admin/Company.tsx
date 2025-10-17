import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Globe, Mail } from "lucide-react";

const Company = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground">Manage company profile and configurations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <p className="text-muted-foreground mt-1">Tech Solutions Sdn Bhd</p>
            </div>
            <div>
              <label className="text-sm font-medium">Registration No.</label>
              <p className="text-muted-foreground mt-1">202301234567 (1234567-A)</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <p className="text-muted-foreground mt-1">
                Level 10, Menara ABC, Jalan Sultan Ismail, 50250 Kuala Lumpur
              </p>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-muted-foreground mt-1">info@techsolutions.com.my</p>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </label>
              <p className="text-muted-foreground mt-1">www.techsolutions.com.my</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statutory Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">KWSP Employer No.</label>
              <p className="text-muted-foreground mt-1">KL 1234567-89</p>
            </div>
            <div>
              <label className="text-sm font-medium">SOCSO Employer No.</label>
              <p className="text-muted-foreground mt-1">M 12-3456789</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tax Identification No.</label>
              <p className="text-muted-foreground mt-1">C 1234567890</p>
            </div>
            <div>
              <label className="text-sm font-medium">SST Registration No.</label>
              <p className="text-muted-foreground mt-1">A01-2345-67890123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Company;
