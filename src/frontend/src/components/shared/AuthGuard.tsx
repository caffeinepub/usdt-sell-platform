import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  isAdmin?: boolean;
}

export function AuthGuard({
  children,
  requireAdmin = false,
  isAdmin,
}: AuthGuardProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <Lock className="w-9 h-9 text-primary" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-8">
            Please sign in to access this page. Your identity is secured by
            Internet Identity.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="gap-2 glow-teal w-full sm:w-auto"
            data-ocid="nav.login_button"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? "Connecting..." : "Sign In"}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <Lock className="w-9 h-9 text-destructive" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Admin access
            required.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
