import { db } from "@/lib/db"
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

function buildDashboardSummary(
  transactions: DashboardTransaction[],
  agentCount: number,
  agencyCount: number,
): DashboardSummary {
  const today = new Date()
    .toISOString()
    .slice(0, 10)

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
    agentCount,
    agencyCount,
    transactions: transactions.slice(0, 5),
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const cachedTransactions =
    await db.transactions
      .filter(
        (transaction) =>
          transaction.is_active,
      )
      .toArray()

  const cachedAgents =
    await db.agents
      .filter(
        (agent) => agent.is_active,
      )
      .toArray()

  const cachedAgencies =
    await db.agencies
      .filter(
        (agency) => agency.is_active,
      )
      .toArray()

  try {
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

    return buildDashboardSummary(
      transactions,
      agentsResult.count ?? 0,
      agenciesResult.count ?? 0,
    )
  } catch (error) {
    if (
      cachedTransactions.length === 0 &&
      cachedAgents.length === 0 &&
      cachedAgencies.length === 0
    ) {
      throw error
    }

    console.warn(
      "Supabase unavailable. Using cached dashboard data.",
      error,
    )

    const transactions =
      cachedTransactions
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
        .map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description:
            transaction.description,
          transaction_date:
            transaction.transaction_date,
          payment_method:
            transaction.payment_method,
          party_type:
            transaction.party_type,
          agent_id: transaction.agent_id,
          agency_id: transaction.agency_id,
        }))

    return buildDashboardSummary(
      transactions,
      cachedAgents.length,
      cachedAgencies.length,
    )
  }
}