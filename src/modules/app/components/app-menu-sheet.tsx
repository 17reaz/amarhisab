import { useState } from "react"
import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { signOut } from "@/modules/auth/services/auth-service"

import {
  mainNavigation,
  moreNavigation,
} from "../config/navigation"

interface AppMenuSheetProps {
  trigger: ReactNode
}

export function AppMenuSheet({
  trigger,
}: AppMenuSheetProps) {
  const [open, setOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigate = (href: string) => {
    setOpen(false)
    navigate(href)
  }

  const handleLogout = async () => {
    setOpen(false)

    const { error } = await signOut()

    if (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <>
      <span
        className="inline-flex"
        onClick={() => setOpen(true)}
      >
        {trigger}
      </span>

      <Sheet
        open={open}
        onOpenChange={setOpen}
      >
        <SheetContent
          side="left"
          className="w-[82vw] max-w-sm p-0"
        >
          <SheetHeader className="border-b px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                AH
              </div>

              <div className="min-w-0">
                <SheetTitle className="text-left">
                  AmarHisab
                </SheetTitle>

                <p className="text-xs text-muted-foreground">
                  Travel agency finance
                </p>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex flex-col px-3 py-4">
            <div className="space-y-1">
              {mainNavigation.map((item) => {
                const Icon = item.icon
                const active =
                  location.pathname === item.href

                return (
                  <Button
                    key={item.href}
                    variant={active ? "secondary" : "ghost"}
                    className="h-11 w-full justify-start gap-3 px-3"
                    onClick={() =>
                      handleNavigate(item.href)
                    }
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>

            <div className="my-4 border-t" />

            <div className="space-y-1">
              {moreNavigation.map((item) => {
                const Icon = item.icon
                const active =
                  location.pathname === item.href

                return (
                  <Button
                    key={item.href}
                    variant={active ? "secondary" : "ghost"}
                    className="h-11 w-full justify-start gap-3 px-3"
                    onClick={() =>
                      handleNavigate(item.href)
                    }
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>

            <div className="mt-4 border-t pt-4">
              <Button
                variant="ghost"
                className="h-11 w-full justify-start gap-3 px-3 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-5" />
                <span>Logout</span>
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}