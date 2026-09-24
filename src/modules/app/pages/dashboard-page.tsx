// src/modules/app/pages/dashboard-page.tsx

import { useEffect, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Plus,
  RefreshCw,
  Receipt,
  Users,
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

function formatPaymentMethod(
  method: string | null,
) {
  if (!method) return ""

  return method.charAt(0).toUpperCase() + method.slice(1)
}

export function DashboardPage() {
  const navigate = useNavigate()

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

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
      console.error(
        "Failed to load dashboard:",
        err,
      )

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

  return (
    <AppShell title="Dashboard">
      <div className="space-y-5">
 
        {/* Error */}
        {error ? (
          <Card>
            <CardContent className="space-y-3 p-5">
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
            </CardContent>
          </Card>
        ) : null}

        {/* Income / Expense */}
        <div className="grid grid-cols-2 gap-3">
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <ArrowDownLeft className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground">Income</span>

        <p className="truncate text-base font-semibold">
          {loading ? "..." : formatCurrency(summary?.income ?? 0)}
        </p>

        {!loading ? (
          <p className="truncate text-xs text-muted-foreground">
            Today {formatCurrency(summary?.todayIncome ?? 0)}
          </p>
        ) : null}
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <ArrowUpRight className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground">Expense</span>

        <p className="truncate text-base font-semibold">
          {loading ? "..." : formatCurrency(summary?.expense ?? 0)}
        </p>

        {!loading ? (
          <p className="truncate text-xs text-muted-foreground">
            Today {formatCurrency(summary?.todayExpense ?? 0)}
          </p>
        ) : null}
      </div>
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
              onClick={() =>
                navigate("/app/transactions")
              }
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Plus className="size-4" />
              </div>

              <span>Income</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
              onClick={() =>
                navigate("/app/transactions")
              }
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Plus className="size-4" />
              </div>

              <span>Expense</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
              onClick={() =>
                navigate("/app/transactions")
              }
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Receipt className="size-4" />
              </div>

              <span>Transactions</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
              onClick={() =>
                navigate("/app/agents")
              }
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Users className="size-4" />
              </div>

              <span>Agents</span>
            </Button>
          </div>
        </section>

        {/* People summary */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/app/agents")
            }
            className="text-left"
          >
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Users className="size-4" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Agents
                  </p>

                  <p className="text-lg font-semibold">
                    {loading
                      ? "..."
                      : summary?.agentCount ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/app/agencies")
            }
            className="text-left"
          >
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="size-4" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Agencies
                  </p>

                  <p className="text-lg font-semibold">
                    {loading
                      ? "..."
                      : summary?.agencyCount ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        </div>

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
              onClick={() =>
                navigate("/app/transactions")
              }
            >
              View all
            </Button>
          </div>

          <Card>
            <CardHeader className="sr-only">
              <CardTitle>
                Recent Transactions
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-5 text-sm text-muted-foreground">
                  Loading transactions...
                </div>
              ) : !summary?.transactions.length ? (
                <div className="p-5 text-center">
                  <p className="text-sm font-medium">
                    No transactions yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first transaction to
                    see it here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {summary.transactions.map(
                    (transaction) => {
                      const isIncome =
                        transaction.type ===
                        "income"

                      return (
                        <button
                          type="button"
                          key={transaction.id}
                          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                          onClick={() =>
                            navigate(
                              "/app/transactions",
                            )
                          }
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
                                ? ` • ${formatPaymentMethod(
                                    transaction.payment_method,
                                  )}`
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
                              Number(
                                transaction.amount,
                              ),
                            )}
                          </p>
                        </button>
                      )
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Refresh */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Dashboard"}
        </Button>
      </div>
    </AppShell>
  )
}