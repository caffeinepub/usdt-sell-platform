// Wallet address types for USDT receiving addresses
export interface WalletAddress {
  id: bigint;
  label: string;
  address: string;
  network: string;
  isActive: boolean;
}

// Extended actor interface with wallet address methods
export interface ActorWithWallet {
  adminSaveWalletAddress(
    label: string,
    address: string,
    network: string,
    isActive: boolean,
  ): Promise<bigint>;
  adminUpdateWalletAddress(
    id: bigint,
    label: string,
    address: string,
    network: string,
    isActive: boolean,
  ): Promise<void>;
  adminDeleteWalletAddress(id: bigint): Promise<void>;
  adminGetAllWalletAddresses(): Promise<Array<WalletAddress>>;
  getActiveWalletAddresses(): Promise<Array<WalletAddress>>;
}
