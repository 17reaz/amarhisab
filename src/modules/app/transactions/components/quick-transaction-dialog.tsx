import { useEffect, useState } from "react"
import type { FormEvent } from "react"

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

  const [description, setDescription] = useState("")
  const [referenceNo, setReferenceNo] = useState("")

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

    setDescription("")
    setReferenceNo("")

    setTransactionDate(
      new Date().toISOString().slice(0, 10),
    )

    setError(null)
  }, [open, type])

  useEffect(() => {
    if (partyType === "agent") {
      setAgencyId("")
    } else {
      setAgentId("")
    }
  }, [partyType])

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

            <Select
              value={partyType}
              onValueChange={(value) =>
                setPartyType(
                  value as PartyType,
                )
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select party" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="agent">
                  Agent
                </SelectItem>

                <SelectItem value="agency">
                  Agency
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent */}

          {partyType === "agent" ? (
            <div className="space-y-2">
              <Label>Agent</Label>

              <Select
                value={agentId}
                onValueChange={(value) => setAgentId(value ?? "")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>

                <SelectContent>
                  {agents
                    .filter(
                      (agent) =>
                        agent.is_active,
                    )
                    .map((agent) => (
                      <SelectItem
                        key={agent.id}
                        value={agent.id}
                      >
                        {agent.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Agency */}

          {partyType === "agency" ? (
            <div className="space-y-2">
              <Label>Agency</Label>

              <Select
                value={agencyId}
                onValueChange={(value) => setAgencyId(value ?? "")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agency" />
                </SelectTrigger>

                <SelectContent>
                  {agencies
                    .filter(
                      (agency) =>
                        agency.is_active,
                    )
                    .map((agency) => (
                      <SelectItem
                        key={agency.id}
                        value={agency.id}
                      >
                        {agency.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

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