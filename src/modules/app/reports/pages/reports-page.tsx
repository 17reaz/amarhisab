import { useMemo, useState } from "react"
import { FileText, Plus, Sparkles } from "lucide-react"
import { pdf } from "@react-pdf/renderer"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { PageHeader } from "../../components/page-header"

import { ReportFilters } from "../components/report-filters"

import { TransactionStatementDocument } from "../documents/transaction-statement-document"

import {
  calculateReportSummary,
  getReportParty,
  getReportTransactions,
} from "../services/report-service"

import type {
  ReportFilters as ReportFiltersType,
  ReportSummary,
  ReportTransaction,
} from "../types/report"

function getToday() {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

export function ReportsPage() {
  const today = getToday()

  const [filters, setFilters] =
    useState<ReportFiltersType>({
      reportType: "transaction",
      dateFrom: today,
      dateTo: today,
      transactionType: "all",
      partyType: "all",
      paymentMethod: "all",
      partyId: "",
    })

  const [sheetOpen, setSheetOpen] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [hasGenerated, setHasGenerated] =
    useState(false)

  const [previewTransactions, setPreviewTransactions] =
    useState<ReportTransaction[]>([])

  const [previewSummary, setPreviewSummary] =
    useState<ReportSummary>({
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
    })

  const [error, setError] =
    useState<string | null>(null)

  const reportTitle = useMemo(() => {
    if (filters.reportType === "agent") {
      return "Agent Statement"
    }

    if (filters.reportType === "agency") {
      return "Agency Statement"
    }

    return "Transaction Statement"
  }, [filters.reportType])

  async function handleGenerate() {
    try {
      setLoading(true)
      setError(null)

      if (
        filters.dateFrom &&
        filters.dateTo &&
        filters.dateFrom > filters.dateTo
      ) {
        setError(
          "Date From cannot be later than Date To.",
        )

        return
      }

      if (
        (
          filters.reportType === "agent" ||
          filters.reportType === "agency"
        ) &&
        !filters.partyId
      ) {
        setError(
          `Please select an ${
            filters.reportType === "agent"
              ? "agent"
              : "agency"
          }.`,
        )

        return
      }

      const transactions =
        await getReportTransactions(filters)

      const summary =
        calculateReportSummary(
          transactions,
        )

      setPreviewTransactions(transactions)
      setPreviewSummary(summary)
      setHasGenerated(true)

      const party =
        filters.reportType === "agent" ||
        filters.reportType === "agency"
          ? await getReportParty(filters)
          : null

      const pdfDocument = (
        <TransactionStatementDocument
          transactions={transactions}
          summary={summary}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          reportTitle={reportTitle.toUpperCase()}
          party={party}
        />
      )

      const blob =
        await pdf(pdfDocument).toBlob()

      const url =
        URL.createObjectURL(blob)

      const link =
        document.createElement("a")

      const filename =
        filters.reportType === "agent"
          ? "agent-statement"
          : filters.reportType === "agency"
            ? "agency-statement"
            : "transaction-statement"

      link.href = url

      link.download =
        `${filename}-${filters.dateFrom}-${filters.dateTo}.pdf`

      document.body.appendChild(link)

      link.click()

      link.remove()

      URL.revokeObjectURL(url)

      // Close the sheet once the report has been generated & downloaded.
      setSheetOpen(false)
    } catch (err) {
      console.error(
        "Failed to generate report:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate report.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNewReport = () => {
    setError(null)
    setSheetOpen(true)
  }

  return (
    <>
      {/* Sticky page header */}
      <div className="sticky top-14 z-30 -mx-4 mb-5 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <PageHeader
          title="Reports"
          description="Financial statements & exports"
          action={
            <Button
              size="icon"
              className="size-10 rounded-full"
              onClick={handleOpenNewReport}
              aria-label="New report"
            >
              <Plus className="size-5" />
            </Button>
          }
        />
      </div>

      <div className="space-y-5">
        {/* Primary CTA card — always visible, easy re-entry point */}
        <button
          type="button"
          onClick={handleOpenNewReport}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Generate a new report
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Transaction, agent, or agency statement
            </p>
          </div>

          <Plus className="size-5 shrink-0 text-muted-foreground" />
        </button>

        {/* Last generated report */}
        {hasGenerated ? (
          <>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Last generated
              </h3>

              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <FileText className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {reportTitle}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDate(filters.dateFrom)} —{" "}
                      {formatDate(filters.dateTo)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x">
                  <div className="p-3 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      Income
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(
                        previewSummary.totalIncome,
                      )}
                    </p>
                  </div>

                  <div className="p-3 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      Expense
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(
                        previewSummary.totalExpense,
                      )}
                    </p>
                  </div>

                  <div className="p-3 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      Net
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(
                        previewSummary.netBalance,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Preview */}
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="border-b px-4 py-3.5">
                <p className="text-sm font-semibold">
                  Statement Preview
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {previewTransactions.length}{" "}
                  transaction
                  {previewTransactions.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              {previewTransactions.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <FileText className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No transactions found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try different filters.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {previewTransactions.map(
                    (transaction) => {
                      const isIncome =
                        transaction.type ===
                        "income"

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {transaction.description ||
                                (isIncome
                                  ? "Income"
                                  : "Expense")}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {formatDate(
                                transaction.transaction_date,
                              )}

                              {" • "}

                              {transaction.payment_method ||
                                "Other"}

                              {" • "}

                              {transaction.party_type ===
                              "agent"
                                ? "Agent"
                                : "Agency"}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold">
                            {isIncome ? "+" : "-"}
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
        ) : (
          /* Empty state — no report generated yet */
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-medium">
              No reports yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Tap "New Report" to generate your first
              statement.
            </p>

            <Button
              className="mt-4"
              onClick={handleOpenNewReport}
            >
              <Plus className="mr-2 size-4" />
              New Report
            </Button>
          </div>
        )}
      </div>

      {/* New Report Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>New Report</SheetTitle>

            <SheetDescription>
              Configure filters and generate a statement.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-6">
            {error ? (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">
                  {error}
                </p>
              </div>
            ) : null}

            <ReportFilters
              filters={filters}
              onChange={setFilters}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}