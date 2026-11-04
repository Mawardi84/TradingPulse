# Security Specification - AstraView TradePulse Pro

## Data Invariants
1. A user profile must match the authenticated UID and can only be accessed by that user.
2. Watchlists, portfolio positions, and settings must belong to a valid user and are strictly private to that user.
3. CreatedAt and UpdatedAt timestamps must always be verified against the server time (`request.time`).
4. Users must have a verified email address to perform any write operations to prevent spam/abuse.

## The "Dirty Dozen" Payloads (Denial Targets)
1. Creating a profile with a different UID than authenticated.
2. Updating `createdAt` on an existing profile or watchlist.
3. Creating a position with a negative volume or entry price.
4. Setting `status` to an invalid enum value (not OPEN or CLOSED).
5. Injecting a massive string (> 5000 chars) into `layoutConfig`.
6. Reading another user's watchlist by guessing their UID.
7. Deleting another user's portfolio position.
8. Creating a document without the required `updatedAt` field.
9. Using a client-provided timestamp that differs from server time.
10. Writing data with an unverified email account.
11. Bypassing size limits on `displayName` or `symbol`.
12. Attempting to update `userId` field once established.

## Test Runner (firestore.rules.test.ts)
```typescript
// Tests to be implemented to verify DENY on the dirty dozen
```
