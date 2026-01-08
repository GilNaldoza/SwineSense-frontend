import * as React from "react"
import RecordCard from "@/components/table/mobile/RecordCard"
import { useRedactedEntries } from "@/hooks/tableRecords/useRedactedEntries"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import WobbleFlipLoader from "@/components/ui/WobbleFlipLoader"

const MobileRedactedAdapter: React.FC = () => {
  const [page, setPage] = React.useState<number>(1)

  const query = useRedactedEntries({ userType: 'all', page, limit: 10 })
  const isLoading = query.isLoading
  const isError = query.isError
  const resp = query.data
  const rows = resp?.entries ?? []
  const pagination = resp?.pagination
  const totalPages = Number(pagination?.totalPages ?? Math.ceil(Number(pagination?.total ?? 0) / Number(pagination?.limit ?? 10))) || 1

  return (
    <div className="space-y-4 overflow-x-hidden">
      {isError ? (
        <div className="flex flex-col items-center">
          <WobbleFlipLoader size={56} src="/logo3.svg" />
          <div className="mt-2 text-sm text-destructive">Failed to load redacted entries.</div>
        </div>
      ) : null}
      {isLoading ? (
        <div className="flex justify-center">
          <WobbleFlipLoader size={56} />
        </div>
      ) : null}

      {rows.map((r) => (
        <RecordCard key={`${r.id}-${r.logId ?? r.logTime ?? ''}`} record={r} showRole />
      ))}

      <Pagination className="mt-2 pb-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }} href="#" />
          </PaginationItem>

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

export default MobileRedactedAdapter
