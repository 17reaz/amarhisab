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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  createTransaction,
  updateTransaction,
} from "../services/transaction-service"
import type {
  CreateTransactionInput,
  PaymentMethod,
  PartyType,
  Transaction,
  TransactionType,
} from "../types/transaction"

import type { Agent } from "../../agents/types/agent"
import type { Agency } from "../../agencies/types/agency"

interface TransactionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  agents: Agent[]
  agencies: Agency[]
  onSaved: (transaction: Transaction) => void
}

export function TransactionSheet({
  open,
  onOpenChange,
  transaction,
  agents,
  agencies,
  onSaved,
}: TransactionSheetProps) {
  const isEdit = Boolean(transaction)

  const [type, setType] =
    useState<TransactionType>("income")

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

    setType(transaction?.type ?? "income")

    setAmount(
      transaction
        ? String(transaction.amount)
        : "",
    )

    setPaymentMethod(
      transaction?.payment_method ?? "cash",
    )

    setPartyType(
      transaction?.party_type ?? "agent",
    )

    setAgentId(transaction?.agent_id ?? "")
    setAgencyId(transaction?.agency_id ?? "")

    setDescription(
      transaction?.description ?? "",
    )

    setReferenceNo(
      transaction?.reference_no ?? "",
    )

    setTransactionDate(
      transaction?.transaction_date ??
        new Date().toISOString().slice(0, 10),
    )

    setError(null)
  }, [open, transaction])

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

      const saved = isEdit
        ? await updateTransaction(
            transaction!.id,
            input,
          )
        : await createTransaction(input)

      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      console.error(
        "Failed to save transaction:",
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

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>
            {isEdit
              ? "Edit Transaction"
              : "Add Transaction"}
          </SheetTitle>

          <SheetDescription>
            Record an income or expense transaction.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 px-4 pb-6"
        >
          {/* Type */}

          <div className="space-y-2">
            <Label>Type</Label>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={
                  type === "income"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setType("income")
                }
                disabled={loading}
              >
                Income
              </Button>

              <Button
                type="button"
                variant={
                  type === "expense"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setType("expense")
                }
                disabled={loading}
              >
                Expense
              </Button>
            </div>
          </div>

          {/* Amount */}

          <div className="space-y-2">
            <Label htmlFor="transaction-amount">
              Amount
            </Label>

            <Input
              id="transaction-amount"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              disabled={loading}
            />
          </div>

          {/* Payment Method */}

          <div className="space-y-2">
            <Label>Payment Method</Label>

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

          {/* Party */}

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
                <SelectValue />
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
                        {String(agent.sl).padStart(
                          4,
                          "0",
                        )}{" "}
                        — {agent.name}
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
                        {String(agency.sl).padStart(
                          4,
                          "0",
                        )}{" "}
                        — {agency.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Description */}

          <div className="space-y-2">
            <Label htmlFor="transaction-description">
              Description
            </Label>

            <Input
              id="transaction-description"
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
            <Label htmlFor="transaction-reference">
              Reference
            </Label>

            <Input
              id="transaction-reference"
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

          {/* Date */}

          <div className="space-y-2">
            <Label htmlFor="transaction-date">
              Date
            </Label>

            <Input
              id="transaction-date"
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

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Transaction"
                : "Save Transaction"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}