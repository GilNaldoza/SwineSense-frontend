import * as React from "react"

type DateRangeContextType = {
  startDate: string | undefined
  endDate: string | undefined
  setDateRange: (start?: string, end?: string) => void
}

const DateRangeContext = React.createContext<DateRangeContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useDateRangeFilter() {
  const c = React.useContext(DateRangeContext)
  if (!c) throw new Error("useDateRangeFilter must be used within DateRangeProvider")
  return c
}

export default function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined)

  const setDateRange = (start?: string, end?: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <DateRangeContext.Provider value={{ startDate, endDate, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  )
}
