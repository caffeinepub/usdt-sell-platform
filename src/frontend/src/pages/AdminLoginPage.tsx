import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    navigate({ to: "/admin" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    // Small delay to prevent brute-force feel
    await new Promise((r) => setTimeout(r, 400));

    const success = login(username, password);
    setIsSubmitting(false);

    if (success) {
      navigate({ to: "/admin" });
    } else {
      setError("Invalid username or password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-16 mesh-bg">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="admin-login-card rounded-2xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-2xl admin-shield-bg-strong flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full admin-lock-dot flex items-center justify-center">
                <Lock className="w-3 h-3 text-primary-foreground" />
              </div>
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Portal
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter username"
                  className="pl-10 bg-muted/50"
                  disabled={isSubmitting}
                  data-ocid="admin_login.username_input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  className="pl-10 pr-10 bg-muted/50"
                  disabled={isSubmitting}
                  data-ocid="admin_login.password_input"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-ocid="admin_login.toggle_password_button"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-denied-strip rounded-xl px-4 py-3 text-center"
                data-ocid="admin_login.error_state"
              >
                <p className="text-sm text-destructive font-medium">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 glow-teal mt-2"
              disabled={isSubmitting}
              data-ocid="admin_login.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Security note */}
          <div className="mt-8 pt-6 border-t border-admin-border">
            <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
              This area is restricted to authorized personnel only. All access
              attempts are monitored.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
