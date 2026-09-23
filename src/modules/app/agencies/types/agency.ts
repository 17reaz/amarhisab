export interface Agency {
  id: string
  sl: number
  name: string
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface CreateAgencyInput {
  name: string
  phone?: string
}