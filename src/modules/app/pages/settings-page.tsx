import {
  Bell,
  ChevronRight,
  Info,
  Moon,
  Shield,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { AppShell } from "../components/app-shell"

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <AppShell title="Settings">
      <div className="space-y-5">
        {/* Account */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Account
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <button
              type="button"
              onClick={() =>
                navigate("/app/profile")
              }
              className="flex w-full items-center gap-3 border-t p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Shield className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Profile
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Manage your account information
                </p>
              </div>

              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Preferences */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Preferences
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex items-center gap-3 border-t p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Moon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Appearance
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Theme preferences
                </p>
              </div>

              <span className="text-xs text-muted-foreground">
                System
              </span>
            </div>

            <div className="flex items-center gap-3 border-t p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Bell className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Notifications
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Notification preferences
                </p>
              </div>

              <span className="text-xs text-muted-foreground">
                Default
              </span>
            </div>
          </CardContent>
        </Card>

        {/* About */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              About
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex items-center gap-3 border-t p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Info className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  AmarHisab
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Travel agency finance
                </p>
              </div>

              <span className="text-xs text-muted-foreground">
                v1.0
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            navigate("/app/profile")
          }
        >
          Manage Profile
        </Button>
      </div>
    </AppShell>
  )
}