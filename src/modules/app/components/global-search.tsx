import { useEffect, useMemo, useState, type ReactNode } from "react"
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

const LAST_SEARCH_KEY = "global-search:last-query"

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return ""
    return window.localStorage.getItem(LAST_SEARCH_KEY) ?? ""
  })

  useEffect(() => {
    try {
      if (query) {
        window.localStorage.setItem(LAST_SEARCH_KEY, query)
      } else {
        window.localStorage.removeItem(LAST_SEARCH_KEY)
      }
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  }, [query])

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
    // query intentionally NOT cleared here, so last search persists
  }

  function handleSelect(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>

      <DialogContent
        className="
          fixed
          left-0
          top-0
          flex
          h-[100dvh]
          w-full
          max-w-none
          translate-x-0
          translate-y-0
          flex-col
          gap-0
          overflow-hidden
          rounded-none
          border-0
          p-0
          sm:left-1/2
          sm:top-[10%]
          sm:h-auto
          sm:max-h-[80dvh]
          sm:w-[calc(100%-2rem)]
          sm:max-w-lg
          sm:translate-x-[-50%]
          sm:translate-y-0
          sm:rounded-xl
          sm:border
        "
      >
        <DialogHeader
          className="
            shrink-0
            border-b
            px-4
            pb-3
            pt-[calc(env(safe-area-inset-top,0px)+1rem)]
            sm:pt-4
          "
        >
          <DialogTitle className="sr-only">
            Global search
          </DialogTitle>

          <div className="flex h-11 items-center gap-3 rounded-lg bg-muted/60 px-3">
            <Search className="size-5 shrink-0 text-muted-foreground" />

            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search AmarHisab..."
              className="
                h-full
                border-0
                bg-transparent
                px-0
                text-base
                shadow-none
                focus-visible:ring-0
              "
            />
          </div>
        </DialogHeader>

        <div
          className="
            flex-1
            overflow-y-auto
            p-2
            pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]
            sm:max-h-80
            sm:flex-none
          "
        >
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.path}
                type="button"
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  rounded-lg
                  px-3
                  text-left
                  text-[15px]
                  active:bg-muted
                  hover:bg-muted
                "
                onClick={() => handleSelect(item.path)}
              >
                {item.label}
              </button>
            ))
          ) : (
            <div className="flex min-h-40 items-center justify-center px-4">
              <p className="text-sm text-muted-foreground">
                No results found.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}