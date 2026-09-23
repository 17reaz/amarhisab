import { useEffect, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  LogOut,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { signOut } from "@/modules/auth/services/auth-service"
import {
  getDashboardSummary,
  type DashboardSummary,
} from "../services/dashboard-service"

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")

      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function handleSignOut() {
    await signOut()
  }

  return (
    <main className="min-h-svh bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              AmarHisab
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadDashboard}
              disabled={loading}
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>

              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : formatAmount(summary?.balance ?? 0)}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Income minus expense
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Income
              </CardTitle>

              <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : formatAmount(summary?.income ?? 0)}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Total recorded income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expense
              </CardTitle>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : formatAmount(summary?.expense ?? 0)}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Total recorded expense
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  Loading transactions...
                </div>
              ) : summary?.transactions.length ? (
                <div className="divide-y">
                  {summary.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                          {transaction.type === "income" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {transaction.description ||
                              transaction.type}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.transaction_date)}
                            {transaction.payment_method
                              ? ` · ${transaction.payment_method}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-sm font-semibold">
                        {transaction.type === "income" ? "+" : "-"}
                        {formatAmount(Number(transaction.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-medium">
                    No transactions yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your recent transactions will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
