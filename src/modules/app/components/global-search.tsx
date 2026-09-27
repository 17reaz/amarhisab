import { useMemo, useState, type ReactNode } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface GlobalSearchProps {
  trigger: ReactNode
}

const items = [
  {
    label: "Dashboard",
    keywords: "home dashboard",
    path: "/app",
  },
  {
    label: "Transactions",
    keywords: "transaction income expense ledger",
    path: "/app/transactions",
  },
  {
    label: "Agents",
    keywords: "agent statement",
    path: "/app/agents",
  },
  {
    label: "Agencies",
    keywords: "agency statement",
    path: "/app/agencies",
  },
  {
    label: "Parties",
    keywords: "party customer vendor",
    path: "/app/parties",
  },
  {
    label: "Reports",
    keywords: "report profit loss statement",
    path: "/app/reports",
  },
  {
    label: "Profile",
    keywords: "profile account",
    path: "/app/profile",
  },
  {
    label: "Settings",
    keywords: "settings configuration",
    path: "/app/settings",
  },
]

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()

    if (!value) {
      return items
    }

    return items.filter((item) =>
      `${item.label} ${item.keywords}`
        .toLowerCase()
        .includes(value),
    )
  }, [query])

  function handleOpenChange(value: boolean) {
    setOpen(value)

    if (!value) {
      setQuery("")
    }
  }

  function handleSelect(path: string) {
    setOpen(false)
    setQuery("")
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>

      <DialogContent className="top-[18%] max-w-lg translate-y-0 gap-0 p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">
            Global search
          </DialogTitle>

          <div className="flex items-center gap-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />

            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search AmarHisab..."
              className="border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.path}
                type="button"
                className="flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm hover:bg-muted"
                onClick={() => handleSelect(item.path)}
              >
                {item.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}