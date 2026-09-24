import { supabase } from "@/lib/supabase"
import { db } from "@/lib/db"
export async function signIn(
  email: string,
  password: string,
) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// export async function signOut() {
//   return supabase.auth.signOut({
//     scope: "local",
//   })
// }

export async function signOut() {
  const result = await supabase.auth.signOut({ scope: "local" })

  await Promise.all([
    db.agents.clear(),
    db.agencies.clear(),
    db.transactions.clear(),
  ])

  return result
}
export async function getSession() {
  return supabase.auth.getSession()
}
