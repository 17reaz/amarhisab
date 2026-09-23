import type { ReactNode } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

interface PageToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function PageToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
}: PageToolbarProps) {
  const hasSearch =
    search !== undefined && onSearchChange !== undefined

  return (
    <div className="space-y-3">
      {hasSearch ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder={searchPlaceholder}
            className="h-11 pl-9 pr-3"
          />
        </div>
      ) : null}

      {filters || actions ? (
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {filters}
          </div>

          {actions ? (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}