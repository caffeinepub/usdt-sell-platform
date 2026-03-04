# USDT Sell Platform

## Current State
- Users can sell USDT and receive USD/INR payouts to saved bank accounts
- Orders are created via `createSellOrder` in the backend
- Admin panel uses username/password login (not Internet Identity)
- Wallet address management is partially implemented: the frontend types exist (`walletTypes.ts`) and the frontend calls `adminSaveWalletAddress`, `adminUpdateWalletAddress`, `adminDeleteWalletAddress`, `adminGetAllWalletAddresses`, `getActiveWalletAddresses` via a cast trick -- but these methods are MISSING from the backend
- The admin panel calls `adminGetAllOrders()` which requires `#admin` permission, but since admin uses password-based login (no Internet Identity), the actor runs as anonymous and the call fails -- so no orders appear in admin panel
- The success toast "Sell order created successfully!" fires immediately when order is placed, before the user is shown the wallet address to send USDT -- this is misleading

## Requested Changes (Diff)

### Add
- `WalletAddress` type in backend with fields: `id: Nat`, `label: Text`, `address: Text`, `network: Text`, `isActive: Bool`
- `adminSaveWalletAddress(label, address, network, isActive)` -- admin only, returns new ID
- `adminUpdateWalletAddress(id, label, address, network, isActive)` -- admin only
- `adminDeleteWalletAddress(id)` -- admin only
- `adminGetAllWalletAddresses()` -- admin only, returns all wallet addresses
- `getActiveWalletAddresses()` -- public query, returns only active addresses
- `adminGetAllOrders()` must be callable by any authenticated principal (not gated to `#admin` role only) OR a separate public version for the admin UI that doesn't require on-chain admin role since the admin UI uses its own password-based auth

### Modify
- Change `adminGetAllOrders` to be callable without requiring `#admin` backend permission -- since the admin panel uses password login (not Internet Identity), the actor is anonymous. The function should still exist but be accessible to all authenticated callers, OR add a separate `getAllOrdersForAdmin()` query with no auth check (the frontend handles access control via password)
- Remove the misleading "Sell order created successfully!" toast from `useCreateSellOrder` mutation -- the success message should only appear after user confirms they sent USDT

### Remove
- Nothing

## Implementation Plan
1. Add `WalletAddress` type and in-memory store to backend
2. Add all 5 wallet address methods to backend
3. Change `adminGetAllOrders` to not require `#admin` permission (remove the permission check, or make it open query) so the password-protected admin UI can call it
4. Update `backend.d.ts` with `WalletAddress` type and all new method signatures
5. In `useQueries.ts`: remove the success toast from `useCreateSellOrder`
6. In `SellPage.tsx`: show "Order created -- now send your USDT" only inside the wallet dialog, not via toast
