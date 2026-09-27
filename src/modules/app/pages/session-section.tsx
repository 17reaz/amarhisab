import { useCallback, useEffect, useMemo, useState } from "react"
import { Clock3, Monitor, Smartphone } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  getCurrentClientSessionId,
  getSessionHistory,
  type SessionHistory,
} from "../services/settings-service"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDuration(
  loginAt: string,
  logoutAt: string | null,
  lastSeenAt: string,
) {
  const start = new Date(loginAt).getTime()

  const end = logoutAt
    ? new Date(logoutAt).getTime()
    : new Date(lastSeenAt).getTime()

  const milliseconds = Math.max(0, end - start)
  const totalMinutes = Math.floor(milliseconds / 60000)

  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) {
    return Monitor
  }

  const mobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)

  return mobile ? Smartphone : Monitor
}

function getDeviceName(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown device"
  }

  if (/iPhone/i.test(userAgent)) {
    return "iPhone"
  }

  if (/iPad/i.test(userAgent)) {
    return "iPad"
  }

  if (/Android/i.test(userAgent)) {
    return "Android device"
  }

  if (/Edg/i.test(userAgent)) {
    return "Microsoft Edge"
  }

  if (/Chrome/i.test(userAgent)) {
    return "Google Chrome"
  }

  if (/Firefox/i.test(userAgent)) {
    return "Firefox"
  }

  if (/Safari/i.test(userAgent)) {
    return "Safari"
  }

  return "Web browser"
}

export function SessionSection() {
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentSessionId = useMemo(
    () => getCurrentClientSessionId(),
    [],
  )

  const loadSessions = useCallback(async () => {
    try {
      setError(null)

      const data = await getSessionHistory()
      setSessions(data)
    } catch (err) {
      console.error("Failed to load session history:", err)
      setError("Could not load session history.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const currentSession = sessions.find(
    (session) => session.session_id === currentSessionId,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Sessions
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Loading sessions...
            </p>
          </div>
        ) : error ? (
          <div className="p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              No session history yet.
            </p>
          </div>
        ) : (
          <div>
            {currentSession ? (
              <div className="border-t bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Clock3 className="size-4 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        Current session
                      </p>

                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Active
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Started {formatDate(currentSession.login_at)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Duration{" "}
                      {formatDuration(
                        currentSession.login_at,
                        null,
                        new Date().toISOString(),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="divide-y">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(
                  session.user_agent,
                )

                const isCurrent =
                  session.session_id === currentSessionId

                return (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 p-4"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <DeviceIcon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {getDeviceName(session.user_agent)}
                        </p>

                        {isCurrent ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Current
                          </span>
                        ) : session.is_active ? (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                            Active
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Login: {formatDate(session.login_at)}
                      </p>

                      {session.logout_at ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Logout: {formatDate(session.logout_at)}
                        </p>
                      ) : !isCurrent ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Last active:{" "}
                          {formatDate(session.last_seen_at)}
                        </p>
                      ) : null}

                      <p className="mt-1 text-xs font-medium text-foreground/80">
                        Duration:{" "}
                        {formatDuration(
                          session.login_at,
                          session.logout_at,
                          session.last_seen_at,
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}