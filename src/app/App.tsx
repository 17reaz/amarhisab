import { useEffect } from "react"
import { Toaster, toast } from "sonner"

import { AppRouter } from "./router/index"

function App() {
  useEffect(() => {
    toast.success("AmarHisab is ready")
  }, [])

  return (
    <>
      <AppRouter />

      <Toaster
  position="bottom-center"
  richColors
  closeButton
  duration={3000}
  toastOptions={{
    className: "mb-2",
  }}
/>
    </>
  )
}

export default App