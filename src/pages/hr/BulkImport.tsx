import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";

const BulkImport = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-muted-foreground">
          Upload employee data in bulk using standardized Excel or CSV templates
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Download Template</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get the standardized Excel template
                </p>
              </div>
              <Button variant="outline" className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-secondary/10">
                <Upload className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Upload File</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your completed template
                </p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-accent/10">
                <AlertCircle className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Validation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and validate imported data
                </p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Validate Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Recent bulk import activities will appear here...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImport;
