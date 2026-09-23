import { useEffect, useState } from "react"

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
  createAgent,
  updateAgent,
} from "../services/agent-service"
import type { Agent } from "../types/agent"

interface AgentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent?: Agent | null
  onSaved: (agent: Agent) => void
}

export function AgentSheet({
  open,
  onOpenChange,
  agent,
  onSaved,
}: AgentSheetProps) {
  const isEdit = Boolean(agent)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!open) return

    setName(agent?.name ?? "")
    setPhone(agent?.phone ?? "")
    setError(null)
  }, [open, agent])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Agent name is required.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const savedAgent = isEdit
        ? await updateAgent(agent!.id, {
            name: trimmedName,
            phone,
          })
        : await createAgent({
            name: trimmedName,
            phone,
          })

      onSaved(savedAgent)
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save agent:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save agent.",
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
            {isEdit ? "Edit Agent" : "Add Agent"}
          </SheetTitle>

          <SheetDescription>
            {isEdit
              ? "Update the agent information."
              : "Add a new agent to your agency records."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 px-4 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="agent-name">
              Name
            </Label>

            <Input
              id="agent-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Agent name"
              autoComplete="organization"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-phone">
              Phone number
            </Label>

            <Input
              id="agent-phone"
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
                ? "Update Agent"
                : "Save Agent"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}