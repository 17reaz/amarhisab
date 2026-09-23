import { useEffect, useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  createAgency,
  updateAgency,
} from "../services/agency-service"
import type { Agency } from "../types/agency"

interface AgencySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agency?: Agency | null
  onSaved: (agency: Agency) => void
}

export function AgencySheet({
  open,
  onOpenChange,
  agency,
  onSaved,
}: AgencySheetProps) {
  const isEdit = Boolean(agency)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!open) return

    setName(agency?.name ?? "")
    setPhone(agency?.phone ?? "")
    setError(null)
  }, [open, agency])

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Agency name is required.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const savedAgency = isEdit
        ? await updateAgency(agency!.id, {
            name: trimmedName,
            phone,
          })
        : await createAgency({
            name: trimmedName,
            phone,
          })

      onSaved(savedAgency)
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save agency:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save agency.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit Agency" : "Add Agency"}
          </SheetTitle>

          <SheetDescription>
            {isEdit
              ? "Update the agency information."
              : "Add a new agency to your records."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 px-4 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="agency-name">
              Name
            </Label>

            <Input
              id="agency-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Agency name"
              autoComplete="organization"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agency-phone">
              Phone number
            </Label>

            <Input
              id="agency-phone"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="01XXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
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
                ? "Update Agency"
                : "Save Agency"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}