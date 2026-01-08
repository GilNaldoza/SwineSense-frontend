import * as React from "react"
import { PencilIcon } from "lucide-react"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { useTableFilter } from "@/components/table/tableFilterStore"
import { useTableSelection } from "@/components/table/SelectionContext"

type CellValue = React.ReactNode | string | number | null | undefined

type Row = {
  id: string
} & Record<string, CellValue>

type Column = {
  key: string
  header?: React.ReactNode
  className?: string
  render?: (row: Row) => React.ReactNode
}

const defaultPageSize = 10

function getVisiblePages(total: number, current: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = []
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  pages.push(1)
  if (left > 2) pages.push("...")

  for (let i = left; i <= right; i++) pages.push(i)

  if (right < total - 1) pages.push("...")
  pages.push(total)
  return pages
}

const sampleRows: Row[] = []

type ReusableTableProps = {
  data?: Row[]
  columns?: Column[]
  pageSize?: number
  showSelection?: boolean
  showActions?: boolean
  onEdit?: (row: Row) => void
  // Server-side pagination support
  serverSide?: boolean
  totalCount?: number
  page?: number
  onPageChange?: (page: number) => void
  // Optional: inject a Role column (used by Redacted page only)
  injectRoleColumn?: boolean
  emptyMessage?: string
}

const ReusableTable2: React.FC<ReusableTableProps> = ({
  data = sampleRows,
  columns,
  pageSize = defaultPageSize,
  showSelection = false,
  showActions = false,
  onEdit,
  serverSide = false,
  totalCount,
  page,
  onPageChange,
  injectRoleColumn = false,
  emptyMessage = "No results.",
}) => {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const [localPage, setLocalPage] = React.useState(1)
  const { setSelected: setSelectedContext } = useTableSelection()

  // Helper to compute a stable, unique key for a row.
  // Prefer backend logId (unique entry id). If missing, combine user id + timestamp.
  const getRowKey = React.useCallback((row: Row, idx: number) => {
    // Row is indexable; read known possible fields and coerce safely without using `any`.
    const logIdRaw = row["logId"] ?? row["log_id"] ?? null
    const logId = typeof logIdRaw === "string" ? logIdRaw : typeof logIdRaw === "number" ? String(logIdRaw) : null
    if (logId && logId.trim() !== "") return logId

    const userIdRaw = row["userId"] ?? row["user_id"] ?? null
    const userId = typeof userIdRaw === "string" ? userIdRaw : typeof userIdRaw === "number" ? String(userIdRaw) : null

    const tsRaw = row["logTimestamp"] ?? row["log_timestamp"] ?? row["createdAt"] ?? idx
    const ts = typeof tsRaw === "number" ? tsRaw : typeof tsRaw === "string" ? Number(tsRaw) || idx : idx

    if (userId && userId.trim() !== "") return `${userId}-${ts}`

    const idRaw = row["id"] ?? idx
    const idStr = typeof idRaw === "string" ? idRaw : String(idRaw)
    return `${idStr}-${ts}`
  }, [])

  const currentPage = serverSide ? (page ?? localPage) : localPage

  // Compute total pages. For serverSide with unknown totalCount (loading), avoid
  // falling back to data.length which is just the current page size and would
  // incorrectly clamp navigation. Instead, assume at least the current page.
  const totalPages = React.useMemo(() => {
    if (!serverSide) return Math.max(1, Math.ceil(data.length / pageSize))
    if (typeof totalCount === 'number') return Math.max(1, Math.ceil(totalCount / pageSize))
    return Math.max(1, currentPage)
  }, [serverSide, totalCount, data.length, pageSize, currentPage])

  React.useEffect(() => {
    if (!serverSide && localPage > totalPages) setLocalPage(totalPages)
    // Only clamp server-side page if we know totalCount; during loading, avoid forcing page=1
    if (serverSide && typeof totalCount === 'number' && page && page > totalPages && onPageChange) onPageChange(totalPages)
  }, [totalPages, localPage, serverSide, page, onPageChange, totalCount])

  const start = (currentPage - 1) * pageSize
  const pageRows = serverSide ? data : data.slice(start, start + pageSize)

  function toggleRow(key: string) {
    setSelected((s) => ({ ...s, [key]: !s[key] }))
  }

  const pageRowKeys = pageRows.map((r, i) => getRowKey(r, i))
  const allSelected = pageRowKeys.length > 0 && pageRowKeys.every((k) => selected[String(k)])
  function toggleAll() {
    if (allSelected) {
      setSelected((s) => {
        const copy = { ...s }
        pageRowKeys.forEach((k) => delete copy[String(k)])
        return copy
      })
    } else {
      setSelected((s) => {
        const copy = { ...s }
        pageRowKeys.forEach((k) => (copy[String(k)] = true))
        return copy
      })
    }
  }

  // Publish selection changes to the shared context with minimal identifiers
  React.useEffect(() => {
    const items = pageRows
      .map((row, i) => {
        const key = String(getRowKey(row as Row, i))
        if (!selected[key]) return null
        const logIdRaw = (row as Record<string, unknown>)["logId"] ?? (row as Record<string, unknown>)["log_id"]
        const userIdRaw = (row as Record<string, unknown>)["userId"] ?? (row as Record<string, unknown>)["user_id"]
        const logId = typeof logIdRaw === "string" ? logIdRaw : typeof logIdRaw === "number" ? String(logIdRaw) : undefined
        const userId = typeof userIdRaw === "string" ? userIdRaw : typeof userIdRaw === "number" ? String(userIdRaw) : undefined
        return { key, logId, userId }
      })
      .filter(Boolean) as { key: string; logId?: string; userId?: string }[]
    setSelectedContext(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, pageRows])

  const effectiveColumns: Column[] = React.useMemo(() => {
    let base: Column[]
    if (columns && columns.length) base = [...columns]
    else if (data && data.length) {
      const keys = Object.keys(data[0]).filter((k) => k !== "id")
      base = keys.map((k) => ({ key: k, header: k }))
    } else base = []

    if (injectRoleColumn) {
      const hasRole = base.some((c) => c.key === "role")
      if (!hasRole) {
        const roleCol: Column = {
          key: "role",
          header: "Role",
          className: "text-sm capitalize",
          render: (row: Row) => {
            const u = (row["user"] as Record<string, unknown> | undefined) || undefined
            const role = (row["role"]
              ?? (u ? (u["userType"] as string | undefined) : undefined)
              ?? (u ? (u["role"] as string | undefined) : undefined)
              ?? (row["user_type"] as string | undefined)) as string | undefined
            return (role ?? "").toString()
          },
        }
        const nameIdx = base.findIndex((c) => c.key === "name")
        if (nameIdx >= 0) base.splice(nameIdx + 1, 0, roleCol)
        else base.unshift(roleCol)
      }
    }

    return base
  }, [columns, data, injectRoleColumn])

  // Consume filter context. Create a stable default callback and override if a provider is present.
  const defaultIsSelected: (k: string) => boolean = React.useCallback((k: string): boolean => {
    void k
    return true
  }, [])
  let isSelected = defaultIsSelected
  try {
    const ctx = useTableFilter()
    isSelected = ctx.isSelected
  } catch {
    // no provider available — keep default
  }

  const visibleColumns = React.useMemo(() => effectiveColumns.filter((c) => isSelected(c.key)), [effectiveColumns, isSelected])

  const pages = getVisiblePages(totalPages, currentPage)

  const totalDisplay = serverSide && typeof totalCount === 'number' ? totalCount : data.length
  const endCount = Math.min(start + pageRows.length, totalDisplay)

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection ? (
                <TableHead className="w-12">
                  <input aria-label="Select all" type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-gray-300 text-primary accent-[#1D398A]" />
                </TableHead>
              ) : null}

              {visibleColumns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}

              {showActions ? <TableHead className="w-12" /> : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (showSelection ? 1 : 0) + (showActions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, i) => {
                const rowKey = getRowKey(row, i)
                return (
                  <TableRow key={String(rowKey)} data-state={selected[String(rowKey)] ? "selected" : ""}>
                    {showSelection ? (
                      <TableCell className="w-12">
                        <input aria-label={`Select ${String(row.id)}`} type="checkbox" checked={!!selected[String(rowKey)]} onChange={() => toggleRow(String(rowKey))} className="h-4 w-4 rounded border-gray-300 text-primary accent-[#1D398A]" />
                      </TableCell>
                    ) : null}

                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                      </TableCell>
                    ))}

                    {showActions ? (
                      <TableCell className="w-12 text-right">
                        <Button variant="ghost" size="icon" aria-label="Edit row" onClick={() => onEdit && onEdit(row)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                )
              })
            )}
          </TableBody>

          <TableCaption>
            Showing {start + 1} - {endCount} of {totalDisplay} records
          </TableCaption>
        </Table>

        <div className="mt-4 flex items-center justify-center">
          <Pagination aria-label="Table pagination">
            <PaginationContent>
              <PaginationPrevious href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); const next = Math.max(1, currentPage - 1); if (serverSide && onPageChange) onPageChange(next); else setLocalPage(next); }} />
              {pages.map((p, i) => p === "..." ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={p === currentPage} onClick={(e: React.MouseEvent) => { e.preventDefault(); if (serverSide && onPageChange) onPageChange(Number(p)); else setLocalPage(Number(p)); }}>{String(p).padStart(2, "0")}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationNext href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); const capKnown = !serverSide || typeof totalCount === 'number'; const cap = capKnown ? totalPages : undefined; const next = cap ? Math.min(cap, currentPage + 1) : (currentPage + 1); if (serverSide && onPageChange) onPageChange(next); else setLocalPage(next); }} />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default ReusableTable2
