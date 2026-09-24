import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import type {
  ReportSummary,
  ReportTransaction,
} from "../types/report"

interface TransactionStatementDocumentProps {
  transactions: ReportTransaction[]
  summary: ReportSummary
  dateFrom: string
  dateTo: string
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 42,
    fontSize: 9,
    color: "#111827",
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 14,
  },

  companyName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },

  reportTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },

  meta: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.5,
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  summaryItem: {
    flex: 1,
    padding: 9,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },

  summaryItemLast: {
    flex: 1,
    padding: 9,
  },

  summaryLabel: {
    fontSize: 7,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  summaryValue: {
    fontSize: 11,
    fontWeight: 700,
  },

  table: {
    width: "100%",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 7,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 7,
    minHeight: 28,
  },

  dateColumn: {
    width: "13%",
  },

  descriptionColumn: {
    width: "31%",
    paddingRight: 8,
  },

  partyColumn: {
    width: "16%",
  },

  methodColumn: {
    width: "15%",
  },

  typeColumn: {
    width: "10%",
  },

  amountColumn: {
    width: "15%",
    textAlign: "right",
  },

  headerText: {
    fontSize: 7,
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
  },

  cellText: {
    fontSize: 8,
    color: "#374151",
  },

  amountText: {
    fontSize: 8,
    textAlign: "right",
  },

  totalSection: {
    marginTop: 18,
    marginLeft: "55%",
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  totalLabel: {
    fontSize: 8,
    color: "#4b5563",
  },

  totalValue: {
    fontSize: 8,
    fontWeight: 700,
  },

  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },

  netLabel: {
    fontSize: 9,
    fontWeight: 700,
  },

  netValue: {
    fontSize: 10,
    fontWeight: 700,
  },

  empty: {
    paddingVertical: 20,
    textAlign: "center",
    color: "#6b7280",
  },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
  },

  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
})

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatAmount(amount: number) {
  return `৳${Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPaymentMethod(
  method: string | null,
) {
  if (!method) return "-"

  if (method === "bkash") return "bKash"

  return method.charAt(0).toUpperCase() + method.slice(1)
}

function formatParty(
  transaction: ReportTransaction,
) {
  if (transaction.party_type === "agent") {
    return "Agent"
  }

  return "Agency"
}

export function TransactionStatementDocument({
  transactions,
  summary,
  dateFrom,
  dateTo,
}: TransactionStatementDocumentProps) {
  return (
    <Document
      title="Transaction Statement"
      author="AmarHisab"
      subject="Financial Transaction Statement"
      creator="AmarHisab"
    >
      <Page
        size="A4"
        orientation="portrait"
        style={styles.page}
        wrap
      >
        <View style={styles.header}>
          <Text style={styles.companyName}>
            AMARHISAB
          </Text>

          <Text style={styles.reportTitle}>
            TRANSACTION STATEMENT
          </Text>

          <Text style={styles.meta}>
            Period: {formatDate(dateFrom)} —{" "}
            {formatDate(dateTo)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Total Income
            </Text>

            <Text style={styles.summaryValue}>
              {formatAmount(summary.totalIncome)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Total Expense
            </Text>

            <Text style={styles.summaryValue}>
              {formatAmount(summary.totalExpense)}
            </Text>
          </View>

          <View style={styles.summaryItemLast}>
            <Text style={styles.summaryLabel}>
              Net Balance
            </Text>

            <Text style={styles.summaryValue}>
              {formatAmount(summary.netBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.headerText,
                styles.dateColumn,
              ]}
            >
              Date
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.descriptionColumn,
              ]}
            >
              Description
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.partyColumn,
              ]}
            >
              Party
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.methodColumn,
              ]}
            >
              Method
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.typeColumn,
              ]}
            >
              Type
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.amountColumn,
              ]}
            >
              Amount
            </Text>
          </View>

          {transactions.length === 0 ? (
            <Text style={styles.empty}>
              No transactions found for the selected
              period.
            </Text>
          ) : (
            transactions.map((transaction) => {
              const isIncome =
                transaction.type === "income"

              return (
                <View
                  key={transaction.id}
                  style={styles.tableRow}
                  wrap={false}
                >
                  <Text
                    style={[
                      styles.cellText,
                      styles.dateColumn,
                    ]}
                  >
                    {formatDate(
                      transaction.transaction_date,
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.cellText,
                      styles.descriptionColumn,
                    ]}
                  >
                    {transaction.description ||
                      "-"}
                  </Text>

                  <Text
                    style={[
                      styles.cellText,
                      styles.partyColumn,
                    ]}
                  >
                    {formatParty(transaction)}
                  </Text>

                  <Text
                    style={[
                      styles.cellText,
                      styles.methodColumn,
                    ]}
                  >
                    {formatPaymentMethod(
                      transaction.payment_method,
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.cellText,
                      styles.typeColumn,
                    ]}
                  >
                    {isIncome
                      ? "Income"
                      : "Expense"}
                  </Text>

                  <Text
                    style={[
                      styles.amountText,
                      styles.amountColumn,
                    ]}
                  >
                    {isIncome ? "+" : "-"}
                    {formatAmount(
                      Number(transaction.amount),
                    )}
                  </Text>
                </View>
              )
            })
          )}
        </View>

        <View
          style={styles.totalSection}
          wrap={false}
        >
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Income
            </Text>

            <Text style={styles.totalValue}>
              {formatAmount(summary.totalIncome)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Expense
            </Text>

            <Text style={styles.totalValue}>
              {formatAmount(summary.totalExpense)}
            </Text>
          </View>

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>
              Net Balance
            </Text>

            <Text style={styles.netValue}>
              {formatAmount(summary.netBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by AmarHisab
          </Text>

          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}