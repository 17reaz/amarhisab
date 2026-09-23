import { useEffect, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  LogOut,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signOut } from "@/modules/auth/services/auth-service"

import { AppShell } from "../components/app-shell"
import {
  getDashboardSummary,
  type DashboardSummary,
} from "../services/dashboard-service"

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
})

function formatCurrency(amount: number) {
  return currency.format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function DashboardPage() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = async (
    isRefresh = false,
  ) => {
    try {
      setError(null)

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      console.error("Failed to load dashboard:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleLogout = async () => {
    const { error: logoutError } = await signOut()

    if (logoutError) {
      console.error("Logout failed:", logoutError)
    }
  }

  return (
    <AppShell title="Dashboard">
      <div className="space-y-5">
        {/* Greeting */}
        <section>
          <p className="text-sm text-muted-foreground">
            Good morning 👋
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Financial Overview
          </h2>
        </section>

        {/* Balance */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Balance
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {loading
                    ? "Loading..."
                    : formatCurrency(
                        summary?.balance ?? 0,
                      )}
                </p>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Wallet className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income / Expense */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <ArrowDownLeft className="size-4" />
                </div>

                <span className="text-sm text-muted-foreground">
                  Income
                </span>
              </div>

              <p className="mt-3 text-lg font-semibold">
                {loading
                  ? "..."
                  : formatCurrency(summary?.income ?? 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <ArrowUpRight className="size-4" />
                </div>

                <span className="text-sm text-muted-foreground">
                  Expense
                </span>
              </div>

              <p className="mt-3 text-lg font-semibold">
                {loading
                  ? "..."
                  : formatCurrency(summary?.expense ?? 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Plus className="size-4" />
              </div>

              <span>Income</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Plus className="size-4" />
              </div>

              <span>Expense</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="size-4" />
              </div>

              <span>Accounts</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
            >
              <RefreshCw className="size-4" />

              <span>Transfer</span>
            </Button>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              Recent Transactions
            </h3>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-1 size-3.5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader className="sr-only">
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-5 text-sm text-muted-foreground">
                  Loading transactions...
                </div>
              ) : error ? (
                <div className="space-y-3 p-5">
                  <p className="text-sm text-destructive">
                    {error}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDashboard()}
                  >
                    Try again
                  </Button>
                </div>
              ) : !summary?.transactions.length ? (
                <div className="p-5 text-center">
                  <p className="text-sm font-medium">
                    No transactions yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your recent transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {summary.transactions.map(
                    (transaction) => {
                      const isIncome =
                        transaction.type === "income"

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-3 p-4"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                            {isIncome ? (
                              <ArrowDownLeft className="size-4" />
                            ) : (
                              <ArrowUpRight className="size-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {transaction.description ||
                                (isIncome
                                  ? "Income"
                                  : "Expense")}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatDate(
                                transaction.transaction_date,
                              )}
                              {transaction.payment_method
                                ? ` • ${transaction.payment_method}`
                                : ""}
                            </p>
                          </div>

                          <p
                            className={`shrink-0 text-sm font-semibold ${
                              isIncome
                                ? "text-foreground"
                                : "text-destructive"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(
                              Number(transaction.amount),
                            )}
                          </p>
                        </div>
                      )
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Temporary logout fallback */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
    </AppShell>
  )
}