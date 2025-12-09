import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ROLES } from "../utils/roleHelpers";

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES.CLIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setRole(ROLES.CLIENT);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email) throw new Error("Please enter a valid email.");

      const token = crypto.randomUUID();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Get currently logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to send invites.");
      }

      // DEBUG: check email before sending
      console.log("Sending invite to:", email, "with token:", token);

      // Insert invite into DB
      const { data, error: inviteError } = await supabase
        .from("invites")
        .insert([
          {
            email: email.toLowerCase().trim(),
            role,
            token,
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
        throw new Error(inviteError.message || "Failed to create invite.");
      }

      // Generate link for the user
      const inviteLink = `${window.location.origin}/create-account?token=${token}`;

      // Notify parent of success
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(inviteLink, email, role);
      }

      onClose(); // Close modal
    } catch (err) {
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
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
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
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border bg-input glass-orange rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full px-3 py-2 border glass-orange bg-input rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              disabled={loading}
            >
              <option value={ROLES.CLIENT}>Client</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-700/50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Creating..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
