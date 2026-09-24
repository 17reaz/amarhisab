import { supabase } from "@/lib/supabase"

import type { Party } from "../types/party"

interface PartyTransaction {
  party_type: "agent" | "agency"
  agent_id: string | null
  agency_id: string | null
  transaction_date: string
  created_at: string
}

interface PartyRow {
  id: string
  name: string
  phone: string | null
}

export async function getParties(): Promise<Party[]> {
  const [
    agentsResult,
    agenciesResult,
    transactionsResult,
  ] = await Promise.all([
    supabase
      .from("agents")
      .select("id, name, phone")
      .eq("is_active", true),

    supabase
      .from("agencies")
      .select("id, name, phone")
      .eq("is_active", true),

    supabase
      .from("transactions")
      .select(
        `
          party_type,
          agent_id,
          agency_id,
          transaction_date,
          created_at
        `,
      )
      .eq("is_active", true)
      .order("transaction_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      }),
  ])

  if (agentsResult.error) {
    throw agentsResult.error
  }

  if (agenciesResult.error) {
    throw agenciesResult.error
  }

  if (transactionsResult.error) {
    throw transactionsResult.error
  }

  const latestTransactions = new Map<
    string,
    string
  >()

  const transactions =
    (transactionsResult.data ??
      []) as PartyTransaction[]

  for (const transaction of transactions) {
    const partyId =
      transaction.party_type === "agent"
        ? transaction.agent_id
        : transaction.agency_id

    if (!partyId) {
      continue
    }

    const key =
      `${transaction.party_type}:${partyId}`

    if (latestTransactions.has(key)) {
      continue
    }

    latestTransactions.set(
      key,
      transaction.transaction_date,
    )
  }

  const agents =
    (agentsResult.data ?? []) as PartyRow[]

  const agencies =
    (agenciesResult.data ?? []) as PartyRow[]

  const parties: Party[] = [
    ...agents.map((agent) => ({
      key: `agent:${agent.id}`,
      id: agent.id,
      type: "agent" as const,
      name: agent.name,
      phone: agent.phone,
      lastTransactionDate:
        latestTransactions.get(
          `agent:${agent.id}`,
        ) ?? null,
    })),

    ...agencies.map((agency) => ({
      key: `agency:${agency.id}`,
      id: agency.id,
      type: "agency" as const,
      name: agency.name,
      phone: agency.phone,
      lastTransactionDate:
        latestTransactions.get(
          `agency:${agency.id}`,
        ) ?? null,
    })),
  ]

  return parties.sort((a, b) => {
    // যাদের transaction নেই তারা শেষে যাবে
    if (
      !a.lastTransactionDate &&
      !b.lastTransactionDate
    ) {
      return a.name.localeCompare(b.name)
    }

    if (!a.lastTransactionDate) {
      return 1
    }

    if (!b.lastTransactionDate) {
      return -1
    }

    // Latest transaction আগে
    return (
      b.lastTransactionDate.localeCompare(
        a.lastTransactionDate,
      ) ||
      a.name.localeCompare(b.name)
    )
  })
}