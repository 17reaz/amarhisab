import { useEffect, useState } from "react"
import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getAgents } from "../../agents/services/agent-service"
import { getAgencies } from "../../agencies/services/agency-service"

import type { Agent } from "../../agents/types/agent"
import type { Agency } from "../../agencies/types/agency"
import type {
  ReportFilters as ReportFiltersType,
  ReportPartyType,
  ReportPaymentMethod,
  ReportTransactionType,
  ReportType,
} from "../types/report"

interface ReportFiltersProps {
  filters: ReportFiltersType
  onChange: (filters: ReportFiltersType) => void
  onGenerate: () => void
  loading?: boolean
}

export function ReportFilters({
  filters,
  onChange,
  onGenerate,
  loading = false,
}: ReportFiltersProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    async function loadParties() {
      try {
        const [agentData, agencyData] =
          await Promise.all([
            getAgents(),
            getAgencies(),
          ])

        setAgents(agentData)
        setAgencies(agencyData)
      } catch (error) {
        console.error(
          "Failed to load report parties:",
          error,
        )
      }
    }

    loadParties()
  }, [])

  function update(
    values: Partial<ReportFiltersType>,
  ) {
    onChange({
      ...filters,
      ...values,
    })
  }

  function handleReportTypeChange(
    value: string | null,
  ) {
    const reportType =
      (value ?? "transaction") as ReportType

    if (reportType === "agent") {
      update({
        reportType,
        partyType: "agent",
        partyId: "",
      })

      return
    }

    if (reportType === "agency") {
      update({
        reportType,
        partyType: "agency",
        partyId: "",
      })

      return
    }

    update({
      reportType: "transaction",
      partyType: "all",
      partyId: "",
    })
  }

  function handlePartyTypeChange(
    value: string | null,
  ) {
    const partyType =
      (value ?? "all") as ReportPartyType

    update({
      partyType,
      partyId: "",
    })
  }

  const showAgent =
    filters.reportType === "agent" ||
    (
      filters.reportType === "transaction" &&
      filters.partyType === "agent"
    )

  const showAgency =
    filters.reportType === "agency" ||
    (
      filters.reportType === "transaction" &&
      filters.partyType === "agency"
    )

  const canGenerate =
    Boolean(filters.dateFrom) &&
    Boolean(filters.dateTo) &&
    (
      filters.reportType === "transaction" ||
      Boolean(filters.partyId)
    )

  return (
    <div className="space-y-5">
      {/* Report Type */}
      <div className="space-y-2">
        <Label>Report Type</Label>

        <Select
          value={filters.reportType}
          onValueChange={handleReportTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="transaction">
              Transaction Statement
            </SelectItem>

            <SelectItem value="agent">
              Agent Statement
            </SelectItem>

            <SelectItem value="agency">
              Agency Statement
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="report-date-from">
            Date From
          </Label>

          <Input
            id="report-date-from"
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(event) =>
              update({
                dateFrom: event.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-date-to">
            Date To
          </Label>

          <Input
            id="report-date-to"
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(event) =>
              update({
                dateTo: event.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Transaction Party Filter */}
      {filters.reportType === "transaction" ? (
        <div className="space-y-2">
          <Label>Party</Label>

          <Select
            value={filters.partyType}
            onValueChange={handlePartyTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select party" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Parties
              </SelectItem>

              <SelectItem value="agent">
                Agent
              </SelectItem>

              <SelectItem value="agency">
                Agency
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* Agent */}
      {showAgent ? (
        <div className="space-y-2">
          <Label>Agent</Label>

          <Select
            value={
              filters.partyType === "agent"
                ? filters.partyId
                : ""
            }
            onValueChange={(value) =>
              update({
                partyType: "agent",
                partyId: value ?? "",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>

            <SelectContent>
              {agents.length === 0 ? (
                <SelectItem
                  value="__empty"
                  disabled
                >
                  No agents found
                </SelectItem>
              ) : (
                agents.map((agent) => (
                  <SelectItem
                    key={agent.id}
                    value={agent.id}
                  >
                    {agent.name} · SL {agent.sl}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* Agency */}
      {showAgency ? (
        <div className="space-y-2">
          <Label>Agency</Label>

          <Select
            value={
              filters.partyType === "agency"
                ? filters.partyId
                : ""
            }
            onValueChange={(value) =>
              update({
                partyType: "agency",
                partyId: value ?? "",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Agency" />
            </SelectTrigger>

            <SelectContent>
              {agencies.length === 0 ? (
                <SelectItem
                  value="__empty"
                  disabled
                >
                  No agencies found
                </SelectItem>
              ) : (
                agencies.map((agency) => (
                  <SelectItem
                    key={agency.id}
                    value={agency.id}
                  >
                    {agency.name} · SL {agency.sl}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Transaction Type</Label>

        <Select
          value={filters.transactionType}
          onValueChange={(value) =>
            update({
              transactionType:
                (value ??
                  "all") as ReportTransactionType,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Transactions
            </SelectItem>

            <SelectItem value="income">
              Income
            </SelectItem>

            <SelectItem value="expense">
              Expense
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>

        <Select
          value={filters.paymentMethod}
          onValueChange={(value) =>
            update({
              paymentMethod:
                (value ??
                  "all") as ReportPaymentMethod,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Payment Methods
            </SelectItem>

            <SelectItem value="cash">
              Cash
            </SelectItem>

            <SelectItem value="bkash">
              bKash
            </SelectItem>

            <SelectItem value="nagad">
              Nagad
            </SelectItem>

            <SelectItem value="bank">
              Bank
            </SelectItem>

            <SelectItem value="other">
              Other
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Generate */}
      <Button
        type="button"
        className="h-11 w-full"
        onClick={onGenerate}
        disabled={loading || !canGenerate}
      >
        <FileDown className="mr-2 size-4" />

        {loading
          ? "Generating..."
          : "Generate PDF"}
      </Button>
    </div>
  )
}