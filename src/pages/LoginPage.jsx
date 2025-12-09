import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROLES } from "../utils/roleHelpers";
import CompanyLogo from "../assets/company-logo.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      console.log("Checking existing Supabase session...");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Existing session:", session);

      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        console.log("Profile on initial load:", { profile, profileError });

        if (profile) {
          redirectToDashboard(profile.role);
        }
      }
    };
    checkUser();
  }, []);

  const redirectToDashboard = (role) => {
    console.log("Redirecting to dashboard for role:", role);

    switch (role) {
      case ROLES.SUPER_ADMIN:
        navigate("/super-admin/dashboard", { replace: true });
        break;
      case ROLES.ADMIN:
        navigate("/admin/dashboard", { replace: true });
        break;
      case ROLES.CLIENT:
        navigate("/client/dashboard", { replace: true });
        break;
      default:
        navigate("/unauthorized", { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Log raw Supabase response
      console.log("Supabase login response:", { data, error });

      if (error) {
        console.error("Login failed:", error.message);

        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email before logging in.");
        } else {
          setError(error.message);
        }

        setLoading(false);
        return;
      }

      if (data.session) {
        console.log("Login successful! Session:", data.session);
        console.log("Logged in user:", data.user);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        console.log("Profile fetch result:", { profile, profileError });

        if (profile) {
          redirectToDashboard(profile.role);
        }
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Logo */}
      <header className="p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <img
            src={CompanyLogo}
            alt="Company Logo"
            className="h-auto object-contain"
            style={{ width: "200px" }}
          />
        </div>
      </header>

      {/* Login Form */}
      <main className="flex items-center justify-center px-4 pb-12 pt-8">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 shadow-xl"
            style={{
              background: "hsl(0 0% 12% / 0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid hsl(0 0% 20%)",
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-400 mt-2">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full h-12 px-4 py-2 bg-input rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 text-left">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full h-12 px-4 py-2 pr-12 bg-input rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    required
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-orange-500 hover:text-orange-400"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Forgot password functionality coming soon!");
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-sm">
        © 2024 Agency Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
