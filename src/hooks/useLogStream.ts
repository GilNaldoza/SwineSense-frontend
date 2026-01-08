import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'

// const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export function useLogStream(enabled: boolean = true) {
  const qc = useQueryClient()

  React.useEffect(() => {
    if (!enabled) return

    // Backend v2 log stream endpoint is currently not implemented/exposed.
    // Fallback to polling every 5 seconds to keep the UI fresh.
    const interval = setInterval(() => {
      qc.invalidateQueries({ queryKey: ['entries'] })
    }, 5000)

    return () => clearInterval(interval)
  }, [qc, enabled])
}
