import { TrendingUp } from "lucide-react";
import { useExchangeRates } from "../../hooks/useQueries";

const TICKER_LABELS = [
  "usd-1",
  "inr-1",
  "usd-eq-1",
  "inr-eq-1",
  "usd-2",
  "inr-2",
  "usd-eq-2",
  "inr-eq-2",
] as const;

type TickerKey = (typeof TICKER_LABELS)[number];

export function RateTicker() {
  const { data: rates } = useExchangeRates();

  const usdRate = rates?.usdRate ?? 1.0;
  const inrRate = rates?.inrRate ?? 85.0;

  const items: Record<TickerKey, { label: string; value: string }> = {
    "usd-1": { label: "USDT/USD", value: `$${usdRate.toFixed(4)}` },
    "inr-1": { label: "USDT/INR", value: `₹${inrRate.toFixed(2)}` },
    "usd-eq-1": { label: "1 USDT =", value: `${usdRate.toFixed(4)} USD` },
    "inr-eq-1": { label: "1 USDT =", value: `${inrRate.toFixed(2)} INR` },
    "usd-2": { label: "USDT/USD", value: `$${usdRate.toFixed(4)}` },
    "inr-2": { label: "USDT/INR", value: `₹${inrRate.toFixed(2)}` },
    "usd-eq-2": { label: "1 USDT =", value: `${usdRate.toFixed(4)} USD` },
    "inr-eq-2": { label: "1 USDT =", value: `${inrRate.toFixed(2)} INR` },
  };

  return (
    <div className="w-full overflow-hidden bg-[oklch(var(--ticker-bg))] border-b border-border py-1.5">
      <div className="ticker-track">
        {TICKER_LABELS.map((key) => (
          <div
            key={key}
            className="flex items-center gap-1.5 px-6 text-xs font-medium whitespace-nowrap"
          >
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">{items[key].label}</span>
            <span className="mono-num text-primary font-semibold">
              {items[key].value}
            </span>
            <span className="text-border ml-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
