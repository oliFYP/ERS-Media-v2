import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>

        {profile && !profile.is_active ? (
          <p className="text-gray-600 mb-6">
            Your account is currently inactive. Please contact your
            administrator for assistance.
          </p>
        ) : (
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. If you believe this
            is an error, please contact your administrator.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
