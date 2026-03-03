import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Currency } from "../backend.d";
import { AuthGuard } from "../components/shared/AuthGuard";
import { StatusBadge } from "../components/shared/StatusBadge";
import { useCallerOrders } from "../hooks/useQueries";
import { formatCurrency, formatDateShort, shortOrderId } from "../utils/format";

export function OrdersPage() {
  const { data: orders, isLoading } = useCallerOrders();

  const sortedOrders = orders ? [...orders].reverse() : [];

  return (
    <AuthGuard>
      <main className="min-h-screen mesh-bg py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">
                  My Orders
                </h1>
                <p className="text-muted-foreground">
                  Track all your USDT sell orders
                </p>
              </div>
              <Button asChild className="gap-2 glow-teal">
                <Link to="/sell">
                  <Plus className="w-4 h-4" />
                  New Order
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3" data-ocid="orders.loading_state">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : sortedOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="orders.empty_state"
                className="glass-card rounded-2xl p-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  No orders yet
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  You haven't placed any sell orders. Start by selling your
                  USDT.
                </p>
                <Button asChild className="gap-2 glow-teal">
                  <Link to="/sell">
                    Sell USDT Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden shadow-card">
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table data-ocid="orders.list">
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs">
                          Order ID
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          USDT Amount
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Payout
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Currency
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Status
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs">
                          Date
                        </TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedOrders.map((order, idx) => (
                        <TableRow
                          key={order.id.toString()}
                          className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
                          data-ocid={`orders.item.${idx + 1}`}
                          onClick={() => {
                            window.location.hash = `/orders/${order.id.toString()}`;
                          }}
                        >
                          <TableCell className="mono-num text-sm font-medium text-primary">
                            <Link
                              to="/orders/$id"
                              params={{ id: order.id.toString() }}
                              className="hover:underline"
                            >
                              {shortOrderId(order.id)}
                            </Link>
                          </TableCell>
                          <TableCell className="mono-num font-medium">
                            {order.usdtAmount.toFixed(4)} USDT
                          </TableCell>
                          <TableCell className="mono-num font-semibold text-primary">
                            {formatCurrency(
                              order.payoutAmount,
                              order.payoutCurrency,
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                              {order.payoutCurrency === Currency.usd
                                ? "USD"
                                : "INR"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} size="sm" />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDateShort(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7"
                            >
                              <Link
                                to="/orders/$id"
                                params={{ id: order.id.toString() }}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {sortedOrders.map((order, idx) => (
                    <Link
                      key={order.id.toString()}
                      to="/orders/$id"
                      params={{ id: order.id.toString() }}
                      data-ocid={`orders.item.${idx + 1}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="mono-num text-sm font-bold text-primary">
                            {shortOrderId(order.id)}
                          </span>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                        <p className="mono-num text-sm text-muted-foreground">
                          {order.usdtAmount.toFixed(4)} USDT →{" "}
                          {formatCurrency(
                            order.payoutAmount,
                            order.payoutCurrency,
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(order.createdAt)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </AuthGuard>
  );
}
