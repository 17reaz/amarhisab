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

  return (
    <AppShell title="Parties">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search parties..."
            className="pl-9"
          />
        </div>

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
                  <div
                    key={party.key}
                    className="flex items-center gap-3 p-4"
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

                    {/* Last transaction */}
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>
    </AppShell>
  )
}