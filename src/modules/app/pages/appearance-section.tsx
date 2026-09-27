import { Check, Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"

const themes = [
  {
    value: "light" as const,
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark" as const,
    label: "Dark",
    icon: Moon,
  },
  {
    value: "system" as const,
    label: "System",
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

      <CardContent className="border-t p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Choose how AmarHisab looks on this device.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {themes.map((item) => {
            const Icon = item.icon
            const active = theme === item.value

            return (
              <Button
                key={item.value}
                type="button"
                variant={active ? "default" : "outline"}
                className="h-12 flex-col gap-1"
                onClick={() => setTheme(item.value)}
              >
                <Icon className="size-4" />
                <span className="text-xs">{item.label}</span>

                {active && <Check className="sr-only" />}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}