import * as React from "react"
import RecordCard from "@/components/table/mobile/RecordCard"
import { useEntries } from "@/hooks/tableRecords/useEntries"
import { useLayout } from "@/components/layout/useLayout"
import { useSearch } from "@/components/table/searchStore"
import { useOptionalYearLevel } from "@/components/table/yearLevelStore"
import { type SortOption, useSort } from "@/components/table/sortStore"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import WobbleFlipLoader from "@/components/ui/WobbleFlipLoader"

function useBackendSort(sort: SortOption | undefined) {
  return React.useMemo(() => {
    switch (sort) {
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
  }, [sort])
}

const MobileRecordsAdapter: React.FC = () => {
  const { section } = useLayout()
  const { sort } = useSort()
  const { query } = useSearch()
  const yearCtx = useOptionalYearLevel()

  const [page, setPage] = React.useState<number>(1)

  const backendSort = useBackendSort(sort)
  const userType = section === "Students" ? "student" : section === "Faculties" ? "faculty" : "all"
  const selectedYear = (yearCtx?.yearLevel && yearCtx.yearLevel !== 'all') ? String(yearCtx.yearLevel) : undefined

  const entriesQuery = useEntries({ userType, query: String(query || "") || undefined, limit: 10, page, sort: backendSort, yearLevel: selectedYear })
  const isLoading = entriesQuery.isLoading
  const isError = entriesQuery.isError
  const resp = entriesQuery.data
  const rows = resp?.entries ?? []
  const pagination = resp?.pagination

  const totalPages = Number(pagination?.totalPages ?? Math.ceil(Number(pagination?.total ?? 0) / Number(pagination?.limit ?? 10))) || 1

  return (
    <div className="space-y-4 overflow-x-hidden">
      {isError ? (
        <div className="flex flex-col items-center">
          <WobbleFlipLoader size={56} src="/logo3.svg" />
          <div className="mt-2 text-sm text-destructive">Failed to load entries.</div>
        </div>
      ) : null}
      {isLoading ? (
        <div className="flex justify-center">
          <WobbleFlipLoader size={56} />
        </div>
      ) : null}
      {rows.map((r) => (
        <RecordCard key={`${r.id}-${r.logId ?? r.logTime ?? ''}`} record={r} showRole={section === 'All'} />
      ))}

      {/* Pagination — match desktop feel */}
      <Pagination className="mt-2 pb-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }} href="#" />
          </PaginationItem>

          {/* Simple numbered window with ellipsis */}
          {Array.from({ length: totalPages }).slice(0, 2).map((_, i) => (
            <PaginationItem key={`start-${i}`}>
              <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1) }}>
                {(i + 1).toString().padStart(2, '0')}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > 4 ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : null}

          {totalPages > 3 ? (
            <PaginationItem>
              <PaginationLink href="#" isActive={page === totalPages} onClick={(e) => { e.preventDefault(); setPage(totalPages) }}>
                {String(totalPages).padStart(2, '0')}
              </PaginationLink>
            </PaginationItem>
          ) : null}

          <PaginationItem>
            <PaginationNext onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }} href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default MobileRecordsAdapter
