export type PartyType = "agent" | "agency"

export interface Party {
  key: string
  id: string
  type: PartyType
  name: string
  phone: string | null
  lastTransactionDate: string | null
  transactionCount: number
}