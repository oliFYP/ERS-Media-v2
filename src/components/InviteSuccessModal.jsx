import { useState } from "react";

const InviteSuccessModal = ({ isOpen, onClose, inviteLink, email, role }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Invitation Sent! ✅
          </h2>
          <p className="text-white">
            An email invitation has been sent to{" "}
            <span className="font-semibold">{email}</span> as a{" "}
            <span className="font-semibold capitalize">
              {role.replace("_", " ")}
            </span>
          </p>
        </div>

        <div className="glass-card-dark border border-green-500/30 rounded-lg p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <svg
              className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-white">
              <p className="font-medium mb-1">Email sent successfully!</p>
              <p className="text-gray-300">
                The user will receive an email with instructions to create their
                account.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-dark border border-gray-200 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Invite Link (backup - expires in 7 days)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-3 py-2 bg-input glass-orange rounded-lg text-sm font-mono text-white"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg btn-orange flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              {copied ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            You can also manually share this link if needed
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg btn-orange hover:bg-orange-600 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default InviteSuccessModal;
