import { supabase } from "@/lib/supabase"

import type {
  ReportFilters,
  ReportTransaction,
  ReportSummary,
  ReportParty,
} from "../types/report"

const TRANSACTION_COLUMNS = `
  id,
  transaction_date,
  type,
  amount,
  description,
  payment_method,
  party_type,
  agent_id,
  agency_id
`

export async function getReportTransactions(
  filters: ReportFilters,
): Promise<ReportTransaction[]> {
  let query = supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS)
    .eq("is_active", true)
    .gte("transaction_date", filters.dateFrom)
    .lte("transaction_date", filters.dateTo)
    .order("transaction_date", {
      ascending: true,
    })
    .order("id", {
      ascending: true,
    })

  if (filters.transactionType !== "all") {
    query = query.eq(
      "type",
      filters.transactionType,
    )
  }

  if (filters.partyType !== "all") {
    query = query.eq(
      "party_type",
      filters.partyType,
    )
  }

  if (filters.paymentMethod !== "all") {
    query = query.eq(
      "payment_method",
      filters.paymentMethod,
    )
  }

  if (filters.partyId) {
    if (filters.partyType === "agent") {
      query = query.eq(
        "agent_id",
        filters.partyId,
      )
    }

    if (filters.partyType === "agency") {
      query = query.eq(
        "agency_id",
        filters.partyId,
      )
    }
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []) as ReportTransaction[]
}

export function calculateReportSummary(
  transactions: ReportTransaction[],
): ReportSummary {
  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "income",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    )

  const totalExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    )

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  }
}
export async function getReportParty(
  filters: ReportFilters,
): Promise<ReportParty | null> {
  if (!filters.partyId) {
    return null
  }

  if (filters.partyType === "agent") {
    const { data, error } = await supabase
      .from("agents")
      .select("id, sl, name, phone")
      .eq("id", filters.partyId)
      .single()

    if (error) {
      throw error
    }

    return data as ReportParty
  }

  if (filters.partyType === "agency") {
    const { data, error } = await supabase
      .from("agencies")
      .select("id, sl, name, phone")
      .eq("id", filters.partyId)
      .single()

    if (error) {
      throw error
    }

    return data as ReportParty
  }

  return null
}