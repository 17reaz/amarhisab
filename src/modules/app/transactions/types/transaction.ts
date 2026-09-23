export type TransactionType =
  | "income"
  | "expense"

export type PaymentMethod =
  | "cash"
  | "bkash"
  | "nagad"
  | "bank"
  | "other"

export type PartyType =
  | "agent"
  | "agency"

export interface Transaction {
  id: string
  transaction_group_id: string | null
  root_transaction_id: string | null
  version_number: number
  is_active: boolean
  replaced_transaction_id: string | null

  type: TransactionType
  amount: number
  transaction_date: string
  description: string | null
  payment_method: PaymentMethod
  reference_no: string | null

  party_type: PartyType
  agent_id: string | null
  agency_id: string | null

  created_at: string
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  transaction_date: string
  description?: string
  payment_method: PaymentMethod
  reference_no?: string
  party_type: PartyType
  agent_id?: string | null
  agency_id?: string | null
}