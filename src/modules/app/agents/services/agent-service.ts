import { supabase } from "@/lib/supabase"

import type {
  Agent,
  CreateAgentInput,
} from "../types/agent"

const AGENT_COLUMNS =
  "id, sl, name, phone, is_active, created_at"

export async function getAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select(AGENT_COLUMNS)
    .order("sl", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Agent[]
}

export async function createAgent(
  input: CreateAgentInput,
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .insert({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    })
    .select(AGENT_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as Agent
}

export async function updateAgent(
  id: string,
  input: CreateAgentInput,
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .update({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    })
    .eq("id", id)
    .select(AGENT_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as Agent
}

export async function setAgentActive(
  id: string,
  isActive: boolean,
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .update({
      is_active: isActive,
    })
    .eq("id", id)
    .select(AGENT_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as Agent
}