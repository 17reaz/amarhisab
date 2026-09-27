import { supabase } from "@/lib/supabase"

const SESSION_STORAGE_KEY = "amarhisab-session-id"

export interface SessionHistory {
  id: string
  user_id: string
  session_id: string
  login_at: string
  logout_at: string | null
  last_seen_at: string
  user_agent: string | null
  is_active: boolean
  created_at: string
}

function getClientSessionId() {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (existing) {
    return existing
  }

  const sessionId = crypto.randomUUID()
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)

  return sessionId
}

export function getCurrentClientSessionId() {
  return getClientSessionId()
}

export function clearCurrentClientSessionId() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function startSessionTracking() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const sessionId = getClientSessionId()

  const { data: existing } = await supabase
    .from("session_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("session_history")
      .update({
        last_seen_at: new Date().toISOString(),
        is_active: true,
        logout_at: null,
      })
      .eq("id", existing.id)

    return sessionId
  }

  const { error } = await supabase
    .from("session_history")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      login_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      is_active: true,
    })

  if (error) {
    console.error("Failed to start session tracking:", error)
    return null
  }

  return sessionId
}

export async function touchCurrentSession() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const sessionId = getClientSessionId()

  const { error } = await supabase
    .from("session_history")
    .update({
      last_seen_at: new Date().toISOString(),
      is_active: true,
    })
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .eq("is_active", true)

  if (error) {
    console.error("Failed to update session activity:", error)
  }
}

export async function endCurrentSession() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const sessionId = getClientSessionId()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from("session_history")
    .update({
      logout_at: now,
      last_seen_at: now,
      is_active: false,
    })
    .eq("user_id", user.id)
    .eq("session_id", sessionId)

  if (error) {
    console.error("Failed to end session:", error)
  }
}

export async function getSessionHistory(limit = 50) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("session_history")
    .select("*")
    .eq("user_id", user.id)
    .order("login_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []) as SessionHistory[]
}