import { Navigate } from "react-router-dom"

import { LoginForm } from "../components/login-form"
import { useAuth } from "../hooks/use-auth"

export function LoginPage() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
            AH
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            AmarHisab
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Travel agency finance
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Secure access to your financial workspace
        </p>
      </div>
    </main>
  )
}