import { useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { Transaction } from "../types/transaction"

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

type DetailRowProps = {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>

      <span className="min-w-0 break-words text-right text-sm font-medium">
        {value}
      </span>
    </div>
  )
}

type TransactionDetailDialogProps = {
  transaction: Transaction | null
  partyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => Promise<void>
}

export function TransactionDetailDialog({
  transaction,
  partyName,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailDialogProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!transaction) {
    return null
  }

  const isIncome = transaction.type === "income"

  const title = transaction.description || (isIncome ? "Income" : "Expense")

  const partyLabel = transaction.party_type === "agent" ? "Agent" : "Agency"

  const resetState = () => {
    setConfirming(false)
    setDeleting(false)
    setError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (deleting) {
      return
    }

    if (!nextOpen) {
      resetState()
    }

    onOpenChange(nextOpen)
  }

  const handleEdit = () => {
    resetState()
    onEdit(transaction)
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setError(null)

      await onDelete(transaction)

      resetState()
    } catch (err) {
      console.error("Failed to delete transaction:", err)

      setError(
        err instanceof Error ? err.message : "Failed to delete transaction.",
      )

      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        {/* Hero */}
        <DialogHeader className="items-center px-5 pb-5 pt-8 text-center">
          <div
            className={`flex size-14 items-center justify-center rounded-full ${
              isIncome
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft className="size-6" />
            ) : (
              <ArrowUpRight className="size-6" />
            )}
          </div>

          <p
            className={`mt-3 text-3xl font-bold tabular-nums tracking-tight ${
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

          <DialogTitle className="mt-1 text-base font-semibold">
            {title}
          </DialogTitle>

          <DialogDescription className="text-xs">
            {isIncome ? "Income" : "Expense"} transaction
          </DialogDescription>
        </DialogHeader>

        {/* Details */}
        <div className="mx-5 divide-y overflow-hidden rounded-xl border">
          <DetailRow label={partyLabel} value={partyName} />

          <DetailRow
            label="Payment method"
            value={formatPaymentMethod(transaction.payment_method)}
          />

          <DetailRow
            label="Date"
            value={formatDate(transaction.transaction_date)}
          />

          {transaction.reference_no ? (
            <DetailRow label="Reference" value={transaction.reference_no} />
          ) : null}
        </div>

        {/* Error */}
        {error ? (
          <p className="mx-5 mt-3 text-sm text-destructive">{error}</p>
        ) : null}

        {/* Actions */}
        <div className="p-5">
          {confirming ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Are you sure you want to delete this transaction?
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleting}
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                >
                  {deleting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash2 />
                  )}
                  Yes, delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={handleEdit}>
                <Pencil />
                Edit
              </Button>

              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirming(true)}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}