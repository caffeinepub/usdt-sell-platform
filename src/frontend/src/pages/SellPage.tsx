import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  DollarSign,
  Info,
  Landmark,
  Loader2,
  Plus,
  RefreshCcw,
  SendHorizonal,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Currency } from "../backend.d";
import { AuthGuard } from "../components/shared/AuthGuard";
import {
  useActiveWalletAddresses,
  useBankAccounts,
  useCreateSellOrder,
  useExchangeRates,
} from "../hooks/useQueries";
import { currencyLabel, formatCurrency } from "../utils/format";
import type { WalletAddress } from "../utils/walletTypes";

// ─── Send USDT Dialog ─────────────────────────────────────────────
function SendUsdtDialog({
  open,
  wallets,
  onDone,
}: {
  open: boolean;
  wallets: WalletAddress[];
  onDone: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone()}>
      <DialogContent
        className="max-w-lg"
        data-ocid="sell.send_usdt_dialog"
        // Prevent accidental close on backdrop click
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <SendHorizonal className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              Send your USDT
            </DialogTitle>
          </div>
          <DialogDescription>
            Your order has been created. Please send your USDT to one of the
            addresses below, then click "I've Sent It" to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-1">
          <AnimatePresence>
            {wallets.map((wallet, idx) => (
              <motion.div
                key={wallet.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-xl border border-border bg-muted/30 p-4 space-y-2"
                data-ocid={`sell.wallet_address.item.${idx + 1}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">
                    {wallet.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0 font-mono"
                  >
                    {wallet.network}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground break-all flex-1 leading-relaxed">
                    {wallet.address}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(wallet.address, wallet.id.toString())
                    }
                    className="flex-shrink-0 w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center"
                    title="Copy address"
                    data-ocid={`sell.copy_address_button.${idx + 1}`}
                  >
                    {copiedId === wallet.id.toString() ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Please send the exact USDT amount shown in your order. Only send via
            the correct network to avoid losing funds.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={onDone}
            className="w-full gap-2 glow-teal"
            data-ocid="sell.go_to_orders_button"
          >
            I've Sent It — Go to My Orders
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SellPage() {
  const navigate = useNavigate();
  const { data: rates, isLoading: ratesLoading } = useExchangeRates();
  const { data: bankAccounts, isLoading: accountsLoading } = useBankAccounts();
  const { data: activeWallets } = useActiveWalletAddresses();
  const createOrder = useCreateSellOrder();

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(Currency.usd);
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const numAmount = Number.parseFloat(amount) || 0;
  const exchangeRate =
    currency === Currency.usd
      ? (rates?.usdRate ?? 1.0)
      : (rates?.inrRate ?? 85.0);
  const payoutAmount = numAmount * exchangeRate;

  const filteredAccounts = useMemo(
    () => bankAccounts?.filter((a) => a.currency === currency) ?? [],
    [bankAccounts, currency],
  );

  const selectedAccount = filteredAccounts.find(
    (a) => a.id.toString() === bankAccountId,
  );

  // Reset bank account when currency changes
  const handleCurrencyChange = (val: string) => {
    setCurrency(val as Currency);
    setBankAccountId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountId || numAmount <= 0) return;

    const id = await createOrder.mutateAsync({
      usdtAmount: numAmount,
      payoutCurrency: currency,
      bankAccountId: BigInt(bankAccountId),
    });

    if (id !== undefined) {
      const hasWallets = activeWallets && activeWallets.length > 0;
      if (hasWallets) {
        setSendDialogOpen(true);
      } else {
        navigate({ to: "/orders" });
      }
    }
  };

  const handleSendDialogDone = () => {
    setSendDialogOpen(false);
    navigate({ to: "/orders" });
  };

  const isValid =
    numAmount > 0 && bankAccountId !== "" && !createOrder.isPending;

  return (
    <AuthGuard>
      <main className="min-h-screen mesh-bg py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="font-display text-4xl font-bold mb-2">
                Sell USDT
              </h1>
              <p className="text-muted-foreground">
                Enter the amount and choose where to receive your payout.
              </p>
            </div>

            {/* Rate info banner */}
            {ratesLoading ? (
              <Skeleton className="h-14 w-full mb-6 rounded-xl" />
            ) : (
              <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                <RefreshCcw className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Current rates: </span>
                  <span className="mono-num font-semibold text-foreground">
                    1 USDT = ${rates?.usdRate.toFixed(4)} USD
                  </span>
                  <span className="text-muted-foreground mx-2">|</span>
                  <span className="mono-num font-semibold text-foreground">
                    1 USDT = ₹{rates?.inrRate.toFixed(2)} INR
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Card className="shadow-card bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Sell Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* USDT Amount */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="usdt-amount"
                      className="text-sm font-medium"
                    >
                      USDT Amount
                    </Label>
                    <div className="relative">
                      <Input
                        id="usdt-amount"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-12 text-lg pr-20 mono-num bg-muted/50"
                        data-ocid="sell.amount_input"
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        USDT
                      </span>
                    </div>
                  </div>

                  {/* Currency Select */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Payout Currency
                    </Label>
                    <Select
                      value={currency}
                      onValueChange={handleCurrencyChange}
                      data-ocid="sell.currency_select"
                    >
                      <SelectTrigger
                        className="h-12 bg-muted/50"
                        data-ocid="sell.currency_select"
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Currency.usd}>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-chart-1/20 flex items-center justify-center text-xs font-bold text-chart-1">
                              $
                            </span>
                            US Dollar (USD)
                          </div>
                        </SelectItem>
                        <SelectItem value={Currency.inr}>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-chart-3/20 flex items-center justify-center text-xs font-bold text-chart-3">
                              ₹
                            </span>
                            Indian Rupee (INR)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payout Preview */}
                  {numAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      data-ocid="sell.payout_preview"
                      className="rounded-xl bg-primary/10 border border-primary/20 p-4"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        You will receive
                      </p>
                      <p className="mono-num text-3xl font-bold text-primary">
                        {formatCurrency(payoutAmount, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rate: 1 USDT ={" "}
                        {exchangeRate.toFixed(
                          currency === Currency.usd ? 4 : 2,
                        )}{" "}
                        {currencyLabel(currency)}
                      </p>
                    </motion.div>
                  )}

                  {/* Bank Account Select */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-muted-foreground" />
                        Bank Account
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-primary h-7 px-2 text-xs gap-1"
                      >
                        <Link to="/bank-accounts">
                          <Plus className="w-3 h-3" />
                          Add New
                        </Link>
                      </Button>
                    </div>

                    {accountsLoading ? (
                      <Skeleton className="h-12 w-full rounded-lg" />
                    ) : filteredAccounts.length === 0 ? (
                      <Alert className="border-muted bg-muted/30">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription className="text-sm">
                          No {currencyLabel(currency)} bank accounts found.{" "}
                          <Link
                            to="/bank-accounts"
                            className="text-primary underline underline-offset-2"
                          >
                            Add one now
                          </Link>
                          .
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select
                        value={bankAccountId}
                        onValueChange={setBankAccountId}
                      >
                        <SelectTrigger
                          className="h-12 bg-muted/50"
                          data-ocid="sell.bank_account_select"
                        >
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredAccounts.map((account) => (
                            <SelectItem
                              key={account.id.toString()}
                              value={account.id.toString()}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {account.bankName}
                                </span>
                                <span className="text-xs text-muted-foreground mono-num">
                                  {account.holderName} • ••••
                                  {account.accountNumber.slice(-4)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {selectedAccount && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-muted-foreground flex items-center gap-1.5 pl-1"
                      >
                        <Info className="w-3 h-3" />
                        {selectedAccount.holderName} •{" "}
                        {selectedAccount.bankName} • Routing/IFSC:{" "}
                        {selectedAccount.routingOrIFSC}
                      </motion.div>
                    )}
                  </div>

                  {/* Wallet address hint */}
                  {activeWallets && activeWallets.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border px-3 py-2.5">
                      <Wallet className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        After submitting, you'll be shown our USDT wallet
                        address to send funds to.
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isValid}
                    className="w-full h-12 gap-2 glow-teal"
                    data-ocid="sell.submit_button"
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        Confirm Sell Order
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you confirm that you want to sell the stated
                    USDT amount at the current exchange rate.
                  </p>
                </CardContent>
              </Card>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Send USDT Dialog — shown after order creation when wallets exist */}
      <SendUsdtDialog
        open={sendDialogOpen}
        wallets={activeWallets ?? []}
        onDone={handleSendDialogDone}
      />
    </AuthGuard>
  );
}
