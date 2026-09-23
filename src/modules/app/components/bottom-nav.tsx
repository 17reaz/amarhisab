import { MoreHorizontal } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

import { mainNavigation } from "../config/navigation"
import { AppMenuSheet } from "./app-menu-sheet"

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid h-16 w-full max-w-2xl grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {mainNavigation.map((item) => {
          const Icon = item.icon
          const active =
            location.pathname === item.href ||
            (item.href !== "/app" &&
              location.pathname.startsWith(`${item.href}/`))

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={`flex h-full flex-col gap-1 rounded-none px-1 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => navigate(item.href)}
            >
              <Icon className="size-5" />

              <span className="text-[11px] font-medium">
                {item.label}
              </span>
            </Button>
          )
        })}

        <AppMenuSheet
          trigger={
            <Button
              variant="ghost"
              className="flex h-full w-full flex-col gap-1 rounded-none px-1 text-muted-foreground"
            >
              <MoreHorizontal className="size-5" />

              <span className="text-[11px] font-medium">
                More
              </span>
            </Button>
          }
        />
      </div>
    </nav>
  )
}