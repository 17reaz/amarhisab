import { db } from "@/lib/db"
import { supabase } from "@/lib/supabase"

import type {
  CreateTransactionInput,
  Transaction,
} from "../types/transaction"

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

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(TRANSACTION_COLUMNS)
      .eq("is_active", true)
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
  } catch (error) {
    const cachedTransactions = (
      await db.transactions.toArray()
    )
      .filter(
        (transaction) => transaction.is_active,
      )
      .sort((a, b) => {
        return (
          b.transaction_date.localeCompare(
            a.transaction_date,
          ) ||
          b.created_at.localeCompare(
            a.created_at,
          )
        )
      })

    if (cachedTransactions.length > 0) {
      console.warn(
        "Supabase unavailable. Using cached transactions.",
        error,
      )

      return cachedTransactions
    }

    throw error
  }
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: input.type,
      amount: input.amount,
      transaction_date: input.transaction_date,
      description:
        input.description?.trim() || null,
      payment_method: input.payment_method,
      reference_no:
        input.reference_no?.trim() || null,

      party_type: input.party_type,

      agent_id:
        input.party_type === "agent"
          ? input.agent_id || null
          : null,

      agency_id:
        input.party_type === "agency"
          ? input.agency_id || null
          : null,
    })
    .select(TRANSACTION_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  const transaction = data as Transaction

  await db.transactions.put(transaction)

  return transaction
}

export async function updateTransaction(
  id: string,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      type: input.type,
      amount: input.amount,
      transaction_date: input.transaction_date,
      description:
        input.description?.trim() || null,
      payment_method: input.payment_method,
      reference_no:
        input.reference_no?.trim() || null,

      party_type: input.party_type,

      agent_id:
        input.party_type === "agent"
          ? input.agent_id || null
          : null,

      agency_id:
        input.party_type === "agency"
          ? input.agency_id || null
          : null,
    })
    .eq("id", id)
    .select(TRANSACTION_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  const transaction = data as Transaction

  await db.transactions.put(transaction)

  return transaction
}

export async function archiveTransaction(
  id: string,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      is_active: false,
    })
    .eq("id", id)
    .select(TRANSACTION_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  const transaction = data as Transaction

  await db.transactions.put(transaction)

  return transaction
}