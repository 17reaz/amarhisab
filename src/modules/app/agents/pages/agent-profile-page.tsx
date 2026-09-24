import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Phone,
  RefreshCw,
} from "lucide-react"
import { PartyStatementDownload } from "../../reports/components/party-statement-download"
import {
  useNavigate,
  useParams,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { AppShell } from "../../components/app-shell"
import { getAgents } from "../services/agent-service"
import { getAgentStatement } from "../services/agent-statement-service"

import type { Agent } from "../types/agent"
import type { Transaction } from "../../transactions/types/transaction"

function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

export function AgentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [agent, setAgent] =
    useState<Agent | null>(null)

  const [transactions, setTransactions] =
    useState<Transaction[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [typeFilter, setTypeFilter] =
    useState<
      "all" | "income" | "expense"
    >("all")

  const [dateFrom, setDateFrom] =
    useState("")

  const [dateTo, setDateTo] =
    useState("")

  const [reportOpen, setReportOpen] =
    useState(false)

  async function load() {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const agents = await getAgents()

      const foundAgent = agents.find(
        (item) => item.id === id,
      )

      if (!foundAgent) {
        setError("Agent not found.")
        return
      }

      const statement =
        await getAgentStatement(id)

      setAgent(foundAgent)
      setTransactions(statement)
    } catch (err) {
      console.error(
        "Failed to load agent profile:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load agent profile.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          if (
            typeFilter !== "all" &&
            transaction.type !== typeFilter
          ) {
            return false
          }

          if (
            dateFrom &&
            transaction.transaction_date <
              dateFrom
          ) {
            return false
          }

          if (
            dateTo &&
            transaction.transaction_date >
              dateTo
          ) {
            return false
          }

          return true
        },
      )
    }, [
      transactions,
      typeFilter,
      dateFrom,
      dateTo,
    ])

  const summary = useMemo(() => {
    const income =
      filteredTransactions
        .filter(
          (item) =>
            item.type === "income",
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.amount),
          0,
        )

    const expense =
      filteredTransactions
        .filter(
          (item) =>
            item.type === "expense",
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.amount),
          0,
        )

    return {
      income,
      expense,
      net: income - expense,
    }
  }, [filteredTransactions])

  return (
    <AppShell title="Agent Statement">
      <div className="space-y-5">

        {/* Header */}

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              onClick={() =>
                navigate("/app/agents")
              }
              aria-label="Back to agents"
            >
              <ArrowLeft className="size-5" />
            </Button>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                Agent
              </p>

              <h2 className="truncate text-xl font-semibold tracking-tight">
                {loading
                  ? "Loading..."
                  : agent?.name ?? "Agent"}
              </h2>
            </div>
          </div>

          {/* Report Action */}

          <Button
            variant={
              reportOpen
                ? "secondary"
                : "ghost"
            }
            size="icon"
            className="size-10 shrink-0 rounded-full"
            onClick={() =>
              setReportOpen(
                (current) => !current,
              )
            }
            aria-label="Generate statement"
            aria-expanded={reportOpen}
          >
            <FileText className="size-5" />
          </Button>
        </div>

        {/* Report Options */}

        {reportOpen ? (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">
                  Generate Statement
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Export this agent statement as PDF
                </p>
              </div>

              <ChevronUp className="size-4 text-muted-foreground" />
            </div>

            <div className="space-y-4 p-4">

              {/* Date */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    From
                  </p>

                  <Input
                    type="date"
                    value={dateFrom}
                    max={
                      dateTo || undefined
                    }
                    onChange={(event) =>
                      setDateFrom(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    To
                  </p>

                  <Input
                    type="date"
                    value={dateTo}
                    min={
                      dateFrom || undefined
                    }
                    onChange={(event) =>
                      setDateTo(
                        event.target.value,
                      )
                    }
                  />
                </div>

              </div>

              {/* Transaction Type */}

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Transaction Type
                </p>

                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(
                      (value ?? "all") as
                        | "all"
                        | "income"
                        | "expense",
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Transaction type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All Transactions
                    </SelectItem>

                    <SelectItem value="income">
                      Income
                    </SelectItem>

                    <SelectItem value="expense">
                      Expense
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}

              <div className="rounded-xl bg-muted/50 p-3">
                <div className="grid grid-cols-3 gap-3 text-center">

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Income
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(
                        summary.income,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Expense
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(
                        summary.expense,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Net
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(
                        summary.net,
                      )}
                    </p>
                  </div>

                </div>
              </div>

              {/* Generate PDF */}

              <PartyStatementDownload
                partyType="agent"
                party={{
                  sl: agent.sl,
                  name: agent.name,
                  phone: agent.phone,
                }}
                transactions={filteredTransactions.map(
                  (transaction) => ({
                    id: transaction.id,
                    transaction_date:
                      transaction.transaction_date,
                    type: transaction.type,
                    amount: Number(
                      transaction.amount,
                    ),
                    description:
                      transaction.description,
                    payment_method:
                      transaction.payment_method,
                    party_type: "agent",
                    agent_id:
                      transaction.agent_id,
                    agency_id:
                      transaction.agency_id,
                  }),
                )}
                summary={{
                  totalIncome:
                    summary.income,
                  totalExpense:
                    summary.expense,
                  netBalance:
                    summary.net,
                }}
                dateFrom={
                  dateFrom ||
                  filteredTransactions.at(-1)
                    ?.transaction_date ||
                  new Date()
                    .toISOString()
                    .slice(0, 10)
                }
                dateTo={
                  dateTo ||
                  filteredTransactions[0]
                    ?.transaction_date ||
                  new Date()
                    .toISOString()
                    .slice(0, 10)
                }
              />

            </div>
          </div>
        ) : null}

        {/* Error */}

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className="mr-2 size-4" />
              Retry
            </Button>
          </div>
        ) : null}

        {agent ? (
          <>
            {/* Agent Info */}

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">

                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {String(agent.sl).padStart(
                    3,
                    "0",
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h3 className="font-semibold">
                        {agent.name}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        SL #{agent.sl}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        agent.is_active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {agent.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  {agent.phone ? (
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4" />
                      {agent.phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Summary */}

            <div className="grid grid-cols-3 gap-2">

              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">
                  Income
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(
                    summary.income,
                  )}
                </p>
              </div>

              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">
                  Expense
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(
                    summary.expense,
                  )}
                </p>
              </div>

              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">
                  Net
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(
                    summary.net,
                  )}
                </p>
              </div>

            </div>

            {/* Statement */}

            <div className="overflow-hidden rounded-2xl border bg-card">

              <div className="border-b px-4 py-4">
                <p className="font-semibold">
                  Statement
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {filteredTransactions.length}{" "}
                  transaction
                  {filteredTransactions.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="px-5 py-10 text-center">

                  <FileText className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No transactions found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try changing the filters.
                  </p>

                </div>
              ) : (
                <div className="divide-y">

                  {filteredTransactions.map(
                    (transaction) => {
                      const income =
                        transaction.type ===
                        "income"

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >

                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              income
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {income ? "+" : "-"}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium">
                              {transaction.description ||
                                (income
                                  ? "Income"
                                  : "Expense")}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatDate(
                                transaction.transaction_date,
                              )}

                              {" • "}

                              {transaction.payment_method}

                              {transaction.reference_no
                                ? ` • Ref ${transaction.reference_no}`
                                : ""}
                            </p>

                          </div>

                          <p className="shrink-0 text-sm font-semibold">
                            {income ? "+" : "-"}
                            {formatCurrency(
                              Number(
                                transaction.amount,
                              ),
                            )}
                          </p>

                        </div>
                      )
                    },
                  )}

                </div>
              )}

            </div>
          </>
        ) : null}

      </div>
    </AppShell>
  )
}