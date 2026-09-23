import { DashboardPage } from "@/modules/app/pages/dashboard-page"
import { LoginPage } from "@/modules/auth/pages/login-page"
import { useAuth } from "@/modules/auth/hooks/use-auth"

function App() {
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
    return <LoginPage />
  }

  return <DashboardPage />
}

export default App
