# USDT Sell Platform

## Current State

The platform has:
- Admin dashboard with two tabs: "All Orders" and "Exchange Rates"
- Backend supports managing sell orders and setting USDT/USD and USDT/INR exchange rates
- Users can sell USDT and receive payment to saved bank accounts
- No concept of a platform wallet address (where users send their USDT before payout is processed)

## Requested Changes (Diff)

### Add
- `WalletAddress` type in backend with fields: `id`, `label`, `address`, `network`, `isActive`
- Backend functions: `adminSetWalletAddress`, `adminGetWalletAddresses`, `adminDeleteWalletAddress`, `getActiveWalletAddresses` (public, no auth)
- New "Wallet Addresses" tab in the Admin Dashboard
- Wallet address management UI: list of saved wallet addresses with network label, copy-to-clipboard, add new, edit, delete
- `getActiveWalletAddresses` exposed publicly so users can see the current deposit address when placing a sell order

### Modify
- `SellPage.tsx` — show the active wallet address(es) to the user after order creation, with copy button, so they know where to send USDT
- `AdminPage.tsx` — add third tab "Wallet Addresses" with full CRUD panel

### Remove
- Nothing removed

## Implementation Plan

1. Add `WalletAddress` type and store to `main.mo` with admin-only write functions and public read
2. Regenerate `backend.d.ts` via `generate_motoko_code`
3. Add `useWalletAddresses`, `useAdminWalletAddresses`, `useAdminSaveWalletAddress`, `useAdminDeleteWalletAddress` query hooks in frontend
4. Build `WalletAddressesPanel` component in `AdminPage.tsx` with add/edit/delete dialog
5. Update `SellPage.tsx` to show active wallet addresses after order is placed
6. Validate, typecheck, build
