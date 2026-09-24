import { useEffect, useMemo, useState } from "react"
import { Plus, RefreshCw, Search, UserRound, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AppShell } from "../../components/app-shell"
import { PageHeader } from "../../components/page-header"
import { PartyCard } from "../../components/ui/party-card"
import { AgencySheet } from "../components/agency-sheet"
import {
  getAgencies,
  getAgencyStats,
  setAgencyActive,
} from "../services/agency-service"
import type { AgencyStats } from "../services/agency-service"
import type { Agency } from "../types/agency"

export function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
  const [agencyStats, setAgencyStats] =
    useState<Record<string, AgencyStats>>({})

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

      const statsEntries = await Promise.all(
        data.map(async (agency) => {
          const stats = await getAgencyStats(agency.id)
          return [agency.id, stats] as const
        }),
      )

      setAgencies(data)
      setAgencyStats(Object.fromEntries(statsEntries))
    } catch (err) {
      console.error("Failed to load agencies:", err)

      setError(
        err instanceof Error ? err.message : "Failed to load agencies.",
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

  const handleToggleSearch = () => {
    setSearchOpen((current) => {
      const next = !current

      if (!next) {
        setSearch("")
      }

      return next
    })
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
          agency.id === savedAgency.id ? savedAgency : agency,
        )
      }

      return [...current, savedAgency].sort((a, b) => a.sl - b.sl)
    })
  }

  const handleToggleActive = async (agency: Agency) => {
    try {
      setError(null)

      const updatedAgency = await setAgencyActive(
        agency.id,
        !agency.is_active,
      )

      setAgencies((current) =>
        current.map((item) =>
          item.id === updatedAgency.id ? updatedAgency : item,
        ),
      )
    } catch (err) {
      console.error("Failed to update agency status:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update agency status.",
      )
    }
  }

  return (
    <AppShell title="Agencies">
      {/* Sticky page header block — always stuck below AppHeader,
          regardless of whether search is open */}
      <div className="sticky top-14 z-30 -mx-4 mb-5 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <PageHeader
          title="Agencies"
          description="Manage your agencies"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant={searchOpen ? "secondary" : "ghost"}
                size="icon"
                className="size-10 rounded-full"
                onClick={handleToggleSearch}
                aria-label="Search agencies"
                aria-expanded={searchOpen}
              >
                {searchOpen ? (
                  <X className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
              </Button>

              <Button
                size="icon"
                className="size-10 rounded-full"
                onClick={handleAdd}
                aria-label="Add agency"
              >
                <Plus className="size-5" />
              </Button>
            </div>
          }
        />

        {searchOpen ? (
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agencies..."
              className="h-11 pl-9 pr-3"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>

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
                  filteredAgencies.length === 1 ? "agency" : "agencies"
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
              {search ? "No agencies found" : "No agencies yet"}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try a different search."
                : "Add your first agency to get started."}
            </p>

            {!search ? (
              <Button className="mt-4" onClick={handleAdd}>
                <Plus className="mr-2 size-4" />
                Add Agency
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgencies.map((agency) => {
              const stats = agencyStats[agency.id]

              return (
                <PartyCard
                  key={agency.id}
                  sl={agency.sl}
                  name={agency.name}
                  phone={agency.phone}
                  isActive={agency.is_active}
                  balance={stats?.balance ?? 0}
                  income={stats?.income ?? 0}
                  expense={stats?.expense ?? 0}
                  transactionCount={stats?.transactionCount ?? 0}
                  lastActivityDate={stats?.lastTransactionDate ?? null}
                  onClick={() => navigate(`/app/agencies/${agency.id}`)}
                  onEdit={() => handleEdit(agency)}
                  onToggleActive={() => handleToggleActive(agency)}
                />
              )
            })}
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