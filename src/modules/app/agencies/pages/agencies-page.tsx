import { useEffect, useMemo, useState } from "react"
import {
  Pencil,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../../components/app-shell"
import { PageHeader } from "../../components/page-header"
import { AgencySheet } from "../components/agency-sheet"
import {
  getAgencies,
  getAgencyBalance,
  setAgencyActive,
} from "../services/agency-service"
import type { Agency } from "../types/agency"

export function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] =
    useState<Agency | null>(null)
    const [agencyBalances, setAgencyBalances] =
  useState<Record<string, number>>({})
  const navigate = useNavigate()
  const loadAgencies = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const data = await getAgencies()

const balanceEntries = await Promise.all(
  data.map(async (agency) => {
    const balance = await getAgencyBalance(
      agency.id,
    )

    return [agency.id, balance] as const
  }),
)

setAgencies(data)
setAgencyBalances(
  Object.fromEntries(balanceEntries),
)
    } catch (err) {
      console.error("Failed to load agencies:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load agencies.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAgencies()
  }, [])

  const filteredAgencies = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return agencies
    }

    return agencies.filter((agency) => {
      return (
        agency.name.toLowerCase().includes(query) ||
        agency.phone?.toLowerCase().includes(query) ||
        String(agency.sl).includes(query)
      )
    })
  }, [agencies, search])

  const handleAdd = () => {
    setSelectedAgency(null)
    setSheetOpen(true)
  }

  const handleEdit = (agency: Agency) => {
    setSelectedAgency(agency)
    setSheetOpen(true)
  }

  const handleSaved = (savedAgency: Agency) => {
    setAgencies((current) => {
      const exists = current.some(
        (agency) => agency.id === savedAgency.id,
      )

      if (exists) {
        return current.map((agency) =>
          agency.id === savedAgency.id
            ? savedAgency
            : agency,
        )
      }

      return [...current, savedAgency].sort(
        (a, b) => a.sl - b.sl,
      )
    })
  }

  const handleToggleActive = async (
    agency: Agency,
  ) => {
    try {
      setError(null)

      const updatedAgency = await setAgencyActive(
        agency.id,
        !agency.is_active,
      )

      setAgencies((current) =>
        current.map((item) =>
          item.id === updatedAgency.id
            ? updatedAgency
            : item,
        ),
      )
    } catch (err) {
      console.error(
        "Failed to update agency status:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update agency status.",
      )
    }
  }

  return (
    <AppShell title="Agencies">
      <div className="space-y-5">
        <PageHeader
          title="Agencies"
          description="Manage your agencies"
          action={
            <Button
              size="icon"
              className="size-10 rounded-full"
              onClick={handleAdd}
              aria-label="Add agency"
            >
              <Plus className="size-5" />
            </Button>
          }
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search agencies..."
            className="h-11 pl-9 pr-3"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => loadAgencies(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 size-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Retry
            </Button>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading agencies..."
              : `${filteredAgencies.length} ${
                  filteredAgencies.length === 1
                    ? "agency"
                    : "agencies"
                }`}
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2"
            onClick={() => loadAgencies(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 size-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border bg-muted/40"
              />
            ))}
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-medium">
              {search
                ? "No agencies found"
                : "No agencies yet"}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try a different search."
                : "Add your first agency to get started."}
            </p>

            {!search ? (
              <Button
                className="mt-4"
                onClick={handleAdd}
              >
                <Plus className="mr-2 size-4" />
                Add Agency
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgencies.map((agency) => (
              <div
  key={agency.id}
  className="cursor-pointer rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
  onClick={() =>
    navigate(`/app/agencies/${agency.id}`)
  }
><div className="mb-3 flex items-center justify-between">
  <div>
    <p className="text-xs text-muted-foreground">
      Balance
    </p>

    <p
  className={`text-lg font-bold tracking-tight ${
    (agencyBalances[agency.id] ?? 0) < 0
      ? "text-destructive"
      : "text-foreground"
  }`}
>
  {(agencyBalances[agency.id] ?? 0) < 0
    ? "−"
    : ""}

  ৳
  {Math.abs(
    agencyBalances[agency.id] ?? 0,
  ).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}
</p>
  </div>

  <span className="text-xs text-muted-foreground">
    Current
  </span>
</div>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {String(agency.sl).padStart(3, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {agency.name}
                        </h3>

                        {agency.phone ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {agency.phone}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                            No phone number
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0"
                        onClick={(event) => {
  event.stopPropagation()
  handleEdit(agency)
}}
                        aria-label={`Edit ${agency.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={(event) => {
  event.stopPropagation()
  handleToggleActive(agency)
}}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`size-2.5 rounded-full ${
                            agency.is_active
                              ? "bg-emerald-500"
                              : "bg-muted-foreground"
                          }`}
                        />

                        <span
                          className={`text-xs font-medium ${
                            agency.is_active
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {agency.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </button>

                      <span className="text-xs text-muted-foreground">
                        SL #{agency.sl}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AgencySheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          agency={selectedAgency}
          onSaved={handleSaved}
        />
      </div>
    </AppShell>
  )
}