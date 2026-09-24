import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import { DashboardPage } from "@/modules/app/pages/dashboard-page"
import { AgentsPage } from "@/modules/app/agents/pages/agents-page"
import { AgenciesPage } from "@/modules/app/agencies/pages/agencies-page"
import { TransactionsPage } from "@/modules/app/transactions/pages/transactions-page"
import { LoginPage } from "@/modules/auth/pages/login-page"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { ReportsPage } from "@/modules/app/reports/pages/reports-page"
function ProtectedRoutes() {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route
        path="/app"
        element={<DashboardPage />}
      />

      <Route
        path="/app/agents"
        element={<AgentsPage />}
      />

      <Route
  path="/app/agencies"
  element={<AgenciesPage />}
/>

<Route
  path="/app/transactions"
  element={<TransactionsPage />}
/>
<Route
  path="/app/reports"
  element={<ReportsPage />}
/>

<Route
  path="*"
  element={<Navigate to="/app" replace />}
/>
    </Routes>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/*"
          element={<ProtectedRoutes />}
        />
      </Routes>
    </BrowserRouter>
  )
}