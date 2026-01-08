import * as React from "react"

export type YearLevel = "all" | "1" | "2" | "3" | "4" | "5" | string

type YearLevelContextValue = {
  yearLevel: YearLevel
  setYearLevel: (y: YearLevel) => void
}

const YearLevelContext = React.createContext<YearLevelContextValue | undefined>(undefined)

export function useYearLevel() {
  const ctx = React.useContext(YearLevelContext)
  if (!ctx) throw new Error("useYearLevel must be used within YearLevelProvider")
  return ctx
}

// Safe hook that returns context or undefined when provider is absent.
export function useOptionalYearLevel() {
  return React.useContext(YearLevelContext)
}

export default YearLevelContext
