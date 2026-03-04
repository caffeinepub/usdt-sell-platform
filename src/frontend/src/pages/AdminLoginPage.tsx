import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { storeSessionParameter } from "../utils/urlParams";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backendToken, setBackendToken] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
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
      // If a backend token was provided, store it so the actor picks it up
      if (backendToken.trim()) {
        storeSessionParameter("caffeineAdminToken", backendToken.trim());
      }
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

            {/* Advanced Settings Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                data-ocid="admin_login.toggle"
                aria-expanded={showAdvanced}
              >
                <motion.span
                  animate={{ rotate: showAdvanced ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
                Advanced settings
              </button>

              <AnimatePresence initial={false}>
                {showAdvanced && (
                  <motion.div
                    key="advanced"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label
                          htmlFor="backend-token"
                          className="text-sm font-medium"
                        >
                          Backend Admin Token
                        </Label>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                          optional
                        </span>
                        <button
                          type="button"
                          title="Required to view orders and manage data. Get this from your Caffeine platform settings."
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          aria-label="Backend token info"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="backend-token"
                          type="password"
                          autoComplete="off"
                          value={backendToken}
                          onChange={(e) => setBackendToken(e.target.value)}
                          placeholder="Paste token here"
                          className="pl-10 bg-muted/50 font-mono text-xs"
                          disabled={isSubmitting}
                          data-ocid="admin_login.backend_token_input"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Required to view orders and manage data. Get this from
                        your Caffeine platform settings.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
