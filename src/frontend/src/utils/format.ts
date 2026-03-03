import { Currency, OrderStatus } from "../backend.d";

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === Currency.usd) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSDT(amount: number): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} USDT`;
}

export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function formatDateShort(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending:
      return "Pending";
    case OrderStatus.processing:
      return "Processing";
    case OrderStatus.completed:
      return "Completed";
    case OrderStatus.cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function statusClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending:
      return "status-pending";
    case OrderStatus.processing:
      return "status-processing";
    case OrderStatus.completed:
      return "status-completed";
    case OrderStatus.cancelled:
      return "status-cancelled";
    default:
      return "";
  }
}

export function currencyLabel(currency: Currency): string {
  return currency === Currency.usd ? "USD" : "INR";
}

export function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
}

export function shortOrderId(id: bigint): string {
  return `#${id.toString().padStart(6, "0")}`;
}
