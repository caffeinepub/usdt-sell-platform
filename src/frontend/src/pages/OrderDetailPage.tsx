import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Landmark,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { Currency, OrderStatus } from "../backend.d";
import { AuthGuard } from "../components/shared/AuthGuard";
import { StatusBadge } from "../components/shared/StatusBadge";
import { useOrderById } from "../hooks/useQueries";
import { formatCurrency, formatDate, shortOrderId } from "../utils/format";

const STATUS_TIMELINE: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.processing,
  OrderStatus.completed,
];

function TimelineStep({
  status,
  currentStatus,
  label,
  description,
}: {
  status: OrderStatus;
  currentStatus: OrderStatus;
  label: string;
  description: string;
}) {
  const isCancelled = currentStatus === OrderStatus.cancelled;
  const statusIndex = STATUS_TIMELINE.indexOf(status);
  const currentIndex = isCancelled
    ? -1
    : STATUS_TIMELINE.indexOf(currentStatus);

  const isCompleted = !isCancelled && currentIndex > statusIndex;
  const isActive = !isCancelled && currentIndex === statusIndex;
  const isPast = isCompleted || isActive;

  const Icon = isCompleted ? CheckCircle2 : isActive ? Loader2 : Clock;

  return (
    <div className={`flex gap-3 ${isCancelled ? "opacity-40" : ""}`}>
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? "bg-chart-4 text-white"
              : isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${isActive && status !== OrderStatus.completed ? "animate-spin" : ""}`}
          />
        </div>
        {statusIndex < STATUS_TIMELINE.length - 1 && (
          <div
            className={`w-0.5 flex-1 my-1 ${isPast && !isActive ? "bg-chart-4" : "bg-border"}`}
          />
        )}
      </div>
      <div className="pb-4">
        <p
          className={`text-sm font-semibold ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const params = useParams({ from: "/orders/$id" });
  const orderId = params.id ? BigInt(params.id) : null;
  const { data: order, isLoading } = useOrderById(orderId);

  return (
    <AuthGuard>
      <main className="min-h-screen mesh-bg py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground mb-4 -ml-2"
              >
                <Link to="/orders">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Link>
              </Button>
              <h1 className="font-display text-4xl font-bold mb-1">
                Order Details
              </h1>
              {order && (
                <p className="text-muted-foreground mono-num">
                  {shortOrderId(order.id)}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            ) : !order ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">
                  Order Not Found
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  This order doesn't exist or you don't have permission to view
                  it.
                </p>
                <Button asChild>
                  <Link to="/orders">View All Orders</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Card */}
                <Card
                  className="shadow-card bg-card border-border"
                  data-ocid="order_detail.status_panel"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Order Status
                      </CardTitle>
                      <StatusBadge status={order.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {order.status === OrderStatus.cancelled ? (
                      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-destructive">
                            Order Cancelled
                          </p>
                          {order.adminNote && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {order.adminNote}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <TimelineStep
                          status={OrderStatus.pending}
                          currentStatus={order.status}
                          label="Order Pending"
                          description="Your sell order has been placed"
                        />
                        <TimelineStep
                          status={OrderStatus.processing}
                          currentStatus={order.status}
                          label="Processing"
                          description="Verifying USDT and preparing transfer"
                        />
                        <TimelineStep
                          status={OrderStatus.completed}
                          currentStatus={order.status}
                          label="Completed"
                          description="Funds dispatched to your bank account"
                        />
                      </div>
                    )}

                    {order.adminNote &&
                      order.status !== OrderStatus.cancelled && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground font-medium mb-1">
                            Admin Note
                          </p>
                          <p className="text-sm">{order.adminNote}</p>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="shadow-card bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Transaction Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Order ID
                      </span>
                      <span className="mono-num text-sm font-bold text-primary">
                        {shortOrderId(order.id)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        USDT Amount
                      </span>
                      <span className="mono-num font-semibold">
                        {order.usdtAmount.toFixed(6)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Exchange Rate
                      </span>
                      <span className="mono-num font-medium">
                        1 USDT ={" "}
                        {order.exchangeRateUsed.toFixed(
                          order.payoutCurrency === Currency.usd ? 4 : 2,
                        )}{" "}
                        {order.payoutCurrency === Currency.usd ? "USD" : "INR"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Payout Currency
                      </span>
                      <span className="text-sm font-semibold px-2 py-0.5 rounded bg-muted">
                        {order.payoutCurrency === Currency.usd ? "USD" : "INR"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Payout Amount
                      </span>
                      <span className="mono-num text-xl font-bold text-primary">
                        {formatCurrency(
                          order.payoutAmount,
                          order.payoutCurrency,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Created
                      </span>
                      <span className="text-sm">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="text-sm">
                        {formatDate(order.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Account Details */}
                <Card
                  className="shadow-card bg-card border-border"
                  data-ocid="order_detail.bank_panel"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-primary" />
                      Bank Account Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Account Holder
                      </span>
                      <span className="font-medium text-sm">
                        {order.bankAccountSnapshot.holderName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Bank Name
                      </span>
                      <span className="font-medium text-sm">
                        {order.bankAccountSnapshot.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Account Number
                      </span>
                      <span className="mono-num font-medium text-sm">
                        ••••{order.bankAccountSnapshot.accountNumber.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        {order.payoutCurrency === Currency.usd
                          ? "Routing Number"
                          : "IFSC Code"}
                      </span>
                      <span className="mono-num font-medium text-sm">
                        {order.bankAccountSnapshot.routingOrIFSC}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </AuthGuard>
  );
}
