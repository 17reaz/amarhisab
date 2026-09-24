export type ReportType =
  | "transaction"
  | "agent"
  | "agency"

export type ReportTransactionType =
  | "all"
  | "income"
  | "expense"

export type ReportPartyType =
  | "all"
  | "agent"
  | "agency"

export type ReportPaymentMethod =
  | "all"
  | "cash"
  | "bkash"
  | "nagad"
  | "bank"
  | "other"

export interface ReportFilters {
  reportType: ReportType
  dateFrom: string
  dateTo: string
  transactionType: ReportTransactionType
  partyType: ReportPartyType
  paymentMethod: ReportPaymentMethod
  partyId: string
}

export interface ReportTransaction {
  id: string
  transaction_date: string
  type: "income" | "expense"
  amount: number
  description: string | null
  payment_method: string | null
  party_type: "agent" | "agency"
  agent_id: string | null
  agency_id: string | null
}

export interface ReportParty {
  id: string
  sl: number
  name: string
  phone: string | null
}

export interface ReportSummary {
  totalIncome: number
  totalExpense: number
  netBalance: number
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