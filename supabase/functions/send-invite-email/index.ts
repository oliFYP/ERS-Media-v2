import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Read the Resend API key from an environment variable named `RESEND_API_KEY`.
// Do NOT hardcode secret values in source. Set `RESEND_API_KEY` in the
// Supabase Edge Functions environment or your deployment environment.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY environment variable");
}

// Optional: public URL for the company logo to show at top of the email.
// Set `COMPANY_LOGO_URL` in the Edge Function environment (or leave the
// fallback placeholder). This does not change functionality if not set.
const COMPANY_LOGO_URL =
  Deno.env.get("COMPANY_LOGO_URL") ??
  "https://your-domain.com/company-logo.png";
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

    // If the invited role is the client, keep the orange highlight; otherwise use white
    const roleColor = role === "client" ? "#f97316" : "#ffffff";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #d68a2d 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #d68a2d 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: hsl(0 0% 12% / 0.8); backdrop-filter: blur(12px); border: 1px solid hsl(var(--border)); border-radius: 12px;">
          <!-- Logo + Header -->
          <tr>
            <td style="padding: 28px 24px 0; text-align: center;">
              <img src="${COMPANY_LOGO_URL}" alt="Company Logo" style="max-width: 160px; height: auto; display: block; margin: 0 auto 16px;"/>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">You're Invited! 🎉</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 36px 24px;">
              <p style="margin: 0 0 18px; color: #ffffff; font-size: 16px; line-height: 24px;">
                Hello!
              </p>

              <p style="margin: 0 0 18px; color: #ffffff; font-size: 16px; line-height: 24px;">
                <strong>${inviterName}</strong> has invited you to join the Agency Portal as a <strong style="color: ${roleColor};">${roleName}</strong>.
              </p>

              <p style="margin: 0 0 22px; color: #ffffff; font-size: 16px; line-height: 24px;">
                Click the button below to create your account and get started:
              </p>

              <!-- CTA Button (uses the orange button style requested) -->
              <div style="text-align: center; margin: 0 0 22px;">
                <a href="${inviteLink}" style="display: inline-block; background-color: hsl(32 70% 50%); color: #ffffff; padding: 0.5rem 1rem; border-radius: 0.75rem; border: 1px solid hsl(32 70% 50%); font-weight: 500; text-decoration: none;">Create Account</a>
              </div>

              <p style="margin: 0 0 18px; color: #f3f4f6; font-size: 14px; line-height: 20px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 12px; word-break: break-all; margin-top: 8px;">
                <a href="${inviteLink}" style="color: #f97316; text-decoration: none; font-size: 13px;">${inviteLink}</a>
              </div>

              <div style="margin-top: 22px; padding: 14px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  <strong>⏰ Important:</strong> This invitation link will expire in 7 days.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 28px; background: transparent; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: rgba(255,255,255,0.72); font-size: 14px; line-height: 20px; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.48); font-size: 12px; text-align: center;">
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
