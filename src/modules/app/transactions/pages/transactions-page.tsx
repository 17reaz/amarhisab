import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleAlert,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  X,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AppShell } from "../../components/app-shell"
import { PageHeader } from "../../components/page-header"
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

  const title = transaction.description || (isIncome ? "Income" : "Expense")

  return (
    <button
      type="button"
      onClick={() => onSelect(transaction)}
      aria-label={`View ${title}`}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none active:bg-muted"
    >
      {/* Description + Party + Payment method */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>

        <div className="mt-1 flex items-center gap-2">
          {partyName ? (
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {partyName}
            </span>
          ) : null}

          <Badge
            variant="secondary"
            className="shrink-0 px-1.5 py-0 text-[10px] font-normal"
          >
            {formatPaymentMethod(transaction.payment_method)}
          </Badge>
        </div>
      </div>

      {/* Amount + Date (color shows income / expense) */}
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
  const [searchOpen, setSearchOpen] = useState(false)
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

  const handleToggleSearch = () => {
    setSearchOpen((current) => {
      const next = !current

      if (!next) {
        setSearch("")
      }

      return next
    })
  }

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
      {/* Sticky page header — always stuck below AppHeader.
          Filters live inside this sticky block too:
          - search closed  -> full filter tabs shown under the title
          - search open    -> compact filter dropdown shown beside the search input */}
      <div className="sticky top-14 z-30 -mx-4 mb-4 border-b bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <PageHeader
          title="Transactions"
          description="Track your income and expenses"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant={searchOpen ? "secondary" : "ghost"}
                size="icon"
                className="size-10 rounded-full"
                onClick={handleToggleSearch}
                aria-label="Search transactions"
                aria-expanded={searchOpen}
              >
                {searchOpen ? (
                  <X className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-full"
                onClick={() => void loadData()}
                disabled={loading}
                aria-label="Refresh transactions"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>

              <Button
                size="icon"
                className="size-10 rounded-full shadow-sm"
                onClick={handleAdd}
                aria-label="Add transaction"
              >
                <Plus className="size-5" />
              </Button>
            </div>
          }
        />

        {searchOpen ? (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                className="h-11 rounded-lg pl-9 pr-3"
              />
            </div>

            <Select
              value={filter}
              onValueChange={(value) =>
                setFilter((value ?? "all") as FilterType)
              }
            >
              <SelectTrigger className="w-[110px] shrink-0 rounded-lg data-[size=default]:h-11">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>

              <SelectContent>
                {FILTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Search closed: full filter tabs under the title, sticky */
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as FilterType)}
            className="mt-3"
          >
            <TabsList className="grid h-11 w-full grid-cols-3">
              {FILTERS.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <Card>
          <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Income</p>

                {loading ? (
                  <Skeleton className="mt-1 h-5 w-20" />
                ) : (
                  <p className="truncate text-base font-semibold tabular-nums">
                    ৳ {formatAmount(totalIncome)}
                  </p>
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="h-10" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                <ArrowUpRight className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Expense</p>

                {loading ? (
                  <Skeleton className="mt-1 h-5 w-20" />
                ) : (
                  <p className="truncate text-base font-semibold tabular-nums">
                    ৳ {formatAmount(totalExpense)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error ? (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>Could not load transactions</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{error}</p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadData()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Loading */}
        {loading ? (
          <Card className="overflow-hidden">
            <CardContent className="divide-y p-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="ml-auto h-4 w-16" />
                    <Skeleton className="ml-auto h-3 w-14" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {/* Empty */}
        {!loading && !error && filteredTransactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Receipt className="size-5 text-muted-foreground" />
              </div>

              <p className="font-medium">No transactions found</p>

              <p className="text-sm text-muted-foreground">
                Add your first transaction to get started.
              </p>

              <Button className="mt-3" onClick={handleAdd}>
                <Plus />
                Add Transaction
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Transaction List */}
        {!loading && filteredTransactions.length > 0 ? (
          <section className="space-y-2">
            <p className="px-1 text-xs text-muted-foreground">
              {filteredTransactions.length}{" "}
              {filteredTransactions.length === 1
                ? "transaction"
                : "transactions"}
            </p>

            <Card className="overflow-hidden">
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
          </section>
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
