import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import { DashboardPage } from "@/modules/app/pages/dashboard-page"
import { LoginPage } from "@/modules/auth/pages/login-page"
import { useAuth } from "@/modules/auth/hooks/use-auth"

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
      <Route path="/app" element={<DashboardPage />} />

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
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/*"
          element={<ProtectedRoutes />}
        />
      </Routes>
    </BrowserRouter>
  )
}