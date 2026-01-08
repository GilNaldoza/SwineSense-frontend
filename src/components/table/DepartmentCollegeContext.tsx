import * as React from "react"

type DepartmentCollegeContextType = {
  college: string
  setCollege: (c: string) => void
  department: string
  setDepartment: (d: string) => void
}

const DepartmentCollegeContext = React.createContext<DepartmentCollegeContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useDepartmentCollegeFilter() {
  const c = React.useContext(DepartmentCollegeContext)
  if (!c) throw new Error("useDepartmentCollegeFilter must be used within DepartmentCollegeProvider")
  return c
}

export default function DepartmentCollegeProvider({ children }: { children: React.ReactNode }) {
  const [college, setCollege] = React.useState("")
  const [department, setDepartment] = React.useState("")

  const handleSetCollege = (c: string) => {
    setCollege(c)
    // Clear department if college changes
    setDepartment("")
  }

  return (
    <DepartmentCollegeContext.Provider 
      value={{ 
        college, 
        setCollege: handleSetCollege, 
        department, 
        setDepartment 
      }}
    >
      {children}
    </DepartmentCollegeContext.Provider>
  )
}
