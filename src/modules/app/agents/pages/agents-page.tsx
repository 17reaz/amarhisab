import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, RefreshCw, Search, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { AppShell } from "../../components/app-shell"
import { PageHeader } from "../../components/page-header"
import { AgentSheet } from "../components/agent-sheet"
import {
  getAgents,
  setAgentActive,
} from "../services/agent-service"
import type { Agent } from "../types/agent"

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] =
    useState<Agent | null>(null)
  const navigate = useNavigate()
  const loadAgents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const data = await getAgents()

      setAgents(data)
    } catch (err) {
      console.error("Failed to load agents:", err)

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
    loadAgents()
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
    <AppShell title="Agents">
      <div className="space-y-5">
        <PageHeader
          title="Agents"
          description="Manage your agents"
          action={
            <Button
              size="icon"
              className="size-10 rounded-full"
              onClick={handleAdd}
              aria-label="Add agent"
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
            placeholder="Search agents..."
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
              onClick={() => loadAgents(true)}
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
            onClick={() => loadAgents(true)}
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
            {filteredAgents.map((agent) => (
              <div
  key={agent.id}
  className="cursor-pointer rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
  onClick={() =>
    navigate(`/app/agents/${agent.id}`)
  }
>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {String(agent.sl).padStart(3, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {agent.name}
                        </h3>

                        {agent.phone ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {agent.phone}
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
  handleEdit(agent)
}}
                        aria-label={`Edit ${agent.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={(event) => {
  event.stopPropagation()
  handleToggleActive(agent)
}}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`size-2.5 rounded-full ${
                            agent.is_active
                              ? "bg-emerald-500"
                              : "bg-muted-foreground"
                          }`}
                        />

                        <span
                          className={`text-xs font-medium ${
                            agent.is_active
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {agent.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </button>

                      <span className="text-xs text-muted-foreground">
                        SL #{agent.sl}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AgentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          agent={selectedAgent}
          onSaved={handleSaved}
        />
      </div>
    </AppShell>
  )
}