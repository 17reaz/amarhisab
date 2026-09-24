import { useEffect, useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AppShell } from "../../components/app-shell"
import { getAgents } from "../../agents/services/agent-service"
import type { Agent } from "../../agents/types/agent"
import { getAgencies } from "../../agencies/services/agency-service"
import type { Agency } from "../../agencies/types/agency"

import { TransactionSheet } from "../components/transaction-sheet"
import {
  getTransactions,
} from "../services/transaction-service"
import type {
  Transaction,
  TransactionType,
} from "../types/transaction"

type FilterType = "all" | TransactionType

export function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([])

  const [agents, setAgents] =
    useState<Agent[]>([])

  const [agencies, setAgencies] =
    useState<Agency[]>([])

  const [search, setSearch] = useState("")

  const [filter, setFilter] =
    useState<FilterType>("all")

  const [loading, setLoading] = useState(true)
  const [error, setError] =
    useState<string | null>(null)

  const [sheetOpen, setSheetOpen] =
    useState(false)

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        transactionData,
        agentData,
        agencyData,
      ] = await Promise.all([
        getTransactions(),
        getAgents(),
        getAgencies(),
      ])

      setTransactions(transactionData)
      setAgents(agentData)
      setAgencies(agencyData)
    } catch (err) {
      console.error(
        "Failed to load transactions:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const getPartyName = (
    transaction: Transaction,
  ) => {
    if (transaction.party_type === "agent") {
      return (
        agents.find(
          (agent) =>
            agent.id === transaction.agent_id,
        )?.name ?? "Unknown agent"
      )
    }

    return (
      agencies.find(
        (agency) =>
          agency.id === transaction.agency_id,
      )?.name ?? "Unknown agency"
    )
  }

  const filteredTransactions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()

    return transactions.filter(
      (transaction) => {
        if (
          filter !== "all" &&
          transaction.type !== filter
        ) {
          return false
        }

        if (!query) {
          return true
        }

        const partyName =
          getPartyName(transaction)

        return [
          transaction.description,
          transaction.reference_no,
          transaction.payment_method,
          transaction.party_type,
          partyName,
          String(transaction.amount),
          transaction.transaction_date,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          )
      },
    )
  }, [
    transactions,
    agents,
    agencies,
    search,
    filter,
  ])

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "income",
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0,
        ),
    [transactions],
  )

  const totalExpense = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "expense",
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0,
        ),
    [transactions],
  )

  const handleAdd = () => {
    setEditingTransaction(null)
    setSheetOpen(true)
  }

  const handleEdit = (
    transaction: Transaction,
  ) => {
    setEditingTransaction(transaction)
    setSheetOpen(true)
  }

  const handleSaved = (
  transaction: Transaction,
) => {
  if (!transaction.is_active) {
    setTransactions((current) =>
      current.filter(
        (item) => item.id !== transaction.id,
      ),
    )
    return
  }

  setTransactions((current) => {
    const exists = current.some(
      (item) => item.id === transaction.id,
    )

    if (exists) {
      return current.map((item) =>
        item.id === transaction.id
          ? transaction
          : item,
      )
    }

    return [transaction, ...current]
  })
}

  const formatAmount = (
    amount: number,
  ) => {
    return new Intl.NumberFormat(
      "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(amount)
  }

  const formatDate = (
    date: string,
  ) => {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(
      new Date(`${date}T00:00:00`),
    )
  }

  return (
    <AppShell title="Transactions">
      <div className="space-y-4">
        {/* Header */}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              Transactions
            </h1>

            <p className="text-sm text-muted-foreground">
              Track your income and expenses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                void loadData()
              }
              disabled={loading}
            >
              <RefreshCw
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </Button>

            <Button
              size="icon"
              onClick={handleAdd}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {/* Summary */}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Income
            </p>

            <p className="mt-1 text-lg font-semibold">
              ৳ {formatAmount(totalIncome)}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Expense
            </p>

            <p className="mt-1 text-lg font-semibold">
              ৳ {formatAmount(totalExpense)}
            </p>
          </div>
        </div>

        {/* Search */}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search transactions..."
            className="pl-9"
          />
        </div>

        {/* Filters */}

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={
              filter === "all"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </Button>

          <Button
            variant={
              filter === "income"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setFilter("income")
            }
          >
            Income
          </Button>

          <Button
            variant={
              filter === "expense"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setFilter("expense")
            }
          >
            Expense
          </Button>
        </div>

        {/* Error */}

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                void loadData()
              }
            >
              Try again
            </Button>
          </div>
        ) : null}

        {/* Loading */}

        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading transactions...
          </div>
        ) : null}

        {/* Empty */}

        {!loading &&
        !error &&
        filteredTransactions.length ===
          0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add your first transaction to
              get started.
            </p>

            <Button
              className="mt-4"
              onClick={handleAdd}
            >
              <Plus />
              Add Transaction
            </Button>
          </div>
        ) : null}

        {/* Transaction list */}

        {!loading &&
        filteredTransactions.length >
          0 ? (
          <div className="space-y-3">
            {filteredTransactions.map(
              (transaction) => {
                const isIncome =
                  transaction.type ===
                  "income"

                const partyName =
                  getPartyName(
                    transaction,
                  )

                return (
                  <div
                    key={transaction.id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 rounded-full border p-2">
                          {isIncome ? (
                            <ArrowUpRight className="size-4" />
                          ) : (
                            <ArrowDownRight className="size-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {transaction.description ||
                              "Transaction"}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {partyName}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="capitalize">
                              {transaction.payment_method}
                            </span>

                            <span>•</span>

                            <span>
                              {formatDate(
                                transaction.transaction_date,
                              )}
                            </span>

                            {transaction.reference_no ? (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  Ref:{" "}
                                  {
                                    transaction.reference_no
                                  }
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold">
                          {isIncome
                            ? "+"
                            : "-"}{" "}
                          ৳{" "}
                          {formatAmount(
                            Number(
                              transaction.amount,
                            ),
                          )}
                        </p>

                        <p className="mt-1 text-xs uppercase text-muted-foreground">
                          {transaction.type}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleEdit(
                            transaction,
                          )
                        }
                      >
                        <Pencil />
                        Edit
                      </Button>
                    </div>
                  </div>
                )
              },
            )}
          </div>
        ) : null}
      </div>

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        transaction={
          editingTransaction
        }
        agents={agents}
        agencies={agencies}
        onSaved={handleSaved}
      />
    </AppShell>
  )
}