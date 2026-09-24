import { supabase } from "@/lib/supabase"
import { db } from "@/lib/db"

import type { Agent } from "@/modules/app/agents/types/agent"
import type { Agency } from "@/modules/app/agencies/types/agency"
import type { Transaction } from "@/modules/app/transactions/types/transaction"

const AGENT_COLUMNS =
  "id, sl, name, phone, is_active, created_at"

const AGENCY_COLUMNS =
  "id, sl, name, phone, is_active, created_at"

const TRANSACTION_COLUMNS = `
  id,
  transaction_group_id,
  root_transaction_id,
  version_number,
  is_active,
  replaced_transaction_id,
  type,
  amount,
  transaction_date,
  description,
  payment_method,
  reference_no,
  party_type,
  agent_id,
  agency_id,
  created_at
`

export async function syncAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select(AGENT_COLUMNS)
    .order("sl", { ascending: true })

  if (error) {
    throw error
  }

  const agents = (data ?? []) as Agent[]

  await db.agents.clear()

  if (agents.length > 0) {
    await db.agents.bulkPut(agents)
  }

  return agents
}

export async function syncAgencies(): Promise<Agency[]> {
  const { data, error } = await supabase
    .from("agencies")
    .select(AGENCY_COLUMNS)
    .order("sl", { ascending: true })

  if (error) {
    throw error
  }

  const agencies = (data ?? []) as Agency[]

  await db.agencies.clear()

  if (agencies.length > 0) {
    await db.agencies.bulkPut(agencies)
  }

  return agencies
}

export async function syncTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS)
    .order("transaction_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    throw error
  }

  const transactions =
    (data ?? []) as Transaction[]

  await db.transactions.clear()

  if (transactions.length > 0) {
    await db.transactions.bulkPut(transactions)
  }

  return transactions
}

export async function syncAll(): Promise<void> {
  await Promise.all([
    syncAgents(),
    syncAgencies(),
    syncTransactions(),
  ])
}