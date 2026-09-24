import { supabase } from "@/lib/supabase"

import type { Transaction } from "../../transactions/types/transaction"

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

export async function getAgencyStatement(
  agencyId: string,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS)
    .eq("agency_id", agencyId)
    .eq("party_type", "agency")
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

  return (data ?? []) as Transaction[]
}