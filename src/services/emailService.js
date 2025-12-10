import { supabase } from "../lib/supabase";

export const sendInviteEmail = async (email, role, inviteLink) => {
  try {
    // Get current user's session to pass auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No active session");
    }

    // Get inviter's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    // Call the edge function — include the user's access token so the function
    // can verify the caller's identity and role.
    const accessToken = session.access_token;

    const { data, error } = await supabase.functions.invoke(
      "send-invite-email",
      {
        body: {
          email,
          role,
          inviteLink,
          invitedByName: profile?.full_name,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (error) {
      console.error("Edge function returned an error object:", error);
      throw error;
    }

    // The function returns a JSON payload { success: boolean, ... }
    if (!data || data.success === false) {
      console.error("Edge function response body:", data);
      throw new Error((data && data.error) || "Failed to send email");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invite email:", error);
    throw error;
  }
};
