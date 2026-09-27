import { useEffect, useState } from "react"
import { LogOut, Monitor } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Session } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { signOut } from "@/modules/auth/services/auth-service"
import { getCurrentSession } from "../services/settings-service"

export function SessionSection() {
  const navigate = useNavigate()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      try {
        const currentSession = await getCurrentSession()

        if (mounted) {
          setSession(currentSession)
        }
      } catch (error) {
        console.error("Failed to load session:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)

    try {
      const { error } = await signOut()

      if (error) {
        console.error("Sign out failed:", error)
        return
      }

      navigate("/login", { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  const email = session?.user.email ?? "Unknown account"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Session</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Monitor className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Current session</p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {loading ? "Checking session..." : email}
            </p>
          </div>

          {!loading && session && (
            <span className="text-xs font-medium text-green-600">
              Active
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading || signingOut || !session}
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" />
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>
      </CardContent>
    </Card>
  )
}