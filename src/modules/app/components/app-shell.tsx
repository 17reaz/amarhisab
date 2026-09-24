import type { ReactNode } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { useAppSync } from "@/lib/sync/use-app-sync"

import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children?: ReactNode
  title?: string
}

const routeTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/agents": "Agents",
  "/app/agencies": "Agencies",
  "/app/transactions": "Transactions",
  "/app/reports": "Reports",
  "/app/parties": "Parties",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
}

export function AppShell({
  children,
  title,
}: AppShellProps) {
  useAppSync()

  const location = useLocation()

  const currentTitle =
    title ??
    routeTitles[location.pathname] ??
    "AmarHisab"

  return (
    <div className="min-h-svh bg-background">
      <AppHeader title={currentTitle} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4">
        {children ?? <Outlet />}
      </main>

      <BottomNav />
    </div>
  )
}