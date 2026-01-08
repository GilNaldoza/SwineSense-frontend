
import * as React from "react"

export type SectionKey = "All" | "Students" | "Faculties" | "Status" | "Analytics" | "Archive" | "Staff"

type LayoutContextType = {
  section: SectionKey
  setSection: (s: SectionKey) => void
}

const LayoutContext = React.createContext<LayoutContextType | undefined>(undefined)

export const LayoutProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [section, setSectionState] = React.useState<SectionKey>(() => {
    try {
      const saved = localStorage.getItem('lens:section') as SectionKey | null
      if (saved === 'All' || saved === 'Students' || saved === 'Faculties' || saved === 'Status' || saved === 'Analytics' || saved === 'Archive' || saved === 'Staff') {
        return saved
      }
    } catch {
      /* ignore restore errors */
    }
    return 'All'
  })

  const setSection = React.useCallback((s: SectionKey) => {
    setSectionState(s)
    try { localStorage.setItem('lens:section', s) } catch {
      /* ignore persist errors */
    }
  }, [])

  return (
    <LayoutContext.Provider value={{ section, setSection }}>
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContext
