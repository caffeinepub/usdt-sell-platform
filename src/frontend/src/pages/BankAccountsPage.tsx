import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertCircle,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type BankAccount, Currency } from "../backend.d";
import { AuthGuard } from "../components/shared/AuthGuard";
import { useActor } from "../hooks/useActor";
import {
  useAddBankAccount,
  useBankAccounts,
  useDeleteBankAccount,
  useUpdateBankAccount,
} from "../hooks/useQueries";

interface BankFormData {
  holderName: string;
  bankName: string;
  accountNumber: string;
  routingOrIFSC: string;
  currency: Currency;
  isDefault: boolean;
}

const defaultForm: BankFormData = {
  holderName: "",
  bankName: "",
  accountNumber: "",
  routingOrIFSC: "",
  currency: Currency.usd,
  isDefault: false,
};

function BankAccountForm({
  initial,
  onSubmit,
  isPending,
  submitLabel,
  error,
}: {
  initial?: BankFormData;
  onSubmit: (data: BankFormData) => void;
  isPending: boolean;
  submitLabel: string;
  error?: string;
}) {
  const [form, setForm] = useState<BankFormData>(initial ?? defaultForm);

  const handleChange =
    (field: keyof BankFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="holder-name" className="text-sm">
          Account Holder Name
        </Label>
        <Input
          id="holder-name"
          value={form.holderName}
          onChange={handleChange("holderName")}
          placeholder="John Smith"
          required
          data-ocid="bank_form.input"
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank-name" className="text-sm">
          Bank Name
        </Label>
        <Input
          id="bank-name"
          value={form.bankName}
          onChange={handleChange("bankName")}
          placeholder="Chase Bank / HDFC Bank"
          required
          data-ocid="bank_form.input"
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-number" className="text-sm">
          Account Number
        </Label>
        <Input
          id="account-number"
          value={form.accountNumber}
          onChange={handleChange("accountNumber")}
          placeholder="••••••••1234"
          required
          data-ocid="bank_form.input"
          className="bg-muted/50 mono-num"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="routing-ifsc" className="text-sm">
          {form.currency === Currency.usd ? "Routing Number" : "IFSC Code"}
        </Label>
        <Input
          id="routing-ifsc"
          value={form.routingOrIFSC}
          onChange={handleChange("routingOrIFSC")}
          placeholder={
            form.currency === Currency.usd ? "021000021" : "HDFC0001234"
          }
          required
          data-ocid="bank_form.input"
          className="bg-muted/50 mono-num"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Currency</Label>
        <Select
          value={form.currency}
          onValueChange={(v) =>
            setForm((prev) => ({ ...prev, currency: v as Currency }))
          }
        >
          <SelectTrigger className="bg-muted/50" data-ocid="bank_form.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Currency.usd}>USD — US Dollar</SelectItem>
            <SelectItem value={Currency.inr}>INR — Indian Rupee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Checkbox
          id="is-default"
          checked={form.isDefault}
          onCheckedChange={(checked) =>
            setForm((prev) => ({ ...prev, isDefault: !!checked }))
          }
          data-ocid="bank_form.checkbox"
        />
        <Label htmlFor="is-default" className="text-sm cursor-pointer">
          Set as default account
        </Label>
      </div>

      {/* Inline error message */}
      {error && (
        <div
          data-ocid="bank_form.error_state"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DialogFooter className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full gap-2 glow-teal"
          data-ocid="bank_form.submit_button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function BankAccountCard({
  account,
  index,
}: {
  account: BankAccount;
  index: number;
}) {
  const { isFetching: actorFetching } = useActor();
  const updateAccount = useUpdateBankAccount();
  const deleteAccount = useDeleteBankAccount();
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | undefined>();

  const handleUpdate = async (data: BankFormData) => {
    setEditError(undefined);
    try {
      await updateAccount.mutateAsync({
        id: account.id,
        ...data,
      });
      setEditOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update bank account";
      setEditError(msg);
    }
  };

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditError(undefined);
  };

  const handleDelete = async () => {
    await deleteAccount.mutateAsync(account.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      data-ocid={`bank_accounts.item.${index}`}
      className="glass-card rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="font-semibold">{account.bankName}</p>
              {account.isDefault && (
                <Badge className="text-xs gap-1 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                  <Star className="w-3 h-3 fill-primary" />
                  Default
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {account.currency === Currency.usd ? "USD" : "INR"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {account.holderName}
            </p>
            <p className="mono-num text-xs text-muted-foreground mt-1">
              ••••{account.accountNumber.slice(-4)}
              <span className="mx-2 text-border">|</span>
              {account.currency === Currency.usd ? "Routing" : "IFSC"}:{" "}
              {account.routingOrIFSC}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              data-ocid={`bank_accounts.edit_button.${index}`}
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Edit Bank Account
                </DialogTitle>
                <DialogDescription>
                  Update your bank account details.
                </DialogDescription>
              </DialogHeader>
              <BankAccountForm
                key={
                  editOpen
                    ? `edit-open-${account.id}`
                    : `edit-closed-${account.id}`
                }
                initial={{
                  holderName: account.holderName,
                  bankName: account.bankName,
                  accountNumber: account.accountNumber,
                  routingOrIFSC: account.routingOrIFSC,
                  currency: account.currency,
                  isDefault: account.isDefault,
                }}
                onSubmit={handleUpdate}
                isPending={updateAccount.isPending || actorFetching}
                submitLabel={actorFetching ? "Connecting..." : "Save Changes"}
                error={editError}
              />
            </DialogContent>
          </Dialog>

          {/* Delete AlertDialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-destructive"
                data-ocid={`bank_accounts.delete_button.${index}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid={`bank_accounts.dialog.${index}`}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bank Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the{" "}
                  <strong>{account.bankName}</strong> account ending in{" "}
                  <strong className="mono-num">
                    ••••{account.accountNumber.slice(-4)}
                  </strong>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  data-ocid={`bank_accounts.cancel_button.${index}`}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                  data-ocid={`bank_accounts.confirm_button.${index}`}
                >
                  {deleteAccount.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

export function BankAccountsPage() {
  const { data: accounts, isLoading } = useBankAccounts();
  const { isFetching: actorFetching } = useActor();
  const addAccount = useAddBankAccount();
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | undefined>();

  const handleAddOpenChange = (open: boolean) => {
    setAddOpen(open);
    if (!open) setAddError(undefined);
  };

  const handleAdd = async (data: BankFormData) => {
    setAddError(undefined);
    try {
      await addAccount.mutateAsync(data);
      setAddOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to add bank account";
      setAddError(msg);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen mesh-bg py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">
                  Bank Accounts
                </h1>
                <p className="text-muted-foreground">
                  Manage your payout bank accounts
                </p>
              </div>

              <Button
                className="gap-2 glow-teal"
                data-ocid="bank_accounts.open_modal_button"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Account
              </Button>
            </div>

            {isLoading ? (
              <div
                className="space-y-4"
                data-ocid="bank_accounts.loading_state"
              >
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            ) : !accounts || accounts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="bank_accounts.empty_state"
                className="glass-card rounded-2xl p-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Landmark className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  No bank accounts
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Add a bank account to start receiving USDT payouts.
                </p>
                <Button
                  className="gap-2 glow-teal"
                  data-ocid="bank_accounts.primary_button"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Account
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {accounts.map((account, i) => (
                    <BankAccountCard
                      key={account.id.toString()}
                      account={account}
                      index={i + 1}
                    />
                  ))}
                </AnimatePresence>
                <p className="text-xs text-center text-muted-foreground pt-2">
                  {accounts.length} account{accounts.length !== 1 ? "s" : ""}{" "}
                  saved
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Single Add Account Dialog — shared by header button and empty-state button */}
      <Dialog open={addOpen} onOpenChange={handleAddOpenChange}>
        <DialogContent data-ocid="bank_accounts.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Add Bank Account
            </DialogTitle>
            <DialogDescription>
              Add a new bank account to receive USDT payouts.
            </DialogDescription>
          </DialogHeader>
          <BankAccountForm
            key={addOpen ? "add-open" : "add-closed"}
            onSubmit={handleAdd}
            isPending={addAccount.isPending || actorFetching}
            submitLabel={actorFetching ? "Connecting..." : "Add Account"}
            error={addError}
          />
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
