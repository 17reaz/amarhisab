import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { AppShell } from "../../components/app-shell"
import { getAgents } from "../../agents/services/agent-service"
import type { Agent } from "../../agents/types/agent"
import { getAgencies } from "../../agencies/services/agency-service"
import type { Agency } from "../../agencies/types/agency"

import { TransactionDetailDialog } from "../components/transaction-detail-dialog"
import { TransactionSheet } from "../components/transaction-sheet"
import {
  archiveTransaction,
  getTransactions,
} from "../services/transaction-service"
import type { Transaction, TransactionType } from "../types/transaction"

type FilterType = "all" | TransactionType

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
]

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`))
}

function formatPaymentMethod(method: string | null) {
  if (!method) {
    return "Other"
  }

  return method.charAt(0).toUpperCase() + method.slice(1)
}

type TransactionRowProps = {
  transaction: Transaction
  partyName: string
  onSelect: (transaction: Transaction) => void
}

function TransactionRow({
  transaction,
  partyName,
  onSelect,
}: TransactionRowProps) {
  const isIncome = transaction.type === "income"

  const partyLabel = transaction.party_type === "agent" ? "Agent" : "Agency"

  const title = transaction.description || (isIncome ? "Income" : "Expense")

  return (
    <button
      type="button"
      onClick={() => onSelect(transaction)}
      aria-label={`View ${title}`}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
    >
      {/* Type Icon */}
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
          isIncome
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}
      >
        {isIncome ? (
          <ArrowDownLeft className="size-5" />
        ) : (
          <ArrowUpRight className="size-5" />
        )}
      </div>

      {/* Description + Party */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {partyName ? `${partyName} • ` : ""}
          {partyLabel}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatPaymentMethod(transaction.payment_method)}
        </p>
      </div>

      {/* Amount + Date */}
      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-bold tabular-nums tracking-tight ${
            isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isIncome ? "+" : "−"}৳
          {Number(transaction.amount).toLocaleString("en-BD", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(transaction.transaction_date)}
        </p>
      </div>
    </button>
  )
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTransaction, setDetailTransaction] =
    useState<Transaction | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [transactionData, agentData, agencyData] = await Promise.all([
        getTransactions(),
        getAgents(),
        getAgencies(),
      ])

      setTransactions(transactionData)
      setAgents(agentData)
      setAgencies(agencyData)
    } catch (err) {
      console.error("Failed to load transactions:", err)

      setError(
        err instanceof Error ? err.message : "Failed to load transactions.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const getPartyName = useCallback(
    (transaction: Transaction) => {
      if (transaction.party_type === "agent") {
        return (
          agents.find((agent) => agent.id === transaction.agent_id)?.name ??
          "Unknown agent"
        )
      }

      return (
        agencies.find((agency) => agency.id === transaction.agency_id)?.name ??
        "Unknown agency"
      )
    },
    [agents, agencies],
  )

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return transactions.filter((transaction) => {
      if (filter !== "all" && transaction.type !== filter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        transaction.description,
        transaction.reference_no,
        transaction.payment_method,
        transaction.party_type,
        getPartyName(transaction),
        String(transaction.amount),
        transaction.transaction_date,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [transactions, search, filter, getPartyName])

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [transactions],
  )

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [transactions],
  )

  const handleAdd = () => {
    setEditingTransaction(null)
    setSheetOpen(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setSheetOpen(true)
  }

  const handleView = (transaction: Transaction) => {
    setDetailTransaction(transaction)
    setDetailOpen(true)
  }

  const handleEditFromDetail = (transaction: Transaction) => {
    setDetailOpen(false)

    // Let the dialog finish closing before the sheet opens.
    setTimeout(() => handleEdit(transaction), 0)
  }

  const handleSaved = (transaction: Transaction) => {
    if (!transaction.is_active) {
      setTransactions((current) =>
        current.filter((item) => item.id !== transaction.id),
      )

      return
    }

    setTransactions((current) => {
      const exists = current.some((item) => item.id === transaction.id)

      if (exists) {
        return current.map((item) =>
          item.id === transaction.id ? transaction : item,
        )
      }

      return [transaction, ...current]
    })
  }

  const handleDelete = async (transaction: Transaction) => {
    const archived = await archiveTransaction(transaction.id)

    handleSaved(archived)
    setDetailOpen(false)
  }

  return (
    <AppShell title="Transactions">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Transactions</h1>

            <p className="text-sm text-muted-foreground">
              Track your income and expenses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void loadData()}
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>

            <Button size="icon" onClick={handleAdd}>
              <Plus />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Income</p>

              <p className="truncate text-base font-semibold">
                ৳ {formatAmount(totalIncome)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
              <ArrowUpRight className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Expense</p>

              <p className="truncate text-base font-semibold">
                ৳ {formatAmount(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transactions..."
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              variant={filter === item.value ? "default" : "outline"}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Error */}
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void loadData()}
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
        {!loading && !error && filteredTransactions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No transactions found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add your first transaction to get started.
            </p>

            <Button className="mt-4" onClick={handleAdd}>
              <Plus />
              Add Transaction
            </Button>
          </div>
        ) : null}

        {/* Transaction List */}
        {!loading && filteredTransactions.length > 0 ? (
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-border/60">
            <CardContent className="divide-y p-0">
              {filteredTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  partyName={getPartyName(transaction)}
                  onSelect={handleView}
                />
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        transaction={detailTransaction}
        partyName={detailTransaction ? getPartyName(detailTransaction) : ""}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetail}
        onDelete={handleDelete}
      />

      {/* Transaction Sheet */}
      <TransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        transaction={editingTransaction}
        agents={agents}
        agencies={agencies}
        onSaved={handleSaved}
      />
    </AppShell>
  )
}