import { useMemo, useState } from "react"
import { FileText } from "lucide-react"
import { pdf } from "@react-pdf/renderer"

import { Card, CardContent } from "@/components/ui/card"

import { AppShell } from "../../components/app-shell"

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

  const [loading, setLoading] =
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

  return (
    <AppShell title="Reports">
      <div className="space-y-5">
        {/* Header */}
        <section>
          <p className="text-sm text-muted-foreground">
            Financial reports
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Reports
          </h2>
        </section>

        {/* Filters */}
        <Card>
          <CardContent className="p-5">
            <ReportFilters
              filters={filters}
              onChange={setFilters}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Error */}
        {error ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-destructive">
                {error}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Preview Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <FileText className="size-5" />
              </div>

              <div>
                <p className="font-semibold">
                  {reportTitle}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatDate(filters.dateFrom)} —{" "}
                  {formatDate(filters.dateTo)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Income
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(
                    previewSummary.totalIncome,
                  )}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Expense
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(
                    previewSummary.totalExpense,
                  )}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Net
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(
                    previewSummary.netBalance,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Preview */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    Statement Preview
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {previewTransactions.length}{" "}
                    transaction
                    {previewTransactions.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </div>
            </div>

            {previewTransactions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FileText className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No report data yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Select your filters and generate
                  the report.
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
                        className="flex items-center gap-3 px-5 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {transaction.description ||
                              (
                                isIncome
                                  ? "Income"
                                  : "Expense"
                              )}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
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
                          {isIncome
                            ? "+"
                            : "-"}

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
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}