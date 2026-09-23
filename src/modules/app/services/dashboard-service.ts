import { supabase } from "@/lib/supabase"

export interface DashboardTransaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string | null
  transaction_date: string
  payment_method: string | null
}

export interface DashboardSummary {
  income: number
  expense: number
  balance: number
  transactions: DashboardTransaction[]
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, description, transaction_date, payment_method",
    )
    .eq("is_active", true)
    .order("transaction_date", { ascending: false })

  if (error) {
    throw error
  }

  const transactions = (data ?? []) as DashboardTransaction[]

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    )

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    )

  return {
    income,
    expense,
    balance: income - expense,
    transactions: transactions.slice(0, 5),
  }
}
