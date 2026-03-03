import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  ClipboardList,
  Home,
  Landmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";
import { truncatePrincipal } from "../../utils/format";

const navLinks = [
  { label: "Home", href: "/", icon: Home, ocid: "nav.home_link" },
  {
    label: "Sell USDT",
    href: "/sell",
    icon: ArrowRightLeft,
    ocid: "nav.sell_link",
  },
  {
    label: "My Orders",
    href: "/orders",
    icon: ClipboardList,
    ocid: "nav.orders_link",
  },
  {
    label: "Bank Accounts",
    href: "/bank-accounts",
    icon: Landmark,
    ocid: "nav.bank_accounts_link",
  },
];

export function Navbar() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString() ?? "";

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    setMobileOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-teal">
            <span className="text-primary-foreground font-display font-black text-sm">
              ₮
            </span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            USDT<span className="text-primary">Sell</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              data-ocid={link.ocid}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              data-ocid="nav.admin_link"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/admin")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 px-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {principal.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-xs mono-num text-muted-foreground">
                    {truncatePrincipal(principal)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-xs mono-num font-medium truncate">
                    {truncatePrincipal(principal)}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  data-ocid="nav.logout_button"
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || isInitializing}
              data-ocid="nav.login_button"
              size="sm"
              className="gap-2 glow-teal"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? "Connecting..." : "Sign In"}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl py-3 px-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid={link.ocid}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
            {!isAuthenticated && (
              <Button
                onClick={() => {
                  handleLogin();
                  setMobileOpen(false);
                }}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
                className="mt-2 gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="destructive"
                onClick={handleLogout}
                data-ocid="nav.logout_button"
                className="mt-2 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
