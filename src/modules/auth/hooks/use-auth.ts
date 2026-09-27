import { useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"
import {
  startSessionTracking,
  touchCurrentSession,
} from "@/modules/app/services/settings-service"

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let trackingStarted = false

    const startTracking = async () => {
      if (trackingStarted) {
        return
      }

      trackingStarted = true

      try {
        await startSessionTracking()
      } catch (error) {
        console.error(
          "Failed to start session tracking:",
          error,
        )
      }
    }

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (error) {
        console.error("Failed to load auth session:", error)
        setSession(null)
      } else {
        setSession(data.session)

        if (data.session) {
          void startTracking()
        }
      }

      setLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!mounted) {
          return
        }

        setSession(nextSession)
        setLoading(false)

        if (
          nextSession &&
          (event === "SIGNED_IN" ||
            event === "INITIAL_SESSION" ||
            event === "TOKEN_REFRESHED")
        ) {
          void startTracking()
        }
      },
    )

    const interval = window.setInterval(() => {
      if (!mounted) {
        return
      }

      if (document.visibilityState === "visible") {
        void touchCurrentSession()
      }
    }, 5 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        mounted
      ) {
        void touchCurrentSession()
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.clearInterval(interval)

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      )
    }
  }, [])

  return {
    session,
    user: session?.user as User | null,
    loading,
    isAuthenticated: Boolean(session),
  }
}