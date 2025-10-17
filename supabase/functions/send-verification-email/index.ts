import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

// Resend email service
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  userId: string;
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName }: VerificationEmailRequest = await req.json();
    
    console.log("Sending verification email to:", email);

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Store token in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_token: verificationToken,
        verification_token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Failed to store verification token");
    }

    // Get app URL from environment or construct it
    const appUrl = Deno.env.get("APP_URL") || supabaseUrl.replace('.supabase.co', '.lovable.app');
    const verificationLink = `${appUrl}/verify?token=${verificationToken}`;

    // Send verification email using fetch API to Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ERPOne <onboarding@resend.dev>",
        to: [email],
        subject: "Verify Your ERPOne Account",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .content { padding: 40px 20px; }
                .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
                .button:hover { background-color: #1d4ed8; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #f0f0f0; }
                .warning { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #92400e; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🏢 ERPOne</div>
                </div>
                <div class="content">
                  <h2>Welcome to ERPOne!</h2>
                  <p>Hello ${fullName},</p>
                  <p>Thank you for registering your company with ERPOne. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                  <div style="text-align: center;">
                    <a href="${verificationLink}" class="button">Verify My Account</a>
                  </div>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${verificationLink}</p>
                  <div class="warning">
                    <strong>⏰ This verification link will expire in 24 hours.</strong>
                  </div>
                  <p>If you didn't register for an ERPOne account, you can safely ignore this email.</p>
                  <p>Best regards,<br>The ERPOne Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} ERPOne. Your Complete Malaysian ERP System.</p>
                  <p>This is an automated message, please do not reply to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData.message || "Unknown error"}`);
    }

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent successfully",
        emailId: emailData.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send verification email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
