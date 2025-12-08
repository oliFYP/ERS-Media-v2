import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ROLES } from "../utils/roleHelpers";

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES.CLIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Generate unique token
      const token = crypto.randomUUID();

      // Calculate expiration (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Create invite record
      const { data, error: inviteError } = await supabase
        .from("invites")
        .insert([
          {
            email: email.toLowerCase().trim(),
            role: role,
            token: token,
            invited_by: user.id,
            expires_at: expiresAt.toISOString(),
            used: false,
          },
        ])
        .select()
        .single();

      if (inviteError) {
        if (inviteError.code === "23505") {
          throw new Error("An active invite already exists for this email.");
        }
        throw inviteError;
      }

      // Create the invite link
      const inviteLink = `${window.location.origin}/create-account?token=${token}`;

      // For now, just show the link (we'll add email sending later)
      console.log("Invite Link:", inviteLink);

      // Show success and pass invite link
      onSuccess(inviteLink, email, role);

      // Reset form
      setEmail("");
      setRole(ROLES.CLIENT);
      onClose();
    } catch (err) {
      console.error("Error creating invite:", err);
      setError(err.message || "Failed to create invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Invite User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border bg-input glass-orange rounded-lg  "
              required
              disabled={loading}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-white mb-1"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border glass-orange bg-input rounded-lg glass-orange"
              required
              disabled={loading}
            >
              <option value={ROLES.CLIENT}>Client</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
            </select>
            <p className="text-xs text-white mt-1">
              {role === ROLES.SUPER_ADMIN &&
                "Full system access - can manage all users and settings"}
              {role === ROLES.ADMIN &&
                "Can manage assigned clients, tasks, and calendars"}
              {role === ROLES.CLIENT &&
                "Can view tasks, calendar, and submit feedback"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
