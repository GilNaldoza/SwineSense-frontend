import { useEffect, useRef, useState } from 'react'

type RMProps = { className?: string }

export default function RotatingMessages({ className }: RMProps) {
  const messages = [
    "Admin tip: Use the Records view to review and export today's entries.",
    "Pro tip: Use the search to find students quickly by name or ID.",
    "Shortcut: Filter by date to focus on today's activity for reporting.",
    "Quick task: Export a CSV from the Records tab for your daily log.",
    "Best practice: Use the department filters to isolate specific programs.",
    "Tip: Use the sort controls to group entries by college or year level.",
    "Remember: Keep admin credentials secure and rotate passwords regularly."
  ]

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false)
      // brief delay to allow fade-out
      timeoutRef.current = window.setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length)
        setVisible(true)
      }, 300)
    }, 5000)

    return () => {
      window.clearInterval(interval)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [messages.length])

  return (
    <p
      aria-live="polite"
      className={`${className ?? ''} text-center mt-3 text-sm text-gray-600 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {messages[index]}
    </p>
  )
}
