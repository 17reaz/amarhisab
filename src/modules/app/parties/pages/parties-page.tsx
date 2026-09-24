import {
  Building2,
  Search,
  UserRound,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import { Input } from "@/components/ui/input"

import { AppShell } from "../../components/app-shell"
import { getParties } from "../services/party-service"
import type { Party } from "../types/party"

export function PartiesPage() {
  const [parties, setParties] =
    useState<Party[]>([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function loadParties() {
      try {
        setLoading(true)
        setError(null)

        const data = await getParties()

        if (mounted) {
          setParties(data)
        }
      } catch (err) {
        console.error(
          "Failed to load parties:",
          err,
        )

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load parties.",
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadParties()

    return () => {
      mounted = false
    }
  }, [])

  const filteredParties = useMemo(() => {
    const query =
      search.trim().toLowerCase()

    if (!query) {
      return parties
    }

    return parties.filter((party) => {
      return (
        party.name
          .toLowerCase()
          .includes(query) ||
        party.type
          .toLowerCase()
          .includes(query) ||
        party.phone
          ?.toLowerCase()
          .includes(query)
      )
    })
  }, [parties, search])

  const handlePartyClick = (party: Party) => {
    if (party.type === "agent") {
      navigate(`/app/agents/${party.id}`)
      return
    }

    navigate(`/app/agencies/${party.id}`)
  }

  return (
    <AppShell title="Parties">
      {/* Sticky search — always stuck below AppHeader */}
      <div className="sticky top-14 z-30 -mx-4 mb-4 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search parties..."
            className="h-11 rounded-lg pl-9 pr-3"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Loading */}
        {loading && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading parties...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="py-8 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredParties.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search.trim()
                ? "No parties found."
                : "No parties available."}
            </p>
          )}

        {/* Parties */}
        {!loading &&
          !error &&
          filteredParties.length > 0 && (
            <div className="divide-y rounded-lg border">
              {filteredParties.map((party) => {
  const Icon =
    party.type === "agent"
      ? UserRound
      : Building2

  return (
    <button
      key={party.key}
      type="button"
      onClick={() =>
        handlePartyClick(party)
      }
      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
    >
      {/* Icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4" />
      </div>

      {/* Party info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {party.name}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {party.type === "agent"
            ? "Agent"
            : "Agency"}

          {party.phone
            ? ` • ${party.phone}`
            : ""}
        </p>
      </div>

      {/* Last transaction + count */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-medium text-muted-foreground">
          {party.lastTransactionDate
            ? new Date(
                `${party.lastTransactionDate}T00:00:00`,
              ).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )
            : "No transaction"}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {party.transactionCount}{" "}
          {party.transactionCount === 1
            ? "txn"
            : "txns"}
        </p>
      </div>
    </button>
  )
})}
            </div>
          )}
      </div>
    </AppShell>
  )
}