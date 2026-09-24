import { useEffect } from "react"

import { syncAll } from "@/lib/cache/sync"

export function useAppSync() {
  useEffect(() => {
    let cancelled = false

    const runSync = async () => {
      if (cancelled) return

      try {
        await syncAll()
      } catch (error) {
        console.warn(
          "Background Supabase sync failed.",
          error,
        )
      }
    }

    void runSync()

    return () => {
      cancelled = true
    }
  }, [])
}