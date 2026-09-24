import { useEffect, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  ChevronRight,
  CircleAlert,
  Plus,
  Receipt,
  RefreshCw,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { AppShell } from "../components/app-shell"
import { QuickTransactionDialog } from "../transactions/components/quick-transaction-dialog"
import type { Agent } from "../agents/types/agent"
import type { Agency } from "../agencies/types/agency"
import { getAgents } from "../agents/services/agent-service"
import { getAgencies } from "../agencies/services/agency-service"
import type {
  Transaction,
  TransactionType,
} from "../transactions/types/transaction"
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

function formatPaymentMethod(method: string | null) {
  if (!method) return ""

  return method.charAt(0).toUpperCase() + method.slice(1)
}

export function DashboardPage() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  const [agents, setAgents] = useState<Agent[]>([])

  const [agencies, setAgencies] = useState<Agency[]>([])

  const [quickTransactionOpen, setQuickTransactionOpen] = useState(false)

  const [quickTransactionType, setQuickTransactionType] =
    useState<TransactionType>("income")

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const openQuickTransaction = (type: TransactionType) => {
    setQuickTransactionType(type)
    setQuickTransactionOpen(true)
  }

  const handleQuickTransactionSaved = (_transaction: Transaction) => {
    void loadDashboard(true)
  }

  const loadDashboard = async (isRefresh = false) => {
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
        err instanceof Error ? err.message : "Failed to load dashboard",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()

    const loadParties = async () => {
      try {
        const [agentData, agencyData] = await Promise.all([
          getAgents(),
          getAgencies(),
        ])

        setAgents(agentData)
        setAgencies(agencyData)
      } catch (err) {
        console.error("Failed to load parties:", err)
      }
    }

    void loadParties()
  }, [])

  const income = summary?.income ?? 0
  const expense = summary?.expense ?? 0
  const balance = income - expense

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Error */}
        {error ? (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>Could not load dashboard</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDashboard()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Balance hero */}
        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription className="text-primary-foreground/70">
                Net balance
              </CardDescription>

              {loading ? (
                <Skeleton className="h-9 w-40 bg-primary-foreground/20" />
              ) : (
                <CardTitle className="text-3xl font-bold tracking-tight">
                  {formatCurrency(balance)}
                </CardTitle>
              )}
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="size-9 shrink-0 rounded-full"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={() => openQuickTransaction("income")}
              className="rounded-xl bg-primary-foreground/10 p-3 text-left transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
            >
              <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/15">
                  <ArrowDownLeft className="size-3.5" />
                </span>
                Income
              </div>

              {loading ? (
                <Skeleton className="mt-2 h-5 w-24 bg-primary-foreground/20" />
              ) : (
                <p className="mt-2 truncate text-base font-semibold">
                  {formatCurrency(income)}
                </p>
              )}

              {!loading ? (
                <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                  Today {formatCurrency(summary?.todayIncome ?? 0)}
                </p>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => openQuickTransaction("expense")}
              className="rounded-xl bg-primary-foreground/10 p-3 text-left transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
            >
              <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/15">
                  <ArrowUpRight className="size-3.5" />
                </span>
                Expense
              </div>

              {loading ? (
                <Skeleton className="mt-2 h-5 w-24 bg-primary-foreground/20" />
              ) : (
                <p className="mt-2 truncate text-base font-semibold">
                  {formatCurrency(expense)}
                </p>
              )}

              {!loading ? (
                <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                  Today {formatCurrency(summary?.todayExpense ?? 0)}
                </p>
              ) : null}
            </button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Quick actions</h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-12 justify-start gap-2"
              onClick={() => openQuickTransaction("income")}
            >
              <Plus className="size-4" />
              Add income
            </Button>

            <Button
              variant="secondary"
              className="h-12 justify-start gap-2"
              onClick={() => openQuickTransaction("expense")}
            >
              <Plus className="size-4" />
              Add expense
            </Button>

            <Button
              variant="outline"
              className="h-12 justify-start gap-2"
              onClick={() => navigate("/app/transactions")}
            >
              <Receipt className="size-4" />
              Transactions
            </Button>

            <Button
              variant="outline"
              className="h-12 justify-start gap-2"
              onClick={() => navigate("/app/agents")}
            >
              <Users className="size-4" />
              Agents
            </Button>
          </div>
        </section>

        {/* People summary */}
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate("/app/agents")}
            className="rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Users className="size-4" />
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>

                <div>
                  {loading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-semibold leading-none">
                      {summary?.agentCount ?? 0}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Active agents
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => navigate("/app/agencies")}
            className="rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="size-4" />
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>

                <div>
                  {loading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-semibold leading-none">
                      {summary?.agencyCount ?? 0}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Active agencies
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        </section>

        {/* Recent Transactions */}
        <section>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Recent transactions</CardTitle>

              <Button
                variant="ghost"
                size="sm"
                className="-mr-2 text-xs"
                onClick={() => navigate("/app/transactions")}
              >
                View all
                <ChevronRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              {loading ? (
                <div className="divide-y">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                      <Skeleton className="size-10 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : !summary?.transactions.length ? (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                    <Receipt className="size-5 text-muted-foreground" />
                  </div>

                  <p className="text-sm font-medium">No transactions yet</p>

                  <p className="text-xs text-muted-foreground">
                    Add your first transaction to see it here.
                  </p>

                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => openQuickTransaction("income")}
                  >
                    <Plus className="mr-1 size-4" />
                    Add transaction
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {summary.transactions.map((transaction) => {
                    const isIncome = transaction.type === "income"

                    return (
                      <button
                        type="button"
                        key={transaction.id}
                        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                        onClick={() => navigate("/app/transactions")}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          {isIncome ? (
                            <ArrowDownLeft className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4 text-destructive" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {transaction.description ||
                              (isIncome ? "Income" : "Expense")}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(transaction.transaction_date)}
                            </span>

                            {transaction.payment_method ? (
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-normal"
                              >
                                {formatPaymentMethod(
                                  transaction.payment_method,
                                )}
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            isIncome ? "text-foreground" : "text-destructive"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <QuickTransactionDialog
        open={quickTransactionOpen}
        onOpenChange={setQuickTransactionOpen}
        type={quickTransactionType}
        agents={agents}
        agencies={agencies}
        onSaved={handleQuickTransactionSaved}
      />
    </AppShell>
  )
}
