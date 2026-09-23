// src/modules/app/services/dashboard-service.ts

import { supabase } from "@/lib/supabase"

export interface DashboardTransaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string | null
  transaction_date: string
  payment_method: string | null
  party_type: "agent" | "agency"
  agent_id: string | null
  agency_id: string | null
}

export interface DashboardSummary {
  income: number
  expense: number
  balance: number

  todayIncome: number
  todayExpense: number

  agentCount: number
  agencyCount: number

  transactions: DashboardTransaction[]
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const today = new Date().toISOString().slice(0, 10)

  const [
    transactionsResult,
    agentsResult,
    agenciesResult,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        `
          id,
          type,
          amount,
          description,
          transaction_date,
          payment_method,
          party_type,
          agent_id,
          agency_id
        `,
      )
      .eq("is_active", true)
      .order("transaction_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("agents")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("is_active", true),

    supabase
      .from("agencies")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("is_active", true),
  ])

  if (transactionsResult.error) {
    throw transactionsResult.error
  }

  if (agentsResult.error) {
    throw agentsResult.error
  }

  if (agenciesResult.error) {
    throw agenciesResult.error
  }

  const transactions =
    (transactionsResult.data ??
      []) as DashboardTransaction[]

  const income = transactions
    .filter(
      (transaction) =>
        transaction.type === "income",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    )

  const expense = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    )

  const todayTransactions = transactions.filter(
    (transaction) =>
      transaction.transaction_date === today,
  )

  const todayIncome = todayTransactions
    .filter(
      (transaction) =>
        transaction.type === "income",
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    )

  const todayExpense = todayTransactions
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
    income,
    expense,
    balance: income - expense,

    todayIncome,
    todayExpense,

    agentCount: agentsResult.count ?? 0,
    agencyCount: agenciesResult.count ?? 0,

    transactions: transactions.slice(0, 5),
  }
}