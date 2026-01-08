import * as React from "react"
import YearLevelContext, { type YearLevel } from "./yearLevelStore"

const YearLevelProvider: React.FC<{ initial?: YearLevel; children?: React.ReactNode }> = ({ initial = "all", children }) => {
  const [yearLevel, setYearLevel] = React.useState<YearLevel>(initial)
  const value = React.useMemo(() => ({ yearLevel, setYearLevel }), [yearLevel])
  return <YearLevelContext.Provider value={value}>{children}</YearLevelContext.Provider>
}

export default YearLevelProvider
