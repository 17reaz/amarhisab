export type ConnectionStatus =
  | "connected"
  | "syncing"
  | "disconnected"

let status: ConnectionStatus = "disconnected"
const listeners = new Set<
  (status: ConnectionStatus) => void
>()

export function getConnectionStatus(): ConnectionStatus {
  return status
}

export function setConnectionStatus(
  nextStatus: ConnectionStatus,
): void {
  if (status === nextStatus) {
    return
  }

  status = nextStatus

  listeners.forEach((listener) => {
    listener(status)
  })
}

export function subscribeConnectionStatus(
  listener: (status: ConnectionStatus) => void,
): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}