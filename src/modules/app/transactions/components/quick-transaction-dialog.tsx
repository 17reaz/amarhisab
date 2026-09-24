import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  Building2,
  Check,
  Search,
  UserRound,
} from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { createTransaction } from "../services/transaction-service"

import type {
  CreateTransactionInput,
  PaymentMethod,
  PartyType,
  Transaction,
  TransactionType,
} from "../types/transaction"

import type { Agent } from "../../agents/types/agent"
import type { Agency } from "../../agencies/types/agency"

interface QuickTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: TransactionType
  agents: Agent[]
  agencies: Agency[]
  onSaved: (transaction: Transaction) => void
}

export function QuickTransactionDialog({
  open,
  onOpenChange,
  type,
  agents,
  agencies,
  onSaved,
}: QuickTransactionDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash")

  const [partyType, setPartyType] =
    useState<PartyType>("agent")

  const [agentId, setAgentId] = useState("")
  const [agencyId, setAgencyId] = useState("")

  const [partySearch, setPartySearch] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [referenceNo, setReferenceNo] =
    useState("")

  const [transactionDate, setTransactionDate] =
    useState("")

  const [loading, setLoading] = useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setAmount("")
    setPaymentMethod("cash")

    setPartyType("agent")
    setAgentId("")
    setAgencyId("")
    setPartySearch("")

    setDescription("")
    setReferenceNo("")

    setTransactionDate(
      new Date().toISOString().slice(0, 10),
    )

    setError(null)
  }, [open, type])

  useEffect(() => {
    setPartySearch("")

    if (partyType === "agent") {
      setAgencyId("")
    } else {
      setAgentId("")
    }
  }, [partyType])

  const filteredAgents = useMemo(() => {
    const search = partySearch.trim().toLowerCase()

    return agents
      .filter((agent) => agent.is_active)
      .filter((agent) => {
        if (!search) return true

        return (
          agent.name.toLowerCase().includes(search) ||
          agent.code.toLowerCase().includes(search)
        )
      })
      .slice(0, 20)
  }, [agents, partySearch])

  const filteredAgencies = useMemo(() => {
    const search = partySearch.trim().toLowerCase()

    return agencies
      .filter((agency) => agency.is_active)
      .filter((agency) => {
        if (!search) return true

        return agency.name
          .toLowerCase()
          .includes(search)
      })
      .slice(0, 20)
  }, [agencies, partySearch])

  const selectedAgent = useMemo(
    () =>
      agents.find(
        (agent) => agent.id === agentId,
      ) ?? null,
    [agents, agentId],
  )

  const selectedAgency = useMemo(
    () =>
      agencies.find(
        (agency) => agency.id === agencyId,
      ) ?? null,
    [agencies, agencyId],
  )

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount.")
      return
    }

    if (!transactionDate) {
      setError("Transaction date is required.")
      return
    }

    if (partyType === "agent" && !agentId) {
      setError("Please select an agent.")
      return
    }

    if (partyType === "agency" && !agencyId) {
      setError("Please select an agency.")
      return
    }

    const input: CreateTransactionInput = {
      type,
      amount: numericAmount,
      transaction_date: transactionDate,
      description,
      payment_method: paymentMethod,
      reference_no: referenceNo,
      party_type: partyType,

      agent_id:
        partyType === "agent"
          ? agentId
          : null,

      agency_id:
        partyType === "agency"
          ? agencyId
          : null,
    }

    try {
      setLoading(true)
      setError(null)

      const saved =
        await createTransaction(input)

      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      console.error(
        "Failed to create transaction:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save transaction.",
      )
    } finally {
      setLoading(false)
    }
  }

  const transactionLabel =
    type === "income"
      ? "Income"
      : "Expense"

  const selectedPartyName =
    partyType === "agent"
      ? selectedAgent?.name
      : selectedAgency?.name

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add {transactionLabel}
          </DialogTitle>

          <DialogDescription>
            Record a new {type} transaction.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Party Type */}

          <div className="space-y-2">
            <Label>Party</Label>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={
                  partyType === "agent"
                    ? "default"
                    : "outline"
                }
                className="h-11 justify-center gap-2"
                onClick={() =>
                  setPartyType("agent")
                }
                disabled={loading}
              >
                <UserRound className="size-4" />
                Agent
              </Button>

              <Button
                type="button"
                variant={
                  partyType === "agency"
                    ? "default"
                    : "outline"
                }
                className="h-11 justify-center gap-2"
                onClick={() =>
                  setPartyType("agency")
                }
                disabled={loading}
              >
                <Building2 className="size-4" />
                Agency
              </Button>
            </div>
          </div>

          {/* Party Search */}

          <div className="space-y-2">
            <Label>
              {partyType === "agent"
                ? "Select Agent"
                : "Select Agency"}
            </Label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={partySearch}
                onChange={(event) =>
                  setPartySearch(
                    event.target.value,
                  )
                }
                placeholder={
                  partyType === "agent"
                    ? "Search agent..."
                    : "Search agency..."
                }
                className="pl-9"
                disabled={loading}
              />
            </div>

            <div className="max-h-44 overflow-y-auto rounded-lg border">
              {partyType === "agent" ? (
                filteredAgents.length ? (
                  <div className="divide-y">
                    {filteredAgents.map(
                      (agent) => {
                        const selected =
                          agent.id === agentId

                        return (
                          <button
                            key={agent.id}
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              setAgentId(
                                agent.id,
                              )
                              setError(null)
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50 ${
                              selected
                                ? "bg-muted"
                                : ""
                            }`}
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                              <UserRound className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {agent.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {agent.code}
                              </p>
                            </div>

                            {selected ? (
                              <Check className="size-4 shrink-0" />
                            ) : null}
                          </button>
                        )
                      },
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No agents found.
                  </div>
                )
              ) : filteredAgencies.length ? (
                <div className="divide-y">
                  {filteredAgencies.map(
                    (agency) => {
                      const selected =
                        agency.id === agencyId

                      return (
                        <button
                          key={agency.id}
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            setAgencyId(
                              agency.id,
                            )
                            setError(null)
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50 ${
                            selected
                              ? "bg-muted"
                              : ""
                          }`}
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Building2 className="size-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {agency.name}
                            </p>
                          </div>

                          {selected ? (
                            <Check className="size-4 shrink-0" />
                          ) : null}
                        </button>
                      )
                    },
                  )}
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No agencies found.
                </div>
              )}
            </div>

            {selectedPartyName ? (
              <p className="text-xs text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedPartyName}
                </span>
              </p>
            ) : null}
          </div>

          {/* Amount */}

          <div className="space-y-2">
            <Label htmlFor="quick-transaction-amount">
              Amount
            </Label>

            <Input
              id="quick-transaction-amount"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value,
                )
              }
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Payment Method */}

          <div className="space-y-2">
            <Label>
              Payment Method
            </Label>

            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(
                  value as PaymentMethod,
                )
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>

              <SelectContent>
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

          {/* Date */}

          <div className="space-y-2">
            <Label htmlFor="quick-transaction-date">
              Date
            </Label>

            <Input
              id="quick-transaction-date"
              type="date"
              value={transactionDate}
              onChange={(event) =>
                setTransactionDate(
                  event.target.value,
                )
              }
              disabled={loading}
            />
          </div>

          {/* Description */}

          <div className="space-y-2">
            <Label htmlFor="quick-transaction-description">
              Description
            </Label>

            <Input
              id="quick-transaction-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Transaction description"
              disabled={loading}
            />
          </div>

          {/* Reference */}

          <div className="space-y-2">
            <Label htmlFor="quick-transaction-reference">
              Reference
            </Label>

            <Input
              id="quick-transaction-reference"
              value={referenceNo}
              onChange={(event) =>
                setReferenceNo(
                  event.target.value,
                )
              }
              placeholder="Reference number"
              disabled={loading}
            />
          </div>

          {/* Error */}

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {/* Submit */}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : `Add ${transactionLabel}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}