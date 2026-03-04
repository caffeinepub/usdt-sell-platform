import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type BankAccount,
  Currency,
  type ExchangeRates,
  OrderStatus,
  type SellOrder,
  type UserProfile,
} from "../backend.d";
import type { ActorWithWallet, WalletAddress } from "../utils/walletTypes";
import { useActor } from "./useActor";

// ─── Exchange Rates ──────────────────────────────────────────────
export function useExchangeRates() {
  const { actor, isFetching } = useActor();
  return useQuery<ExchangeRates>({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      if (!actor) return { usdRate: 1.0, inrRate: 85.0 };
      return actor.getExchangeRates();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useSetExchangeRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      currency,
      rate,
    }: {
      currency: Currency;
      rate: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setExchangeRate(currency, rate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
      toast.success("Exchange rate updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update exchange rate");
    },
  });
}

// ─── Bank Accounts ───────────────────────────────────────────────
export function useBankAccounts() {
  const { actor, isFetching } = useActor();
  return useQuery<BankAccount[]>({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerBankAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBankAccount() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      holderName: string;
      bankName: string;
      accountNumber: string;
      routingOrIFSC: string;
      currency: Currency;
      isDefault: boolean;
    }) => {
      if (isFetching)
        throw new Error("Still connecting, please try again in a moment");
      if (!actor)
        throw new Error(
          "Not connected to backend. Please refresh and try again.",
        );
      return actor.addBankAccount(
        params.holderName,
        params.bankName,
        params.accountNumber,
        params.routingOrIFSC,
        params.currency,
        params.isDefault,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      toast.success("Bank account added successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add bank account");
    },
  });
}

export function useUpdateBankAccount() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      holderName: string;
      bankName: string;
      accountNumber: string;
      routingOrIFSC: string;
      currency: Currency;
      isDefault: boolean;
    }) => {
      if (isFetching)
        throw new Error("Still connecting, please try again in a moment");
      if (!actor)
        throw new Error(
          "Not connected to backend. Please refresh and try again.",
        );
      return actor.updateBankAccount(
        params.id,
        params.holderName,
        params.bankName,
        params.accountNumber,
        params.routingOrIFSC,
        params.currency,
        params.isDefault,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      toast.success("Bank account updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update bank account");
    },
  });
}

export function useDeleteBankAccount() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (isFetching)
        throw new Error("Still connecting, please try again in a moment");
      if (!actor)
        throw new Error(
          "Not connected to backend. Please refresh and try again.",
        );
      return actor.deleteBankAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      toast.success("Bank account deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete bank account");
    },
  });
}

// ─── Sell Orders ─────────────────────────────────────────────────
export function useCallerOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<SellOrder[]>({
    queryKey: ["callerOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrderById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SellOrder | null>({
    queryKey: ["order", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getOrderById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateSellOrder() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      usdtAmount: number;
      payoutCurrency: Currency;
      bankAccountId: bigint;
    }) => {
      if (isFetching)
        throw new Error("Still connecting, please try again in a moment");
      if (!actor)
        throw new Error(
          "Not connected to backend. Please refresh and try again.",
        );
      return actor.createSellOrder(
        params.usdtAmount,
        params.payoutCurrency,
        params.bankAccountId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerOrders"] });
      // Do NOT show success toast here — the user still needs to send USDT.
      // The success toast is shown in SellPage after the user confirms sending.
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create sell order");
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────
export function useAdminAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<SellOrder[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.adminGetAllOrders();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("not authorized") ||
          message.toLowerCase().includes("access denied")
        ) {
          toast.error(
            "Backend token required to view orders. Go to Admin Login → Advanced settings to add it.",
            { id: "admin-orders-unauthorized", duration: 6000 },
          );
          return [];
        }
        throw err;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAdminUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: bigint;
      newStatus: OrderStatus;
      adminNote: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminUpdateOrderStatus(
        params.orderId,
        params.newStatus,
        params.adminNote,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["callerOrders"] });
      toast.success("Order status updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update order status");
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── User Profile ────────────────────────────────────────────────
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile saved");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save profile");
    },
  });
}

// ─── Wallet Addresses ────────────────────────────────────────────
function walletActor(actor: ReturnType<typeof useActor>["actor"]) {
  return actor as unknown as ActorWithWallet;
}

export function useAdminWalletAddresses() {
  const { actor, isFetching } = useActor();
  return useQuery<WalletAddress[]>({
    queryKey: ["adminWalletAddresses"],
    queryFn: async () => {
      if (!actor) return [];
      return walletActor(actor).adminGetAllWalletAddresses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveWalletAddresses() {
  const { actor, isFetching } = useActor();
  return useQuery<WalletAddress[]>({
    queryKey: ["activeWalletAddresses"],
    queryFn: async () => {
      if (!actor) return [];
      return walletActor(actor).getActiveWalletAddresses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSaveWalletAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      label: string;
      address: string;
      network: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return walletActor(actor).adminSaveWalletAddress(
        params.label,
        params.address,
        params.network,
        params.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWalletAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["activeWalletAddresses"] });
      toast.success("Wallet address saved");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save wallet address");
    },
  });
}

export function useAdminUpdateWalletAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      label: string;
      address: string;
      network: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return walletActor(actor).adminUpdateWalletAddress(
        params.id,
        params.label,
        params.address,
        params.network,
        params.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWalletAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["activeWalletAddresses"] });
      toast.success("Wallet address updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update wallet address");
    },
  });
}

export function useAdminDeleteWalletAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return walletActor(actor).adminDeleteWalletAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWalletAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["activeWalletAddresses"] });
      toast.success("Wallet address deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete wallet address");
    },
  });
}

// Re-export types for convenience
export type { BankAccount, SellOrder, ExchangeRates, WalletAddress };
export { Currency, OrderStatus };
