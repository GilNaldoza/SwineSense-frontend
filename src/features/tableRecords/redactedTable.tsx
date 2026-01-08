import * as React from 'react'
import ReusableTable from '@/components/table/reusableTable'
import { columns } from './columns'
import { type SortOption } from '@/components/table/sortStore'
import { useSearch } from '@/components/table/searchStore'
import { useRedactedEntries } from '@/hooks/tableRecords/useRedactedEntries'
import { type EntryRow } from '@/api/entries'
import WobbleFlipLoader from '@/components/ui/WobbleFlipLoader'

const ArchiveTable: React.FC = () => {
  const { query } = useSearch()

  const [page, setPage] = React.useState<number>(1)

  const mapSortToBackend = React.useCallback((s: SortOption | undefined) => {
    switch (s) {
      case 'date_desc':
        return 'entryTimestamp:desc'
      case 'date_asc':
        return 'entryTimestamp:asc'
      case 'time_desc':
        return 'entryTimestamp:desc'
      case 'time_asc':
        return 'entryTimestamp:asc'
      case 'name_az':
        return 'user.lastName:asc'
      case 'name_za':
        return 'user.lastName:desc'
      default:
        return undefined
    }
  }, [])

  // For now, redacted view shows all user types
  const backendSort = mapSortToBackend(undefined)
  const q = String(query || '') // search not supported server-side for redacted yet

  const redactedQuery = useRedactedEntries({ userType: 'all', page, limit: 10, sort: backendSort })
  const isLoading = redactedQuery.isLoading
  const isError = redactedQuery.isError
  const errorObj = redactedQuery.error
  const resp = redactedQuery.data
  const total = resp?.pagination?.total

  const rowsSource = React.useMemo<EntryRow[]>(() => {
    if (isError) return []
    if (resp?.entries) return resp.entries
    if (isLoading) return []
    return []
  }, [resp, isLoading, isError])

  const data = React.useMemo(() => {
    if (!q) return rowsSource
    const qq = q.toLowerCase()
    return rowsSource.filter((r) => {
      const fields = [r.id, r.firstName, r.lastName, r.department, r.college, r.logDate, r.logTime]
      return fields.some((f) => String(f ?? '').toLowerCase().includes(qq))
    })
  }, [rowsSource, q])

  const mappedColumns = React.useMemo(() => columns.map((c) => (c.key === 'id' ? { ...c, header: 'ID' } : c)), [])

  return (
    <div>
      {isError ? (
        <div className="mb-2 flex flex-col items-center">
          <WobbleFlipLoader size={56} src="/logo3.svg" />
          <div className="mt-2 text-sm text-destructive">Error: {String((errorObj as Error)?.message ?? errorObj)}</div>
        </div>
      ) : null}
      {isLoading ? (
        <div className="mb-2 flex justify-center">
          <WobbleFlipLoader size={56} />
        </div>
      ) : null}
      <ReusableTable
        data={data}
        columns={mappedColumns}
        pageSize={10}
        showSelection={false}
        showActions={false}
        serverSide
        totalCount={total}
        page={page}
        onPageChange={(p) => setPage(p)}
        injectRoleColumn
        emptyMessage="No archived logs found."
      />
    </div>
  )
}

export default ArchiveTable
