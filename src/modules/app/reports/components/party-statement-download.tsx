import {
  FileText,
} from "lucide-react"
import {
  PDFDownloadLink,
} from "@react-pdf/renderer"

import {
  TransactionStatementDocument,
} from "../documents/transaction-statement-document"

import type {
  ReportSummary,
  ReportTransaction,
} from "../types/report"

interface PartyStatementDownloadProps {
  partyType: "agent" | "agency"
  party: {
    sl: number
    name: string
    phone: string | null
  }
  transactions: ReportTransaction[]
  summary: ReportSummary
  dateFrom: string
  dateTo: string
}

export function PartyStatementDownload({
  partyType,
  party,
  transactions,
  summary,
  dateFrom,
  dateTo,
}: PartyStatementDownloadProps) {
  const fileName =
    `${partyType}-${party.name}`
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()

  return (
    <PDFDownloadLink
      document={
        <TransactionStatementDocument
          transactions={transactions}
          summary={summary}
          dateFrom={dateFrom}
          dateTo={dateTo}
          reportTitle={
            partyType === "agent"
              ? "AGENT STATEMENT"
              : "AGENCY STATEMENT"
          }
          party={party}
        />
      }
      fileName={`${fileName}-statement.pdf`}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {({ loading }) => (
        <>
          <FileText className="size-4" />

          {loading
            ? "Generating..."
            : "Generate PDF"}
        </>
      )}
    </PDFDownloadLink>
  )
}