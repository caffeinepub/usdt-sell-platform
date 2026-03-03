import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpDown,
  Check,
  ClipboardList,
  Copy,
  DollarSign,
  LayoutDashboard,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Currency, OrderStatus, type SellOrder } from "../backend.d";
import { StatusBadge } from "../components/shared/StatusBadge";
import {
  useAdminAllOrders,
  useAdminDeleteWalletAddress,
  useAdminSaveWalletAddress,
  useAdminUpdateOrderStatus,
  useAdminUpdateWalletAddress,
  useAdminWalletAddresses,
  useExchangeRates,
  useSetExchangeRate,
} from "../hooks/useQueries";
import {
  formatCurrency,
  formatDateShort,
  shortOrderId,
  statusLabel,
} from "../utils/format";
import type { WalletAddress } from "../utils/walletTypes";

function StatusUpdateDialog({
  order,
  open,
  onClose,
}: {
  order: SellOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateStatus = useAdminUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order?.status ?? OrderStatus.pending,
  );
  const [adminNote, setAdminNote] = useState(order?.adminNote ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    await updateStatus.mutateAsync({
      orderId: order.id,
      newStatus: selectedStatus,
      adminNote,
    });
    onClose();
  };

  // Allow user to change status freely
  if (order && selectedStatus !== order.status && !updateStatus.isPending) {
    // no-op
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      data-ocid="status_update.dialog"
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Update Order Status
          </DialogTitle>
          <DialogDescription>
            Update status for order{" "}
            <span className="mono-num font-bold text-primary">
              {order ? shortOrderId(order.id) : ""}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
              data-ocid="status_update.status_select"
            >
              <SelectTrigger data-ocid="status_update.status_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Admin Note (optional)</Label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note for the user..."
              className="resize-none bg-muted/50"
              rows={3}
              data-ocid="status_update.note_textarea"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="status_update.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStatus.isPending}
              className="gap-2 glow-teal"
              data-ocid="status_update.confirm_button"
            >
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExchangeRatesPanel() {
  const { data: rates, isLoading } = useExchangeRates();
  const setRate = useSetExchangeRate();

  const [usdInput, setUsdInput] = useState("");
  const [inrInput, setInrInput] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const promises: Promise<void>[] = [];

    if (usdInput && Number.parseFloat(usdInput) > 0) {
      promises.push(
        setRate.mutateAsync({
          currency: Currency.usd,
          rate: Number.parseFloat(usdInput),
        }),
      );
    }
    if (inrInput && Number.parseFloat(inrInput) > 0) {
      promises.push(
        setRate.mutateAsync({
          currency: Currency.inr,
          rate: Number.parseFloat(inrInput),
        }),
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      setUsdInput("");
      setInrInput("");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Current USD Rate</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="mono-num text-2xl font-bold text-primary">
              ${rates?.usdRate.toFixed(4)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">per USDT</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Current INR Rate</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="mono-num text-2xl font-bold text-chart-3">
              ₹{rates?.inrRate.toFixed(2)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">per USDT</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Update Exchange Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="usd-rate"
                className="text-sm flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-chart-1" />
                USDT/USD Rate
              </Label>
              <div className="relative">
                <Input
                  id="usd-rate"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={usdInput}
                  onChange={(e) => setUsdInput(e.target.value)}
                  placeholder={rates?.usdRate.toFixed(4) ?? "1.0000"}
                  className="pr-16 bg-muted/50 mono-num"
                  data-ocid="admin.usd_rate_input"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  USD
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="inr-rate"
                className="text-sm flex items-center gap-2"
              >
                <span className="text-chart-3 font-bold text-sm">₹</span>
                USDT/INR Rate
              </Label>
              <div className="relative">
                <Input
                  id="inr-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={inrInput}
                  onChange={(e) => setInrInput(e.target.value)}
                  placeholder={rates?.inrRate.toFixed(2) ?? "85.00"}
                  className="pr-16 bg-muted/50 mono-num"
                  data-ocid="admin.inr_rate_input"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  INR
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={setRate.isPending || (!usdInput && !inrInput)}
              className="w-full gap-2 glow-teal"
              data-ocid="admin.save_rates_button"
            >
              {setRate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Save Exchange Rates
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminOrdersTable() {
  const { data: orders, isLoading } = useAdminAllOrders();
  const [selectedOrder, setSelectedOrder] = useState<SellOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortedOrders = orders ? [...orders].reverse() : [];

  return (
    <>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-xl font-bold mb-2">No orders yet</p>
          <p className="text-muted-foreground text-sm">
            Orders will appear here once users start selling USDT.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden shadow-card">
          {/* Desktop */}
          <div className="hidden lg:block">
            <Table data-ocid="admin.orders_table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3" />
                      Order ID
                    </div>
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    User
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    USDT
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Payout
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Currency
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order, idx) => (
                  <TableRow
                    key={order.id.toString()}
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="mono-num text-sm font-bold text-primary">
                      {shortOrderId(order.id)}
                    </TableCell>
                    <TableCell className="mono-num text-xs text-muted-foreground max-w-[100px] truncate">
                      {order.user.toString().slice(0, 8)}...
                    </TableCell>
                    <TableCell className="mono-num text-sm">
                      {order.usdtAmount.toFixed(4)}
                    </TableCell>
                    <TableCell className="mono-num text-sm font-semibold text-primary">
                      {formatCurrency(order.payoutAmount, order.payoutCurrency)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                        {order.payoutCurrency === Currency.usd ? "USD" : "INR"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateShort(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-3"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDialogOpen(true);
                        }}
                        data-ocid={idx === 0 ? "admin.orders_table" : undefined}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden divide-y divide-border">
            {sortedOrders.map((order) => (
              <div
                key={order.id.toString()}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="mono-num text-sm font-bold text-primary">
                      {shortOrderId(order.id)}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="mono-num text-sm">
                    {order.usdtAmount.toFixed(4)} USDT →{" "}
                    {formatCurrency(order.payoutAmount, order.payoutCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(order.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex-shrink-0"
                  onClick={() => {
                    setSelectedOrder(order);
                    setDialogOpen(true);
                  }}
                >
                  Update
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <StatusUpdateDialog
        order={selectedOrder}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
}

// ─── Wallet Address Form Dialog ───────────────────────────────────
const NETWORK_OPTIONS = ["TRC20", "ERC20", "BEP20", "Other"];

function WalletAddressDialog({
  open,
  onClose,
  editingAddress,
}: {
  open: boolean;
  onClose: () => void;
  editingAddress: WalletAddress | null;
}) {
  const saveWallet = useAdminSaveWalletAddress();
  const updateWallet = useAdminUpdateWalletAddress();

  const isEditing = editingAddress !== null;

  const [label, setLabel] = useState(editingAddress?.label ?? "");
  const [address, setAddress] = useState(editingAddress?.address ?? "");
  const [network, setNetwork] = useState(editingAddress?.network ?? "TRC20");
  const [customNetwork, setCustomNetwork] = useState(
    editingAddress && !NETWORK_OPTIONS.includes(editingAddress.network)
      ? editingAddress.network
      : "",
  );
  const [isActive, setIsActive] = useState(editingAddress?.isActive ?? true);

  const networkIsOther =
    network === "Other" ||
    (editingAddress !== null && !NETWORK_OPTIONS.includes(network));

  const effectiveNetwork = networkIsOther ? customNetwork : network;

  const isPending = saveWallet.isPending || updateWallet.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !address.trim() || !effectiveNetwork.trim()) return;

    if (isEditing && editingAddress) {
      await updateWallet.mutateAsync({
        id: editingAddress.id,
        label: label.trim(),
        address: address.trim(),
        network: effectiveNetwork.trim(),
        isActive,
      });
    } else {
      await saveWallet.mutateAsync({
        label: label.trim(),
        address: address.trim(),
        network: effectiveNetwork.trim(),
        isActive,
      });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      data-ocid="admin.wallet_address_dialog"
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Wallet Address" : "Add Wallet Address"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the USDT receiving wallet address."
              : "Add a new USDT receiving wallet address for users to send funds to."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="wallet-label" className="text-sm font-medium">
              Label
            </Label>
            <Input
              id="wallet-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Main TRC20 Wallet"
              className="bg-muted/50"
              required
              data-ocid="admin.wallet_label_input"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="wallet-address" className="text-sm font-medium">
              Wallet Address
            </Label>
            <Input
              id="wallet-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="TRx... or 0x..."
              className="bg-muted/50 font-mono text-sm"
              required
              data-ocid="admin.wallet_address_input"
            />
          </div>

          {/* Network */}
          <div className="space-y-2">
            <Label htmlFor="wallet-network" className="text-sm font-medium">
              Network
            </Label>
            <Select
              value={NETWORK_OPTIONS.includes(network) ? network : "Other"}
              onValueChange={(val) => {
                setNetwork(val);
                if (val !== "Other") setCustomNetwork("");
              }}
              data-ocid="admin.wallet_network_select"
            >
              <SelectTrigger
                id="wallet-network"
                className="bg-muted/50"
                data-ocid="admin.wallet_network_select"
              >
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORK_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {networkIsOther && (
              <Input
                value={customNetwork}
                onChange={(e) => setCustomNetwork(e.target.value)}
                placeholder="Enter network name"
                className="bg-muted/50 text-sm mt-2"
                required={networkIsOther}
              />
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Active addresses are shown to users when placing orders
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              data-ocid="admin.wallet_active_switch"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="admin.wallet_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 glow-teal"
              data-ocid="admin.wallet_save_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Address"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Wallet Addresses Panel ───────────────────────────────────────
function WalletAddressesPanel() {
  const { data: wallets, isLoading } = useAdminWalletAddresses();
  const deleteWallet = useAdminDeleteWalletAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<WalletAddress | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<WalletAddress | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteWallet.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (wallet: WalletAddress) => {
    setEditingAddress(wallet);
    setDialogOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Wallet Addresses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage USDT receiving addresses shown to users when placing orders.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="gap-2 glow-teal"
          data-ocid="admin.add_wallet_button"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !wallets || wallets.length === 0 ? (
        <div
          className="text-center py-16 glass-card rounded-2xl"
          data-ocid="admin.wallet.empty_state"
        >
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-xl font-bold mb-2">
            No wallet addresses yet
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Add USDT receiving addresses so users know where to send their
            funds.
          </p>
          <Button
            onClick={handleOpenAdd}
            className="gap-2 glow-teal"
            data-ocid="admin.add_wallet_button"
          >
            <Plus className="w-4 h-4" />
            Add First Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet, idx) => (
            <motion.div
              key={wallet.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              data-ocid={`admin.wallet.item.${idx + 1}`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{wallet.label}</span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0 font-mono"
                  >
                    {wallet.network}
                  </Badge>
                  {wallet.isActive ? (
                    <Badge className="text-xs px-2 py-0 bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15">
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 text-muted-foreground"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[260px] sm:max-w-[400px]">
                    {wallet.address}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(wallet.address, wallet.id.toString())
                    }
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy address"
                  >
                    {copiedId === wallet.id.toString() ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 px-3 text-xs"
                  onClick={() => handleOpenEdit(wallet)}
                  data-ocid={`admin.wallet_edit_button.${idx + 1}`}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setDeleteTarget(wallet)}
                  data-ocid={`admin.wallet_delete_button.${idx + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <WalletAddressDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAddress(null);
        }}
        editingAddress={editingAddress}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet Address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.label}
              </span>{" "}
              ({deleteTarget?.network}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.wallet.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.wallet.confirm_button"
            >
              {deleteWallet.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AdminPage() {
  return (
    <main className="min-h-screen mesh-bg py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage orders, exchange rates, and wallet addresses
            </p>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="mb-6 bg-muted/50">
              <TabsTrigger
                value="orders"
                className="gap-2"
                data-ocid="admin.orders_tab"
              >
                <ClipboardList className="w-4 h-4" />
                All Orders
              </TabsTrigger>
              <TabsTrigger
                value="rates"
                className="gap-2"
                data-ocid="admin.rates_tab"
              >
                <TrendingUp className="w-4 h-4" />
                Exchange Rates
              </TabsTrigger>
              <TabsTrigger
                value="wallets"
                className="gap-2"
                data-ocid="admin.wallet_tab"
              >
                <Wallet className="w-4 h-4" />
                Wallet Addresses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <AdminOrdersTable />
            </TabsContent>

            <TabsContent value="rates">
              <ExchangeRatesPanel />
            </TabsContent>

            <TabsContent value="wallets">
              <WalletAddressesPanel />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
