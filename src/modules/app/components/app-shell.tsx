import type { ReactNode } from "react"

import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children: ReactNode
  title?: string
}

export function AppShell({
  children,
  title = "Dashboard",
}: AppShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <AppHeader title={title} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}