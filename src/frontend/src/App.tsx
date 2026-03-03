import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AdminLayout } from "./components/shared/AdminLayout";
import { Footer } from "./components/shared/Footer";
import { Navbar } from "./components/shared/Navbar";
import { RateTicker } from "./components/shared/RateTicker";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { BankAccountsPage } from "./pages/BankAccountsPage";
import { HomePage } from "./pages/HomePage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { SellPage } from "./pages/SellPage";

// ─── Public Layout ──────────────────────────────────────────────
function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <RateTicker />
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border-border text-foreground font-body shadow-card",
            title: "font-semibold",
            description: "text-muted-foreground text-sm",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-muted text-muted-foreground",
          },
        }}
      />
    </div>
  );
}

// ─── Route Tree ─────────────────────────────────────────────────
// Single root — two layout branches: public and admin
const rootRoute = createRootRoute();

// Public layout route (handles all public pages)
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});

const sellRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/sell",
  component: SellPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/orders",
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/orders/$id",
  component: OrderDetailPage,
});

const bankAccountsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/bank-accounts",
  component: BankAccountsPage,
});

// Admin layout route (completely isolated)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/login",
  component: AdminLoginPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    indexRoute,
    sellRoute,
    ordersRoute,
    orderDetailRoute,
    bankAccountsRoute,
  ]),
  adminLayoutRoute.addChildren([adminIndexRoute, adminLoginRoute]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
