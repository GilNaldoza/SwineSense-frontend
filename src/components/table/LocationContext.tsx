import * as React from "react"

type LocationContextType = {
  location: string
  setLocation: (loc: string) => void
}

const LocationContext = React.createContext<LocationContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useLocationFilter() {
  const c = React.useContext(LocationContext)
  if (!c) throw new Error("useLocationFilter must be used within LocationProvider")
  return c
}

export default function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = React.useState("")
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  )
}
