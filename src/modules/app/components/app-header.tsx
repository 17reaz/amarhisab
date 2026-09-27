import { Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "@/modules/app/components/ui/connection-status"
import { AppMenuSheet } from "./app-menu-sheet"
import { GlobalSearch } from "./global-search"
interface AppHeaderProps {
  title: string
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-3">
        <AppMenuSheet
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          }
        />

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold">
          {title}
        </h1>
          <div className="flex items-center gap-2">
        <ConnectionStatus />
       <GlobalSearch
  trigger={
    <Button
      variant="ghost"
      size="icon"
      className="size-10 rounded-full"
      aria-label="Open global search"
    >
      <Search className="size-5" />
    </Button>
  }
/>
        </div>
      </div>
    </header>
  )
}