import { Check, Monitor, Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const themes = [
  {
    value: "light" as const,
    label: "Light",
    description: "Always use light mode",
    icon: Sun,
  },
  {
    value: "dark" as const,
    label: "Dark",
    description: "Always use dark mode",
    icon: Moon,
  },
  {
    value: "system" as const,
    label: "System",
    description: "Follow your device preference",
    icon: Monitor,
  },
]

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {themes.map((item) => {
          const Icon = item.icon
          const selected = theme === item.value

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTheme(item.value)}
              className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {item.label}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>

              {selected ? (
                <Check className="size-4 text-primary" />
              ) : null}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}