import * as React from "react"
import { TableFilterContext } from "./tableFilterStore"

export function TableFilterProvider({
  initialKeys,
  children,
}: {
  initialKeys?: string[]
  children: React.ReactNode
}) {
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(initialKeys ?? [])
  )

  // If initialKeys prop changes (e.g., navigating to Redacted adds 'role'),
  // merge any new keys so columns become visible without resetting user choices.
  React.useEffect(() => {
    if (!initialKeys || initialKeys.length === 0) return
    setSelected((prev) => {
      const next = new Set(prev)
      for (const k of initialKeys) next.add(k)
      return next
    })
  }, [initialKeys])

  const isSelected = React.useCallback((key: string) => selected.has(key), [selected])

  const toggle = React.useCallback((key: string, checked?: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked === undefined) {
        if (next.has(key)) next.delete(key)
        else next.add(key)
      } else if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])

  const setSelectedKeys = React.useCallback((keys: string[]) => {
    setSelected(new Set(keys))
  }, [])

  const value = React.useMemo(
    () => ({ selected, isSelected, toggle, setSelectedKeys }),
    [selected, isSelected, toggle, setSelectedKeys]
  )

  return <TableFilterContext.Provider value={value}>{children}</TableFilterContext.Provider>
}

export default TableFilterProvider
