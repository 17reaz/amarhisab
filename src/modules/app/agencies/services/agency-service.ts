import { supabase } from "@/lib/supabase"

import type {
  Agency,
  CreateAgencyInput,
} from "../types/agency"

const AGENCY_COLUMNS =
  "id, sl, name, phone, is_active, created_at"

export async function getAgencies(): Promise<Agency[]> {
  const { data, error } = await supabase
    .from("agencies")
    .select(AGENCY_COLUMNS)
    .order("sl", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Agency[]
}

export async function createAgency(
  input: CreateAgencyInput,
): Promise<Agency> {
  const { data, error } = await supabase
    .from("agencies")
    .insert({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    })
    .select(AGENCY_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as Agency
}

export async function updateAgency(
  id: string,
  input: CreateAgencyInput,
): Promise<Agency> {
  const { data, error } = await supabase
    .from("agencies")
    .update({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    })
    .eq("id", id)
    .select(AGENCY_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as Agency
}

export async function setAgencyActive(
  id: string,
  isActive: boolean,
): Promise<Agency> {
  const { data, error } = await supabase
    .from("agencies")
    .update({
      is_active: isActive,
    })
    .eq("id", id)
    .select(AGENCY_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as Agency
}
export async function getAgencyBalance(
  agencyId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("agency_id", agencyId)
    .eq("party_type", "agency")
    .eq("is_active", true)

  if (error) {
    throw error
  }

  return (data ?? []).reduce(
    (balance, transaction) => {
      const amount = Number(transaction.amount)

      return transaction.type === "income"
        ? balance + amount
        : balance - amount
    },
    0,
  )
}