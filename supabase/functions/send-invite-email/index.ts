import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Read the Resend API key from an environment variable named `RESEND_API_KEY`.
// Do NOT hardcode secret values in source. Set `RESEND_API_KEY` in the
// Supabase Edge Functions environment or your deployment environment.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY environment variable");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  role: string;
  inviteLink: string;
  invitedByName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated and is super_admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is super_admin
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "super_admin") {
      throw new Error("Only super admins can send invites");
    }

    // Get request body
    const { email, role, inviteLink, invitedByName }: InviteEmailRequest =
      await req.json();

    if (!email || !role || !inviteLink) {
      throw new Error("Missing required fields");
    }

    // Prepare email content
    const roleName = role
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const inviterName =
      invitedByName || profile?.full_name || "Your Administrator";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">You're Invited! 🎉</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 24px;">
                Hello!
              </p>
              
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 24px;">
                <strong>${inviterName}</strong> has invited you to join the Agency Portal as a <strong style="color: #f97316;">${roleName}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #1f2937; font-size: 16px; line-height: 24px;">
                Click the button below to create your account and get started:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto; text-align: center;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                    <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Create Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; word-break: break-all;">
                <a href="${inviteLink}" style="color: #f97316; text-decoration: none; font-size: 13px;">
                  ${inviteLink}
                </a>
              </div>
              
              <div style="margin-top: 30px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  <strong>⏰ Important:</strong> This invitation link will expire in 7 days.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Agency Portal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Validate API key presence on the server before calling Resend
    if (!RESEND_API_KEY) {
      throw new Error("Server misconfiguration: missing RESEND_API_KEY");
    }

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agency Portal <onboarding@resend.dev>", // Change this to your verified domain
        to: [email],
        subject: `You're invited to join Agency Portal as ${roleName}`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(
        `Resend error (${res.status}): ${data.message || JSON.stringify(data)}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailId: data.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-invite-email function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
