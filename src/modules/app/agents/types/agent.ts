export interface Agent {
  id: string
  sl: number
  name: string
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface CreateAgentInput {
  name: string
  phone?: string
}