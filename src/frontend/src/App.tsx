import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/shared/Footer";
import { Navbar } from "./components/shared/Navbar";
import { RateTicker } from "./components/shared/RateTicker";
import { AdminPage } from "./pages/AdminPage";
import { BankAccountsPage } from "./pages/BankAccountsPage";
import { HomePage } from "./pages/HomePage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { SellPage } from "./pages/SellPage";

// Root layout
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

// Routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell",
  component: SellPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$id",
  component: OrderDetailPage,
});

const bankAccountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bank-accounts",
  component: BankAccountsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  sellRoute,
  ordersRoute,
  orderDetailRoute,
  bankAccountsRoute,
  adminRoute,
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
