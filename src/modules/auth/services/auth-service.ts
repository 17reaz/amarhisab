import { db } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { clearCurrentClientSessionId, endCurrentSession } from "@/modules/app/services/settings-service"

export async function signIn(
  email: string,
  password: string,
) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  try {
    await endCurrentSession()
  } catch (error) {
    console.error("Failed to record session logout:", error)
  }

  const result = await supabase.auth.signOut({
    scope: "local",
  })

  await Promise.all([
    db.agents.clear(),
    db.agencies.clear(),
    db.transactions.clear(),
  ])

  clearCurrentClientSessionId()

  return result
}

export async function getSession() {
  return supabase.auth.getSession()
}