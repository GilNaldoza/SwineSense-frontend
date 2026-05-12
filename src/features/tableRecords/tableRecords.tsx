import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import ReusableTable from "@/components/table/reusableTable"
import { columns } from "./columns"
import { useLayout } from "@/components/layout/useLayout"
import { type SortOption, useSort } from "@/components/table/sortStore"
import { useSearch } from "@/components/table/searchStore"
import { useOptionalYearLevel } from "@/components/table/yearLevelStore"
import { useLocationFilter } from "@/components/table/LocationContext"
import { useDateRangeFilter } from "@/components/table/DateRangeContext"
import { useDepartmentCollegeFilter } from "@/components/table/DepartmentCollegeContext"
import { type EntryRow } from "@/api/entries"
import { useEntries } from "@/hooks/tableRecords/useEntries"
import { deleteEntriesByLogIds } from "@/api/entries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTableSelection } from "@/components/table/SelectionContext"
import { toast } from "sonner"
import WobbleFlipLoader from "@/components/ui/WobbleFlipLoader"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import StudentForm, { type StudentValues } from "@/components/form/formComponent"
import { useUpdateUser } from "@/hooks/form/useUpdateUser"

type Row = {
  id: string
  role: string
  firstName?: string
  lastName?: string
  department?: string
  college?: string
  logDate?: string
  logTime?: string
  logTimestamp?: number
}

const sortRows = (rowsData: Row[], option: SortOption) => {
  const copy = [...rowsData]
  const getTs = (r: Row) =>
    typeof r.logTimestamp === "number"
      ? r.logTimestamp
      : (() => {
          const [m, d, y] = String(r.logDate || "").split("/").map((n) => Number(n) || 0)
          if (!m || !d || !y) return 0
          return new Date(y, m - 1, d).getTime()
        })()
  switch (option) {
    case "date_desc":
      return copy.sort((a, b) => getTs(b) - getTs(a))
    case "date_asc":
      return copy.sort((a, b) => getTs(a) - getTs(b))
    case "time_desc":
      return copy.sort((a, b) => {
        const [ah, am] = String(a.logTime || "0:0").split(":").map((n) => Number(n) || 0)
        const [bh, bm] = String(b.logTime || "0:0").split(":").map((n) => Number(n) || 0)
        return bh * 60 + bm - (ah * 60 + am)
      })
    case "time_asc":
      return copy.sort((a, b) => {
        const [ah, am] = String(a.logTime || "0:0").split(":").map((n) => Number(n) || 0)
        const [bh, bm] = String(b.logTime || "0:0").split(":").map((n) => Number(n) || 0)
        return ah * 60 + am - (bh * 60 + bm)
      })
    case "name_az":
      return copy.sort((a, b) => {
        const al = String(a.lastName || "").localeCompare(String(b.lastName || ""))
        if (al !== 0) return al
        return String(a.firstName || "").localeCompare(String(b.firstName || ""))
      })
    case "name_za":
      return copy.sort((a, b) => {
        const al = String(b.lastName || "").localeCompare(String(a.lastName || ""))
        if (al !== 0) return al
        return String(b.firstName || "").localeCompare(String(a.firstName || ""))
      })
    default:
      return copy
  }
}

const TableRecords = () => {
  const { sort } = useSort()
  const { query } = useSearch()
  const yearCtx = useOptionalYearLevel()
  const { location: locationFilter } = useLocationFilter()
  const { startDate, endDate } = useDateRangeFilter()
  const { college, department } = useDepartmentCollegeFilter()

  const { section } = useLayout()

  const location = useLocation()
  const initialPage = React.useMemo(() => {
    const state = (location.state as { page?: unknown } | null) || null
    const p = Number(state?.page)
    return Number.isFinite(p) && p > 0 ? p : 1
  }, [location.state])
  const [page, setPage] = React.useState<number>(initialPage)
  // Clear router state after using the preserved page so it doesn't stick across refreshes
  React.useEffect(() => {
    const st = location.state as { page?: unknown } | null
    if (st?.page != null) {
      // Replace current entry without state to avoid sticky page on reload/back
      navigate(location.pathname, { replace: true, state: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Capture the initial filter signature on mount to suppress auto-resets
  const filterKey = `${section}|${String(query ?? '')}|${String(sort ?? '')}|${String(yearCtx?.yearLevel ?? 'all')}`
  const initialFilterKeyRef = React.useRef<string | null>(null)


  const [editData, setEditData] = React.useState<{userId: string, initial: StudentValues} | null>(null)
  const updateMut = useUpdateUser()

  const mapSortToBackend = React.useCallback((s: SortOption | undefined) => {
    switch (s) {
      case "date_desc":
        return "entryTimestamp:desc"
      case "date_asc":
        return "entryTimestamp:asc"
      case "time_desc":
        return "entryTimestamp:desc"
      case "time_asc":
        return "entryTimestamp:asc"
      case "name_az":
        return "user.lastName:asc"
      case "name_za":
        return "user.lastName:desc"
      default:
        return undefined
    }
  }, [])

  // Use TanStack Query hook to fetch entries from the backend. The hook caches
  // and manages loading/refresh behavior; we send section/query/sort/page as keys.
  const backendSort = mapSortToBackend(sort)
  const userType = section === "Students" ? "student" : section === "Faculties" ? "faculty" : "all"
  const selectedYear = (yearCtx?.yearLevel && yearCtx.yearLevel !== 'all') ? String(yearCtx.yearLevel) : undefined
  const entriesQuery = useEntries({ 
    userType, 
    query: String(query || "") || undefined, 
    limit: 10, 
    page, 
    sort: backendSort, 
    yearLevel: selectedYear,
    location: locationFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    college: college || undefined,
    department: department || undefined
  })

  const isLoading = entriesQuery.isLoading
  const isError = entriesQuery.isError
  const errorObj = entriesQuery.error
  const resp = entriesQuery.data
  const total = resp?.pagination?.total
  const data = resp?.entries ?? null

  // Initialize the baseline filter signature once on mount
  React.useEffect(() => {
    if (initialFilterKeyRef.current == null) {
      initialFilterKeyRef.current = filterKey
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset to first page when filters or sort change, but if we returned from
  // Edit with a preserved page (>1) and filters are still identical to the
  // baseline, do not reset. Once filters change from the baseline, re-enable
  // normal reset behavior for future changes.
  const returnedWithPageRef = React.useRef(initialPage > 1)
  React.useEffect(() => {
    const baseline = initialFilterKeyRef.current
    const unchanged = baseline === filterKey
    if (returnedWithPageRef.current && unchanged) return
    // If this is the first actual change after return, drop the guard and reset
    if (returnedWithPageRef.current && !unchanged) {
      returnedWithPageRef.current = false
      setPage(1)
      return
    }
    // Regular behavior: any subsequent change resets to page 1
    if (!returnedWithPageRef.current) setPage(1)
  }, [filterKey])

  const navigate = useNavigate()

  const rowsSource = React.useMemo<EntryRow[]>(() => {
    // If the fetch errored, do not fall back to mock rows — show empty state so failures are visible.
    if (isError) return []
    if (data) return data
    if (isLoading) return []
    return []
  }, [data, isLoading, isError])

  // Live updates handled internally by useEntries refetchInterval
  // useLogStream(true) 

  // When using server-side fetching, the backend returns already-filtered and sorted rows.
  // Avoid applying client-side filter/sort in that case. This keeps behavior consistent with
  // production rules where filters and sort are applied by the API.
  const useServerSide = true

  const displayedRows = React.useMemo(() => {
    if (useServerSide) return rowsSource
    const q = String(query || "").trim().toLowerCase()

    const base = rowsSource.filter((r) => {
      if (section === "Students") return r.role === "student"
      if (section === "Faculties") return r.role === "faculty"
      return true
    })

    const afterSearch = q
      ? base.filter((r) => {
          const fields = [r.id, r.firstName, r.lastName, r.department, r.college, r.logDate, r.logTime]
          return fields.some((f) => String(f ?? "").toLowerCase().includes(q))
        })
      : base

    const selectedLevel = yearCtx?.yearLevel ?? "all"
    const afterYear = selectedLevel === "all"
      ? afterSearch
      : afterSearch.filter((r) => {
          const raw = String(r.yearLevel ?? "").toLowerCase()
          // Extract the first digit in the string (e.g., "1st year" → "1")
          const m = raw.match(/[0-9]/)
          const digit = m ? m[0] : ""
          return digit === String(selectedLevel)
        })

    return afterYear
  }, [rowsSource, query, section, yearCtx, useServerSide])

  const sorted = React.useMemo(() => {
    if (useServerSide) return displayedRows
    return sortRows(displayedRows, sort)
  }, [displayedRows, sort, useServerSide])

  // Map columns to update the 'id' header label based on the selected section
  const mappedColumns = React.useMemo(() => {
    return columns.map((c) => {
      if (c.key === "id") {
        const header = section === "Students" ? "Student ID" : section === "Faculties" ? "Faculty ID" : "ID"
        return { ...c, header }
      }
      return c
    })
  }, [section])

  // Selection + deletion wiring
  const { selected, setOnDelete } = useTableSelection()
  const qc = useQueryClient()
  const bulkDelete = useMutation({
    mutationFn: async () => {
      const ids = selected
        .map((s) => s.logId)
        .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      if (ids.length === 0) {
        toast.warning('No selectable entries on this page. Try another page.')
        return
      }
      await deleteEntriesByLogIds(ids)
    },
    onSuccess: () => {
      // Align with useEntries queryKey: ['entries', userType, query, page, limit, sort]
      qc.invalidateQueries({ queryKey: ['entries', userType ?? 'all', String(query ?? ''), page, 10, backendSort ?? ''] })
    },
    onError: (err) => {
      console.error('Bulk delete failed', err)
      toast.error('Delete failed. Please try again.')
    },
  })

  const { mutateAsync } = bulkDelete

  React.useEffect(() => {
    // Provide a callable that directly invokes mutateAsync
    // We must pass a function that returns the handler, because setOnDelete is a useState setter
    // and would otherwise execute the handler immediately as a functional update.
    setOnDelete(() => async () => {
      await mutateAsync()
    })
  }, [setOnDelete, mutateAsync])

  return (
    <div>
      {isError ? (
        <div className="mb-2 flex flex-col items-center">
          <WobbleFlipLoader size={56} src="/SwineSense_PinkLogo_NoBG.svg" />
          <div className="mt-2 text-sm text-destructive">Error: {String((errorObj as Error)?.message ?? errorObj)}</div>
        </div>
      ) : null}
      {isLoading ? (
        <div className="mb-2 flex justify-center">
          <WobbleFlipLoader size={56} />
        </div>
      ) : null}
      <ReusableTable
        data={sorted}
        columns={mappedColumns}
        pageSize={10}
        showSelection
        showActions
        onEdit={(row) => {
          const r = row as Record<string, unknown>
          const userId = String(r['userId'] ?? r['user_id'] ?? r['id'])
          const role = String(r['role'] ?? 'student')
          const userType = (role === 'faculty' ? 'faculty' : 'student') as 'student' | 'faculty'
          const initialValues: StudentValues = {
            studentId: String(r['id'] ?? ''),
            firstName: String(r['firstName'] ?? ''),
            lastName: String(r['lastName'] ?? ''),
            department: String(r['department'] ?? ''),
            college: String(r['college'] ?? ''),
            yearLevel: String(r['yearLevel'] ?? ''),
            userType,
          }
          setEditData({ userId, initial: initialValues })
        }}
         serverSide
         totalCount={total}
         page={page}
         onPageChange={(p) => setPage(p)}
        injectRoleColumn={section === 'All'}
      />

      <Dialog open={!!editData} onOpenChange={(o) => !o && setEditData(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Info</DialogTitle>
          </DialogHeader>
          {editData && (
             <StudentForm
               initialValues={editData.initial}
               submitText={updateMut.isPending ? 'Saving...' : 'Save'}
               onSubmit={(values) => {
                 const payload = {
                   userId: editData.userId,
                   idNumber: values.studentId ?? '',
                   firstName: values.firstName ?? '',
                   lastName: values.lastName ?? '',
                   college: values.college,
                   department: values.department,
                   yearLevel: values.yearLevel,
                   userType: values.userType,
                 }
                 updateMut.mutate(payload, {
                   onSuccess: () => {
                     toast.success('Information updated')
                     setEditData(null)
                     entriesQuery.refetch()
                   },
                   onError: () => toast.error('Update failed')
                 })
               }}
             />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TableRecords