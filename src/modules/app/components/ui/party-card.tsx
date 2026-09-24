import { Pencil, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PartyCardProps {
  sl: number
  name: string
  phone: string | null
  isActive: boolean

  balance: number
  income: number
  expense: number
  transactionCount: number
  lastActivityDate: string | null

  onClick: () => void
  onEdit: (event: React.MouseEvent) => void
  onToggleActive: (event: React.MouseEvent) => void
  onQuickAdd?: (event: React.MouseEvent) => void
}

function formatMoney(amount: number) {
  return `৳${Math.abs(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function formatRelativeDate(date: string | null) {
  if (!date) return "No activity yet"

  const parsed = new Date(`${date}T00:00:00`)
  const now = new Date()

  const diffDays = Math.floor(
    (now.getTime() - parsed.getTime()) / 86_400_000,
  )

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

export function PartyCard({
  sl,
  name,
  phone,
  isActive,
  balance,
  income,
  expense,
  transactionCount,
  lastActivityDate,
  onClick,
  onEdit,
  onToggleActive,
  onQuickAdd,
}: PartyCardProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "#"

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer gap-0 py-4 shadow-sm transition-colors hover:bg-muted/40"
    >
      <CardContent>
        {/* Balance */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>

            <p
              className={`text-lg font-bold tracking-tight ${
                balance < 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {balance < 0 ? "−" : ""}
              {formatMoney(balance)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-emerald-600">
              +{formatMoney(income)}
            </p>

            <p className="text-[11px] text-destructive">
              −{formatMoney(expense)}
            </p>
          </div>
        </div>

        {/* Identity row */}
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{name}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {phone || "No phone number"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {onQuickAdd ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      onQuickAdd(event)
                    }}
                    aria-label={`Add transaction for ${name}`}
                  >
                    <Plus className="size-4" />
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(event)
                  }}
                  aria-label={`Edit ${name}`}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            </div>

            {/* Meta row: transaction count + last activity */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {transactionCount}{" "}
                {transactionCount === 1 ? "transaction" : "transactions"}
              </span>

              <span className="text-muted-foreground/50">•</span>

              <span>{formatRelativeDate(lastActivityDate)}</span>
            </div>

            {/* Status + SL */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleActive(event)
                }}
                className="flex items-center gap-2"
              >
                <span
                  className={`size-2.5 rounded-full ${
                    isActive ? "bg-emerald-500" : "bg-muted-foreground"
                  }`}
                />

                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </button>

              <span className="text-xs text-muted-foreground">
                SL #{sl}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}