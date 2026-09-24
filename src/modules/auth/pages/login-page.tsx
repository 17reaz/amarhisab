import { Navigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { LoginForm } from "../components/login-form"
import { useAuth } from "../hooks/use-auth"

export function LoginPage() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-muted/30 px-5">
        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-5 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              AH
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-tight">
                AmarHisab
              </CardTitle>

              <CardDescription>
                Travel agency finance
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <LoginForm />

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Secure access to your financial workspace
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AmarHisab
        </p>
      </div>
    </main>
  )
}