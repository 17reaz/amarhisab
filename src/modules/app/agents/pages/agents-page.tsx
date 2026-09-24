import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react"

import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"

import { PageHeader } from "../../components/page-header"
import { PartyCard } from "../../components/ui/party-card"
import { AgentSheet } from "../components/agent-sheet"

import {
  getAgentStats,
  getAgents,
  setAgentActive,
} from "../services/agent-service"

import type { AgentStats } from "../services/agent-service"
import type { Agent } from "../types/agent"

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] =
    useState<Agent | null>(null)

  const [agentStats, setAgentStats] =
    useState<Record<string, AgentStats>>({})

  const navigate = useNavigate()

  const loadAgents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        const cachedAgents = await db.agents
          .filter((agent) => agent.is_active)
          .toArray()

        setLoading(cachedAgents.length === 0)
      }

      setError(null)

      const data = await getAgents()

      const statsEntries = await Promise.all(
        data.map(async (agent) => {
          const stats = await getAgentStats(agent.id)

          return [agent.id, stats] as const
        }),
      )

      setAgents(data)
      setAgentStats(Object.fromEntries(statsEntries))
    } catch (err) {
      console.error(
        "Failed to load agents:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load agents.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadAgents()
  }, [])

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return agents
    }

    return agents.filter((agent) => {
      return (
        agent.name.toLowerCase().includes(query) ||
        agent.phone?.toLowerCase().includes(query) ||
        String(agent.sl).includes(query)
      )
    })
  }, [agents, search])

  const handleAdd = () => {
    setSelectedAgent(null)
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

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent)
    setSheetOpen(true)
  }

  const handleSaved = (savedAgent: Agent) => {
    setAgents((current) => {
      const exists = current.some(
        (agent) => agent.id === savedAgent.id,
      )

      if (exists) {
        return current.map((agent) =>
          agent.id === savedAgent.id
            ? savedAgent
            : agent,
        )
      }

      return [...current, savedAgent].sort(
        (a, b) => a.sl - b.sl,
      )
    })
  }

  const handleToggleActive = async (
    agent: Agent,
  ) => {
    try {
      setError(null)

      const updatedAgent = await setAgentActive(
        agent.id,
        !agent.is_active,
      )

      setAgents((current) =>
        current.map((item) =>
          item.id === updatedAgent.id
            ? updatedAgent
            : item,
        ),
      )
    } catch (err) {
      console.error(
        "Failed to update agent status:",
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update agent status.",
      )
    }
  }

  return (
    <>
      <div className="sticky top-14 z-30 -mx-4 mb-5 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <PageHeader
          title="Agents"
          description="Manage your agents"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant={
                  searchOpen ? "secondary" : "ghost"
                }
                size="icon"
                className="size-10 rounded-full"
                onClick={handleToggleSearch}
                aria-label="Search agents"
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
                aria-label="Add agent"
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search agents..."
              className="h-11 pl-9 pr-3"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void loadAgents(true)}
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
              ? "Loading agents..."
              : `${filteredAgents.length} ${
                  filteredAgents.length === 1
                    ? "agent"
                    : "agents"
                }`}
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2"
            onClick={() => void loadAgents(true)}
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
        ) : filteredAgents.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-medium">
              {search
                ? "No agents found"
                : "No agents yet"}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try a different search."
                : "Add your first agent to get started."}
            </p>

            {!search ? (
              <Button
                className="mt-4"
                onClick={handleAdd}
              >
                <Plus className="mr-2 size-4" />
                Add Agent
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgents.map((agent) => {
              const stats = agentStats[agent.id]

              return (
                <PartyCard
                  key={agent.id}
                  sl={agent.sl}
                  name={agent.name}
                  phone={agent.phone}
                  isActive={agent.is_active}
                  balance={stats?.balance ?? 0}
                  income={stats?.income ?? 0}
                  expense={stats?.expense ?? 0}
                  transactionCount={
                    stats?.transactionCount ?? 0
                  }
                  lastActivityDate={
                    stats?.lastTransactionDate ?? null
                  }
                  onClick={() =>
                    navigate(
                      `/app/agents/${agent.id}`,
                    )
                  }
                  onEdit={() =>
                    handleEdit(agent)
                  }
                  onToggleActive={() =>
                    void handleToggleActive(agent)
                  }
                />
              )
            })}
          </div>
        )}

        <AgentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          agent={selectedAgent}
          onSaved={handleSaved}
        />
      </div>
    </>
  )
}