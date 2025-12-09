import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.log("Logout successful ✅");
      } else {
        console.warn("Logout might have failed ❌", session);
      }

      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="glass-card rounded-xl shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white mt-1">
                Welcome back, {profile?.full_name || profile?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">My Clients</p>
                <p className="text-3xl font-bold text-white mt-1">8</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Active Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">24</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Pending Approvals</p>
                <p className="text-3xl font-bold text-white mt-1">3</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-lg glass-orange transition-colors">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="font-medium text-white">Create Task</span>
            </button>

            <button className="flex items-center gap-3 p-4  rounded-lg  glass-orange transition-colors">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium text-white">View Calendar</span>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg  glass-orange transition-colors">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium text-white">Manage Clients</span>
            </button>
          </div>
        </div>

        {/* My Clients & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Clients */}
          <div className="glass-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">My Clients</h2>
              <button className="text-sm text-orange">View All</button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((client) => (
                <div
                  key={client}
                  className="flex items-center justify-between p-3 rounded-lg  glass-orange"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">JD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">John Doe</p>
                      <p className="text-xs text-white">john.doe@example.com</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="glass-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
              <button className="text-sm text-orange">View All</button>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Update website content",
                  status: "In Progress",
                  color: "blue",
                },
                {
                  title: "Review social media strategy",
                  status: "Pending",
                  color: "yellow",
                },
                {
                  title: "Prepare monthly report",
                  status: "Completed",
                  color: "green",
                },
              ].map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3  glass-orange rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {task.title}
                    </p>
                    <p className="text-xs text-white mt-1">Due in 2 days</p>
                  </div>
                  <span
                    className={`px-2 py-1 bg-${task.color}-100 text-${task.color}-700 text-xs rounded-full`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
