import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";

// Pages
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import CreateAccountPage from "./pages/CreateAccountPage";

// Dashboard pages
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

// Role constants
import { ROLES } from "./utils/roleHelpers";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes - Super Admin */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Client */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CLIENT]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root redirect based on authentication */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Component to handle root redirect based on user role
function RootRedirect() {
  const { loading, initialized, isAuthenticated, profile } = useAuth();

  // Wait for auth to initialize
  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (profile?.role) {
    case ROLES.SUPER_ADMIN:
      return <Navigate to="/super-admin/dashboard" replace />;
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.CLIENT:
      return <Navigate to="/client/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

export default App;
