import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminRouteGuard } from "./AdminRouteGuard";

export function AdminLayout() {
  const { isLoggedIn, username, logout } = useAdminAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === "/admin/login";

  return (
    <div className="admin-layout min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="admin-header sticky top-0 z-50 w-full border-b border-admin-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg admin-shield-bg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-foreground leading-none">
                Admin Portal
              </span>
              <span className="text-[10px] text-muted-foreground font-body leading-none mt-0.5 uppercase tracking-widest">
                USDT Sell Platform
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {isLoggedIn && !isLoginPage && (
              <>
                {/* Username display */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md admin-principal-bg">
                  <User className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {username}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-5 admin-sep" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  data-ocid="admin_nav.logout_button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            )}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium admin-back-btn transition-colors"
              data-ocid="admin_nav.back_to_site_link"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Site</span>
              <span className="sm:hidden">Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isLoginPage ? (
            <Outlet />
          ) : (
            <AdminRouteGuard>
              <Outlet />
            </AdminRouteGuard>
          )}
        </motion.div>
      </main>

      {/* Admin footer */}
      <footer className="border-t border-admin-border py-4 px-4 text-center">
        <p className="text-xs text-muted-foreground/50 font-body">
          Admin Portal &mdash; Restricted Access &mdash;{" "}
          <span className="mono-num">{new Date().getFullYear()}</span>
        </p>
      </footer>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border-border text-foreground font-body shadow-card",
            title: "font-semibold",
            description: "text-muted-foreground text-sm",
          },
        }}
      />
    </div>
  );
}
