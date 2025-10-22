import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z.object({
  // Company Information
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters").max(100, "Company name must be less than 100 characters"),
  registrationNo: z.string().trim().min(5, "Registration number is required").max(50, "Registration number is too long"),
  companyEmail: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20, "Phone number is too long"),
  businessType: z.string().min(1, "Please select a business type"),
  address: z.string().trim().min(10, "Address must be at least 10 characters").max(500, "Address is too long"),
  
  // Admin Account
  adminName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Name is too long"),
  adminEmail: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      registrationNo: "",
      companyEmail: "",
      phone: "",
      businessType: "",
      address: "",
      adminName: "",
      adminEmail: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Call the register-company edge function
      const { data: result, error } = await supabase.functions.invoke('register-company', {
        body: {
          companyName: data.companyName,
          registrationNo: data.registrationNo,
          companyEmail: data.companyEmail,
          phone: data.phone,
          businessType: data.businessType,
          address: data.address,
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          password: data.password,
        },
      });

      // Handle errors - when edge function returns non-2xx, result contains error details
      if (error || (result && !result?.success)) {
        console.error("Registration error:", error, result);
        
        // Extract error details from result (edge function response)
        const errorMsg = result?.error || error?.message || "Registration failed";
        const detailedMsg = result?.message || result?.details || errorMsg;
        const errorAction = result?.action;
        
        // Handle specific error cases with clear user guidance
        if (errorMsg.toLowerCase().includes("email already exists") || errorAction === "signin") {
          toast.error("Account Already Exists", {
            description: detailedMsg,
            action: {
              label: "Sign In",
              onClick: () => navigate("/signin")
            },
            duration: 6000
          });
        } else if (errorMsg.toLowerCase().includes("registration number") && 
                   errorMsg.toLowerCase().includes("already")) {
          toast.error("Registration Number Already Used", {
            description: detailedMsg || "This registration number is already registered. Please use a different registration number or contact your administrator.",
            duration: 8000
          });
        } else if (errorAction === "contact_admin") {
          toast.error("Company Already Registered", {
            description: detailedMsg,
            duration: 8000
          });
        } else {
          toast.error("Registration Failed", {
            description: detailedMsg,
            duration: 6000
          });
        }
        return;
      }

      toast.success("Registration successful!", {
        description: "You can now sign in to your account."
      });
      
      // Redirect to sign in page
      navigate("/signin");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration Failed", {
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardHeader>
            <CardTitle className="text-2xl">Register Your Company</CardTitle>
            <CardDescription>
              Create your ERPOne account to start managing your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Sdn Bhd" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Registration No. (SSM) *</FormLabel>
                        <FormControl>
                          <Input placeholder="201901234567" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@company.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+60123456789" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            disabled={isLoading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select business type</option>
                            <option value="Sole Proprietor">Sole Proprietor</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Private Limited (Sdn Bhd)">Private Limited (Sdn Bhd)</option>
                            <option value="Cooperative">Cooperative</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Address *</FormLabel>
                        <FormControl>
                          <textarea 
                            {...field} 
                            disabled={isLoading}
                            placeholder="Enter your registered business address"
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Admin Account Section */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold">Admin Account Setup</h3>
                  
                  <FormField
                    control={form.control}
                    name="adminName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password (min 8 characters)" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Company"
                  )}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
