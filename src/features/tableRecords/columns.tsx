import type React from "react"

export type Column = {
  key: string
  header: string
  className?: string
  render?: (row: unknown) => React.ReactNode
}

export const columns: Column[] = [
  { key: "id", header: "Student ID", className: "font-medium" },
  {
    key: "name",
    header: "Name",
    render: (r: unknown) => {
      const row = r as Record<string, string | number | undefined>
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{row.lastName}</span>
          <span className="text-sm text-muted-foreground">{row.firstName}</span>
        </div>
      )
    },
  },
  { key: "department", header: "Department", className: "max-w-[220px] truncate" },
  { key: "college", header: "College", className: "max-w-[240px] truncate" },
  { key: "yearLevel", header: "Year Level", className: "text-sm" },
  { key: "entryMethod", header: "Method", className: "text-sm" },
  {
    key: "staff",
    header: "Entry By",
    className: "text-sm text-muted-foreground",
    render: (r: unknown) => {
      const row = r as { staff?: { username?: string }; nodeId?: string }
      return row.staff?.username || row.nodeId || "Auto"
    },
  },
  { key: "logDate", header: "Log Date" },
  { key: "logTime", header: "Log Time" },
]

export default columns
