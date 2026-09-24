import { useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"

import { AppShell } from "../../components/app-shell"
import { ReportFilters } from "../components/report-filters"
import {
  calculateReportSummary,
  getReportTransactions,
} from "../services/report-service"
import type { ReportFilters as ReportFiltersType } from "../types/report"
import { pdf } from "@react-pdf/renderer"

import { TransactionStatementDocument } from "../documents/transaction-statement-document"
function getToday() {
  return new Date().toISOString().slice(0, 10)
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

  const [loading, setLoading] = useState(false)

  const summary = useMemo(
    () => ({
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
    }),
    [],
  )

  async function handleGenerate() {
  try {
    setLoading(true)

    const transactions =
      await getReportTransactions(filters)

    const reportSummary =
      calculateReportSummary(transactions)

    const pdfDocument = (
  <TransactionStatementDocument
    transactions={transactions}
    summary={reportSummary}
    dateFrom={filters.dateFrom}
    dateTo={filters.dateTo}
  />
)

const blob = await pdf(pdfDocument).toBlob()

const url = URL.createObjectURL(blob)

const link = document.createElement("a")

link.href = url
link.download = `transaction-statement-${filters.dateFrom}-${filters.dateTo}.pdf`

document.body.appendChild(link)
link.click()
link.remove()

URL.revokeObjectURL(url)
  } catch (error) {
    console.error(
      "Failed to generate report:",
      error,
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <AppShell title="Reports">
      <div className="space-y-5">
        <section>
          <p className="text-sm text-muted-foreground">
            Financial reports
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Transaction Statement
          </h2>
        </section>

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

        <Card>
          <CardContent className="grid grid-cols-3 gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Income
              </p>

              <p className="mt-1 text-sm font-semibold">
                ৳{summary.totalIncome.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Expense
              </p>

              <p className="mt-1 text-sm font-semibold">
                ৳{summary.totalExpense.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Net
              </p>

              <p className="mt-1 text-sm font-semibold">
                ৳{summary.netBalance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}