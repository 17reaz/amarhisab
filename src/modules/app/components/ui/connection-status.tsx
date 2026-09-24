import { AnimatePresence, motion } from "motion/react"
import {
  Check,
  Loader2,
  WifiOff,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import {
  getConnectionStatus,
  subscribeConnectionStatus,
  type ConnectionStatus,
} from "@/lib/sync/connection-status"

const statusConfig: Record<
  ConnectionStatus,
  {
    label: string
    icon: typeof Check
  }
> = {
  connected: {
    label: "Connected",
    icon: Check,
  },
  syncing: {
    label: "Syncing...",
    icon: Loader2,
  },
  disconnected: {
    label: "Not connected",
    icon: WifiOff,
  },
}

export function ConnectionStatus() {
  const [status, setStatus] =
    useState<ConnectionStatus>(
      getConnectionStatus(),
    )

  const [showText, setShowText] = useState(false)

  const firstRender = useRef(true)
  const hideTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  useEffect(() => {
    return subscribeConnectionStatus((nextStatus) => {
      setStatus(nextStatus)

      // Status change হলে text show হবে
      setShowText(true)

      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }

      // কিছুক্ষণ পরে text hide
      hideTimer.current = setTimeout(() => {
        setShowText(false)
      }, 2200)
    })
  }, [])

  useEffect(() => {
    // Initial render-এ text দেখাবে না
    if (firstRender.current) {
      firstRender.current = false
      return
    }
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
    }
  }, [])

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      layout
      className="flex h-8 items-center overflow-hidden rounded-full border bg-background"
      transition={{
        layout: {
          duration: 0.25,
          ease: "easeOut",
        },
      }}
    >
      <motion.div
        layout
        className="flex size-8 shrink-0 items-center justify-center"
      >
        <motion.span
          animate={
            status === "connected"
              ? {
                  scale: [1, 1.12, 1],
                }
              : undefined
          }
          transition={
            status === "connected"
              ? {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : undefined
          }
        >
          <Icon
            className={`size-3.5 text-muted-foreground ${
              status === "syncing"
                ? "animate-spin"
                : ""
            }`}
          />
        </motion.span>
      </motion.div>

      <AnimatePresence initial={false}>
        {showText && (
          <motion.span
            initial={{
              opacity: 0,
              width: 0,
              x: 12,
            }}
            animate={{
              opacity: 1,
              width: "auto",
              x: 0,
            }}
            exit={{
              opacity: 0,
              width: 0,
              x: -8,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="overflow-hidden whitespace-nowrap pr-2 text-xs font-medium text-muted-foreground"
          >
            {config.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}