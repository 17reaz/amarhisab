import { useState } from "react"
import {
  LogOut,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { signOut } from "@/modules/auth/services/auth-service"

import { AppShell } from "../components/app-shell"

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] =
    useState<string | null>(null)

  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : ""

  const phone =
    typeof user?.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : ""

  const displayName =
    fullName ||
    user?.email?.split("@")[0] ||
    "User"

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  const handleLogout = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      const { error } = await signOut()

      if (error) {
        throw error
      }

      navigate("/login", { replace: true })
    } catch (err) {
      console.error("Logout failed:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to logout.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Profile">
      <div className="space-y-5">
        <section className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {initials || "AH"}
          </div>

          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            {displayName}
          </h2>

          {user?.email ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {user.email}
            </p>
          ) : null}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Account Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <UserRound className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Name
                </p>

                <p className="mt-1 text-sm font-medium">
                  {fullName || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {user?.email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Phone className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium">
                  {phone || "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <p className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Card>
          <CardContent className="p-4">
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => void handleLogout()}
              disabled={loading}
            >
              <LogOut className="mr-2 size-4" />

              {loading
                ? "Logging out..."
                : "Logout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}