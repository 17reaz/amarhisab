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
  ReportFilters,
  ReportPartyType,
  ReportPaymentMethod,
  ReportTransactionType,
} from "../types/report"

interface ReportFiltersProps {
  filters: ReportFilters
  onChange: (filters: ReportFilters) => void
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
    values: Partial<ReportFilters>,
  ) {
    onChange({
      ...filters,
      ...values,
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="report-date-from">
            Date From
          </Label>

          <Input
            id="report-date-from"
            type="date"
            value={filters.dateFrom}
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
            onChange={(event) =>
              update({
                dateTo: event.target.value,
              })
            }
          />
        </div>
      </div>

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

      {filters.partyType === "agent" ? (
        <div className="space-y-2">
          <Label>Agent</Label>

          <Select
            value={filters.partyId || ""}
            onValueChange={(value) =>
              update({
                partyId: value ?? "",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>

            <SelectContent>
              {agents.map((agent) => (
                <SelectItem
                  key={agent.id}
                  value={agent.id}
                >
                  {agent.name} · SL {agent.sl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {filters.partyType === "agency" ? (
        <div className="space-y-2">
          <Label>Agency</Label>

          <Select
            value={filters.partyId || ""}
            onValueChange={(value) =>
              update({
                partyId: value ?? "",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Agencies" />
            </SelectTrigger>

            <SelectContent>
              {agencies.map((agency) => (
                <SelectItem
                  key={agency.id}
                  value={agency.id}
                >
                  {agency.name} · SL {agency.sl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

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

      <Button
        type="button"
        className="h-11 w-full"
        onClick={onGenerate}
        disabled={
          loading ||
          !filters.dateFrom ||
          !filters.dateTo
        }
      >
        <FileDown className="mr-2 size-4" />

        {loading
          ? "Generating..."
          : "Generate PDF"}
      </Button>
    </div>
  )
}