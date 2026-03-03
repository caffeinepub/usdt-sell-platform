import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BankAccount {
    id: bigint;
    holderName: string;
    user: Principal;
    bankName: string;
    currency: Currency;
    isDefault: boolean;
    accountNumber: string;
    routingOrIFSC: string;
}
export interface SellOrder {
    id: bigint;
    status: OrderStatus;
    bankAccountSnapshot: BankAccount;
    createdAt: Time;
    user: Principal;
    payoutCurrency: Currency;
    adminNote: string;
    updatedAt: Time;
    exchangeRateUsed: number;
    usdtAmount: number;
    payoutAmount: number;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface ExchangeRates {
    usdRate: number;
    inrRate: number;
}
export enum Currency {
    inr = "inr",
    usd = "usd"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBankAccount(holderName: string, bankName: string, accountNumber: string, routingOrIFSC: string, currency: Currency, isDefault: boolean): Promise<bigint>;
    adminGetAllOrders(): Promise<Array<SellOrder>>;
    adminUpdateOrderStatus(orderId: bigint, newStatus: OrderStatus, adminNote: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSellOrder(usdtAmount: number, payoutCurrency: Currency, bankAccountId: bigint): Promise<bigint>;
    deleteBankAccount(id: bigint): Promise<void>;
    getBankAccount(id: bigint): Promise<BankAccount | null>;
    getCallerBankAccounts(): Promise<Array<BankAccount>>;
    getCallerOrders(): Promise<Array<SellOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExchangeRates(): Promise<ExchangeRates>;
    getOrderById(id: bigint): Promise<SellOrder | null>;
    getUserBankAccounts(user: Principal): Promise<Array<BankAccount>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setExchangeRate(currency: Currency, rate: number): Promise<void>;
    updateBankAccount(id: bigint, holderName: string, bankName: string, accountNumber: string, routingOrIFSC: string, currency: Currency, isDefault: boolean): Promise<void>;
}
