import { db } from "@/lib/db"

import { syncAll } from "@/lib/cache/sync"

import type { Party } from "../types/party"

export async function getParties(): Promise<Party[]> {
  const [
    agents,
    agencies,
    transactions,
  ] = await Promise.all([
    db.agents
      .filter((agent) => agent.is_active)
      .toArray(),

    db.agencies
      .filter((agency) => agency.is_active)
      .toArray(),

    db.transactions
      .filter(
        (transaction) => transaction.is_active,
      )
      .toArray(),
  ])

  const latestTransactions = new Map<
    string,
    string
  >()

  const transactionCounts = new Map<
    string,
    number
  >()

  const sortedTransactions = transactions.sort(
    (a, b) => {
      return (
        b.transaction_date.localeCompare(
          a.transaction_date,
        ) ||
        b.created_at.localeCompare(
          a.created_at,
        )
      )
    },
  )

  for (const transaction of sortedTransactions) {
    const partyId =
      transaction.party_type === "agent"
        ? transaction.agent_id
        : transaction.agency_id

    if (!partyId) {
      continue
    }

    const key =
      `${transaction.party_type}:${partyId}`

    // Transaction count
    transactionCounts.set(
      key,
      (transactionCounts.get(key) ?? 0) + 1,
    )

    // Latest transaction date
    if (!latestTransactions.has(key)) {
      latestTransactions.set(
        key,
        transaction.transaction_date,
      )
    }
  }

  const parties: Party[] = [
    ...agents.map((agent) => {
      const key = `agent:${agent.id}`

      return {
        key,
        id: agent.id,
        type: "agent" as const,
        name: agent.name,
        phone: agent.phone,
        lastTransactionDate:
          latestTransactions.get(key) ?? null,
        transactionCount:
          transactionCounts.get(key) ?? 0,
      }
    }),

    ...agencies.map((agency) => {
      const key = `agency:${agency.id}`

      return {
        key,
        id: agency.id,
        type: "agency" as const,
        name: agency.name,
        phone: agency.phone,
        lastTransactionDate:
          latestTransactions.get(key) ?? null,
        transactionCount:
          transactionCounts.get(key) ?? 0,
      }
    }),
  ]

  return parties.sort((a, b) => {
    // Both have no transactions
    if (
      !a.lastTransactionDate &&
      !b.lastTransactionDate
    ) {
      return a.name.localeCompare(b.name)
    }

    // No transaction goes last
    if (!a.lastTransactionDate) {
      return 1
    }

    if (!b.lastTransactionDate) {
      return -1
    }

    // Latest transaction first
    return (
      b.lastTransactionDate.localeCompare(
        a.lastTransactionDate,
      ) ||
      a.name.localeCompare(b.name)
    )
  })
}

export async function syncParties(): Promise<Party[]> {
  await syncAll()

  return getParties()
}