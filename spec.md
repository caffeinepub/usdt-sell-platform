# USDT Sell Platform

## Current State
The platform has a working bank account management system (add/edit/delete), sell orders, exchange rates, and admin panel. The backend uses an access control system where users must call `_initializeAccessControlWithSecret` to register before using any user-only endpoints. The `getUserRole` function in `access-control.mo` currently calls `Runtime.trap("User is not registered")` when a principal is not in the role map -- if this registration call fails or hasn't completed, all subsequent calls crash instead of returning a proper error.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- `access-control.mo`: Change `getUserRole` so that unregistered principals return `#guest` instead of trapping. This makes the system resilient -- if initialization is delayed or fails, calls return "Unauthorized" errors gracefully instead of crashing

### Remove
- Nothing to remove

## Implementation Plan
1. Regenerate backend Motoko code with the fixed `getUserRole` logic: unknown principals map to `#guest` role instead of calling `Runtime.trap`
2. This ensures that if a user's `_initializeAccessControlWithSecret` hasn't completed yet, they get a clean "Unauthorized" error rather than a crash, and the frontend error toast shows correctly
