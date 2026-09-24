sync# AmarHisab — Dexie Offline Cache Architecture

## 1. Purpose

AmarHisab uses **Supabase as the source of truth** and **Dexie/IndexedDB as the local offline cache**.

The main goals are:

- App should work when internet is unavailable.
- Existing data should appear from Dexie immediately.
- Network failure must not crash the UI.
- Supabase remains the authoritative database.
- All writes must go to Supabase first.
- Dexie is updated only after a successful Supabase write.
- Explicit refresh should fetch fresh data from Supabase.
- Offline users should still be able to view previously synced data.

---

# 2. Core Architecture

```text
                    ┌─────────────────┐
                    │    Supabase     │
                    │ Source of Truth │
                    └────────┬────────┘
                             │
                    Background Sync
                             │
                             ▼
                    ┌─────────────────┐
                    │      Dexie      │
                    │  Local Cache    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │       UI        │
                    └─────────────────┘
```

The application follows two different rules for **reads** and **writes**.

---

# 3. READ Architecture

## Normal Page Load

Normal page loading should be **Dexie-first**.

```text
Page opens
    ↓
Read Dexie
    ↓
Show cached data immediately
    ↓
UI is usable
    ↓
Background Supabase sync
    ↓
Save fresh data to Dexie
    ↓
Update UI
```

### Important

The user should not have to wait for Supabase just to see previously loaded data.

If internet is unavailable:

```text
Page opens
    ↓
Dexie
    ↓
Cached data
    ↓
UI works normally
```

No crash should occur.

---

# 4. First-Ever Load

If Dexie has no data yet, the application has no local cache to display.

In that case:

```text
Page opens
    ↓
Dexie is empty
    ↓
Request Supabase
    ↓
Success?
   ├── YES
   │     ↓
   │   Save to Dexie
   │     ↓
   │   Show UI
   │
   └── NO
         ↓
      Empty/offline state
```

This is the only normal situation where the user may need to wait for Supabase before data can be displayed.

---

# 5. WRITE Architecture

Writes must always use **Supabase first**.

This applies to:

- Create
- Update
- Archive
- Activate
- Deactivate
- Any other database mutation

The correct flow is:

```text
User action
    ↓
Supabase
    ↓
Successful?
   ├── YES
   │     ↓
   │   Update Dexie
   │     ↓
   │   Update UI
   │
   └── NO
         ↓
      Show error
         ↓
      Do NOT update Dexie
```

## Never do this

```text
User action
    ↓
Dexie
    ↓
Supabase
```

This is not allowed because Dexie must not become an independent source of truth.

---

# 6. Why Supabase Must Come First for Writes

AmarHisab is a financial application.

For financial data, local optimistic writes can create problems such as:

- Data appearing locally but not existing on the server.
- Failed transactions remaining in the local cache.
- Different devices showing different financial records.
- Incorrect balances.
- Sync conflicts.

Therefore:

> Supabase is authoritative. Dexie only mirrors successfully saved server data.

---

# 7. Refresh Architecture

Refresh is different from normal page loading.

When the user explicitly presses Refresh:

```text
User presses Refresh
        ↓
Supabase
        ↓
Fetch latest data
        ↓
Success?
   ├── YES
   │     ↓
   │   Replace/update Dexie
   │     ↓
   │   Update UI
   │
   └── NO
         ↓
      Keep existing Dexie data
         ↓
      Show non-blocking error/state
```

## Important Rule

A failed refresh must **never clear Dexie**.

Wrong:

```text
Refresh
   ↓
Dexie.clear()
   ↓
Supabase fails
   ↓
No data
```

Correct:

```text
Refresh
   ↓
Supabase
   ↓
Failed
   ↓
Keep old Dexie data
```

---

# 8. Three Data Modes

AmarHisab has three main data situations.

## Mode A — Cached + Online

```text
Dexie
 ↓
Show cached data
 ↓
Supabase sync
 ↓
Fresh data
 ↓
Dexie update
 ↓
UI update
```

This should provide a fast UI while still keeping data fresh.

---

## Mode B — Cached + Offline

```text
Dexie
 ↓
Show cached data
 ↓
Supabase unavailable
 ↓
Keep cached data
```

The page remains usable.

---

## Mode C — No Cache + Offline

```text
Dexie
 ↓
Empty
 ↓
Supabase unavailable
 ↓
Show offline/empty state
```

The app must not crash.

Example:

```text
You're offline

Previously synced data is not available on this device yet.
```

---

# 9. Database Structure

Current Dexie database:

```text
amarhisab
│
├── agents
├── agencies
└── transactions
```

Defined in:

```text
src/lib/db.ts
```

---

# 10. Dexie Database

Current database definition:

```tsx
import Dexie, { type Table } from "dexie"

import type { Agent } from "@/modules/app/agents/types/agent"
import type { Agency } from "@/modules/app/agencies/types/agency"
import type { Transaction } from "@/modules/app/transactions/types/transaction"

export class AmarHisabDatabase extends Dexie {
  agents!: Table<Agent, string>
  agencies!: Table<Agency, string>
  transactions!: Table<Transaction, string>

  constructor() {
    super("amarhisab")

    this.version(1).stores({
      agents: "id, sl, name, is_active, created_at",
      agencies: "id, sl, name, is_active, created_at",
      transactions:
        "id, transaction_group_id, root_transaction_id, type, transaction_date, party_type, agent_id, agency_id, is_active, created_at",
    })
  }
}

export const db = new AmarHisabDatabase()
```

---

# 11. Cache Tables

## Agents

Dexie stores:

```text
id
sl
name
phone
is_active
created_at
```

Inactive agents should remain in Dexie.

This is important because archive/deactivation state is part of the data.

Pages can filter:

```tsx
.filter((agent) => agent.is_active)
```

---

# 12. Agencies

Dexie stores:

```text
id
sl
name
phone
is_active
created_at
```

Inactive agencies remain cached.

Pages decide whether to show active or inactive records.

---

# 13. Transactions

Dexie stores the complete transaction object:

```text
id
transaction_group_id
root_transaction_id
version_number
is_active
replaced_transaction_id

type
amount
transaction_date
description
payment_method
reference_no

party_type
agent_id
agency_id

created_at
```

Transactions are the primary financial data source for:

- Dashboard
- Transactions
- Parties
- Reports
- Statements
- Balance calculations

---

# 14. Cache Sync Service

Central cache synchronization lives in:

```text
src/lib/cache/sync.ts
```

The sync service is responsible for downloading server data and putting it into Dexie.

It should not contain UI logic.

---

# 15. Sync Rules

## Agents

```text
Supabase agents
      ↓
fetch
      ↓
Dexie agents
```

## Agencies

```text
Supabase agencies
      ↓
fetch
      ↓
Dexie agencies
```

## Transactions

```text
Supabase transactions
      ↓
fetch
      ↓
Dexie transactions
```

---

# 16. Full Sync

The application has:

```tsx
export async function syncAll(): Promise<void> {
  await Promise.all([
    syncAgents(),
    syncAgencies(),
    syncTransactions(),
  ])
}
```

This is useful for pages that need multiple datasets.

Example:

```text
Parties
 ├── Agents
 ├── Agencies
 └── Transactions
```

---

# 17. Important Sync Rule

The sync service should preserve the complete server representation.

Do not create fake/incomplete Dexie records just because a page only needs a few fields.

For example, this is wrong:

```text
DashboardTransaction
       ↓
manually create Transaction
       ↓
fill missing fields with fake defaults
       ↓
Dexie
```

Instead:

```text
Full Supabase Transaction
       ↓
Full Transaction
       ↓
Dexie
```

A page-specific interface should not be used to construct a different database entity.

---

# 18. Page Service Responsibilities

Each module service should have a clear responsibility.

Example:

```text
transaction-service.ts
```

Responsible for:

- Reading transaction data.
- Creating transactions.
- Updating transactions.
- Archiving transactions.
- Keeping transaction cache synchronized.

The UI should not directly manipulate Dexie.

---

# 19. UI Should Not Write Directly to Dexie

Wrong:

```tsx
await db.transactions.put(transaction)
```

inside a component.

Correct:

```text
UI
 ↓
transaction-service
 ↓
Supabase
 ↓
Dexie
 ↓
UI
```

Dexie operations should stay inside the service/cache layer.

---

# 20. Create Transaction

Correct flow:

```text
Quick Transaction / Transaction Sheet
                ↓
      createTransaction()
                ↓
            Supabase
                ↓
             success
                ↓
        db.transactions.put()
                ↓
              return
                ↓
               UI
```

If Supabase rejects the transaction:

```text
Supabase error
      ↓
throw error
      ↓
UI shows error
      ↓
Dexie unchanged
```

---

# 21. Update Transaction

Correct flow:

```text
Edit Transaction
      ↓
updateTransaction()
      ↓
Supabase UPDATE
      ↓
success
      ↓
Dexie PUT
      ↓
UI update
```

---

# 22. Archive Transaction

Correct flow:

```text
Archive
   ↓
Supabase
   ↓
is_active = false
   ↓
success
   ↓
Dexie PUT
   ↓
UI removes from active list
```

The archived record should remain in Dexie.

This allows the cache to preserve server state.

---

# 23. Agent Writes

Agent creation:

```text
Create Agent
    ↓
Supabase INSERT
    ↓
success
    ↓
Dexie agents.put()
```

Agent update:

```text
Update Agent
    ↓
Supabase UPDATE
    ↓
success
    ↓
Dexie agents.put()
```

Agent activation/deactivation:

```text
Toggle
    ↓
Supabase UPDATE
    ↓
success
    ↓
Dexie agents.put()
```

---

# 24. Agency Writes

Same architecture:

```text
UI
 ↓
Supabase
 ↓
success
 ↓
Dexie
 ↓
UI
```

Never:

```text
UI
 ↓
Dexie
 ↓
Supabase
```

---

# 25. Error Handling

Network errors should be treated as normal application states.

They should not crash the page.

Example:

```text
Supabase unavailable
        ↓
Try Dexie
        ↓
Data exists?
   ├── YES → Show cached data
   └── NO  → Show friendly offline state
```

---

# 26. Cache Must Never Be Destroyed on Failed Sync

This is one of the most important rules.

Never do:

```tsx
await db.transactions.clear()

try {
  await syncFromSupabase()
} catch {
  // cache is already gone
}
```

Correct approach:

```text
Fetch Supabase first
       ↓
Success?
   ├── YES
   │    ↓
   │  Replace Dexie
   │
   └── NO
        ↓
      Keep Dexie
```

---

# 27. Why Existing Cache Should Survive Offline Mode

Suppose the user last opened AmarHisab while online.

Dexie contains:

```text
Transactions: 250
Agents: 30
Agencies: 8
```

Later the user has no internet.

The application should still show:

```text
Transactions: 250
Agents: 30
Agencies: 8
```

The application should not become blank simply because Supabase cannot be reached.

---

# 28. Freshness

Dexie is a cache, not the source of truth.

Therefore:

```text
Dexie = fast local snapshot
Supabase = authoritative current data
```

Cached data may be slightly old.

When network is available, background sync should update it.

---

# 29. Normal Navigation

When moving between pages:

```text
Transactions
    ↓
Parties
    ↓
Dashboard
    ↓
Transactions
```

The application should not unnecessarily depend on network connectivity for every navigation.

Dexie should provide the local data.

---

# 30. Refresh Button

The refresh button is an explicit request for fresh server data.

Therefore:

```tsx
void loadData(true)
```

should trigger the refresh path.

It should not be treated as normal cache-first navigation.

---

# 31. Loading States

There are two different loading concepts.

## Initial Loading

```text
loading = true
```

Used when no usable data is currently displayed.

Example:

```text
Skeleton
```

## Refreshing

```text
refreshing = true
```

Used when existing data is already visible.

Example:

```text
Existing list remains visible
+
Refresh icon spins
```

This prevents the UI from flashing back to skeletons during refresh.

---

# 32. Correct Page Pattern

A page should conceptually follow:

```tsx
useEffect(() => {
  void loadData()
}, [])
```

Normal `loadData()`:

```text
Dexie
 ↓
show cached data
 ↓
background sync
 ↓
fresh data
```

Refresh:

```tsx
void loadData(true)
```

Refresh:

```text
Supabase
 ↓
success
 ↓
Dexie
 ↓
UI
```

---

# 33. Transactions Page

Transactions are financial data.

The preferred behavior is:

```text
Page open
    ↓
Dexie transactions
    ↓
Show existing transactions
    ↓
Background Supabase sync
    ↓
Dexie update
    ↓
UI update
```

Explicit refresh:

```text
Refresh
    ↓
Supabase
    ↓
Dexie
    ↓
UI
```

---

# 34. Agents Page

Preferred behavior:

```text
Page open
    ↓
Dexie agents
    ↓
Show cached agents
    ↓
Background Supabase sync
    ↓
Dexie update
    ↓
UI update
```

---

# 35. Agencies Page

Preferred behavior:

```text
Page open
    ↓
Dexie agencies
    ↓
Show cached agencies
    ↓
Background Supabase sync
    ↓
Dexie update
    ↓
UI update
```

---

# 36. Parties Page

Parties are derived from:

```text
Agents
+
Agencies
+
Transactions
```

Therefore:

```text
Dexie
 ├── agents
 ├── agencies
 └── transactions
       ↓
Party Service
       ↓
Combined party list
```

No separate `parties` database table is required.

---

# 37. Dashboard

Dashboard data can be derived from cached data when offline.

Example:

```text
Dexie transactions
      ↓
Income
Expense
Balance
Today Income
Today Expense
```

Agent count:

```text
Dexie agents
      ↓
active agents
      ↓
count
```

Agency count:

```text
Dexie agencies
      ↓
active agencies
      ↓
count
```

This allows Dashboard to remain useful offline.

---

# 38. Reports

Reports should also use cached data when offline.

For example:

```text
Dexie transactions
       ↓
Date filter
       ↓
Income / Expense
       ↓
Agent / Agency
       ↓
Payment method
       ↓
Summary
```

When online, fresh Supabase data should update the cache.

---

# 39. No Offline Write Queue

AmarHisab currently does **not** use an offline write queue.

That means:

```text
Offline + Create transaction
        ↓
Supabase unavailable
        ↓
Write fails
        ↓
Dexie is NOT modified
```

The user should be informed that the transaction was not saved.

This is intentional because financial writes must not silently remain local.

---

# 40. Future Offline Write Queue

If offline transaction creation is needed in the future, it should be implemented as a separate architecture.

For example:

```text
Offline Write
     ↓
Pending Queue
     ↓
Internet returns
     ↓
Supabase
     ↓
Success
     ↓
Dexie
```

This must not be introduced casually into the current architecture.

---

# 41. Data Ownership

## Supabase owns:

```text
Permanent application data
Authentication
Tenant data
Financial records
Server-side truth
```

## Dexie owns:

```text
Local cached snapshot
Offline read availability
Fast local rendering
```

Dexie does not replace Supabase.

---

# 42. Source of Truth Rule

The most important rule:

> **Supabase is the source of truth. Dexie is the local cache.**

Never reverse this relationship.

---

# 43. Cache Update Rule

The second most important rule:

> **Only successfully confirmed server data should become authoritative local cache data.**

For writes:

```text
Supabase success → Dexie update
```

For failed writes:

```text
Supabase failure → Dexie unchanged
```

For successful refresh:

```text
Supabase → Dexie
```

For failed refresh:

```text
Dexie remains unchanged
```

---

# 44. Recommended Service Pattern

Every cache-aware read service should conceptually follow:

```text
getData()
   │
   ├── Read Dexie
   │
   ├── Return cached data
   │
   └── Background sync
          │
          ├── Success → update Dexie → update UI
          │
          └── Failure → keep Dexie
```

First-ever load is the exception:

```text
Dexie empty
    ↓
Supabase required
    ↓
Success → Dexie
```

---

# 45. Recommended Write Pattern

Every mutation should conceptually follow:

```text
create/update/archive
        ↓
     Supabase
        ↓
    successful?
      /     \
    yes      no
     ↓        ↓
   Dexie    Error
     ↓
    UI
```

---

# 46. Security

Dexie should never be treated as a secure storage boundary.

The browser/user can potentially inspect IndexedDB.

Therefore:

- Do not store passwords.
- Do not store Supabase service-role keys.
- Do not store secrets.
- Do not assume Dexie data is trusted.
- RLS remains the security boundary in Supabase.

---

# 47. Multi-Tenant Consideration

AmarHisab uses Supabase as the authoritative multi-user/multi-tenant backend.

Dexie must therefore only contain data available to the currently authenticated user/session.

If account/tenant switching is introduced in the future, the cache architecture must prevent data from one tenant/account being displayed to another.

Possible future approach:

```text
amarhisab
 ├── tenant A cache
 └── tenant B cache
```

or separate database/cache namespaces.

This must be considered before implementing tenant switching.

---

# 48. Cache Invalidation

Cache should be replaced/updated when:

- Supabase sync succeeds.
- A create succeeds.
- An update succeeds.
- An archive succeeds.
- A refresh succeeds.

Cache should not be invalidated merely because:

- Internet is unavailable.
- A background request fails.
- A refresh request fails.
- The user navigates between pages.

---

# 49. Current AmarHisab Flow

The intended final architecture is:

```text
                    ┌─────────────────────┐
                    │      SUPABASE       │
                    │   SOURCE OF TRUTH   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
               READ                        WRITE
                 │                           │
                 ▼                           ▼
        Background Sync                 Supabase
                 │                           │
                 ▼                        Success
              Dexie                         │
                 │                           ▼
                 ▼                        Dexie
                UI                           │
                                             ▼
                                            UI
```

---

# 50. Final Rules

## READ

```text
Dexie FIRST
Supabase BACKGROUND
```

## WRITE

```text
Supabase FIRST
Dexie AFTER SUCCESS
```

## REFRESH

```text
Supabase FIRST
Dexie AFTER SUCCESS
```

## OFFLINE READ

```text
Dexie → UI
```

## OFFLINE WRITE

```text
Fail safely
Do not write Dexie
```

## FAILED SYNC

```text
Keep existing Dexie data
```

## FAILED REFRESH

```text
Keep existing Dexie data
```

## SOURCE OF TRUTH

```text
Supabase
```

## LOCAL CACHE

```text
Dexie
```

## UI

```text
Never directly manage Dexie
```

---

# 51. Golden Rule

For AmarHisab, remember this single rule:

```text
             READ
              ↓
       Dexie → UI
              ↓
       Supabase sync
              ↓
          Dexie update


            WRITE
              ↓
          Supabase
              ↓
           Success
              ↓
           Dexie
              ↓
             UI
```

**Fast offline reads, safe server-first writes, and no data loss from failed network requests.**