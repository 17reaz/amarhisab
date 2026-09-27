import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { toast } from "sonner"

import "./index.css"
import App from "./app/App"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const updateSW = registerSW({
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)
  },

  onOfflineReady() {
    console.log("AmarHisab is ready to work offline")
  },

  onNeedRefresh() {
    toast("A new version of AmarHisab is available", {
      duration: Infinity,
      action: {
        label: "Update",
        onClick: async () => {
          await updateSW(true)
          window.location.reload()
        },
      },
    })
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)