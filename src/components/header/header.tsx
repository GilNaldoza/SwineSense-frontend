import * as React from "react"
import SearchInput from "./searchInput"
import FilterButton from "./filterButton"
import DownloadButton from "./downloadButton"
import ExportDialog from "./exportDialog"
import DeleteButton from "./deleteButton"
import { useLayout } from "@/components/layout/useLayout"
import { useTableSelection } from "@/components/table/SelectionContext"
// import { useExportAllCurrent } from "@/features/tableRecords/exportAllCurrent"
import { Button } from "@/components/ui/button"
import ManualAddDialog from "@/features/formUses/ManualAddDialog"
import AdvancedFilters from "./AdvancedFilters"

export default function Header() {
  const { section } = useLayout()
  const { selected, onDelete: ctxDelete } = useTableSelection()
  const selectedCount = selected.length
  const onDelete = ctxDelete
  // const exportAll = useExportAllCurrent()
  const [exportOpen, setExportOpen] = React.useState(false)
  const [manualOpen, setManualOpen] = React.useState(false)

  const derivedUserType = section === 'Students' ? 'student' : section === 'Faculties' ? 'faculty' : 'all'
  const redactedOnly = section === 'Archive'

  return (
    <header className="flex w-full rounded-lg border bg-white p-4 sm:items-start sm:justify-between flex-col sm:flex-row">
      
      <h1 className="text-3xl font-extrabold uppercase tracking-wide text-primary">
        {section}
      </h1>

      <div className="flex w-full sm:w-auto flex-col gap-3 items-stretch sm:items-end">
        
        <div className="self-end">
          <DownloadButton onClick={() => setExportOpen(true)} />
          <ExportDialog open={exportOpen} onOpenChange={setExportOpen} userType={derivedUserType} redactedOnly={redactedOnly} />
          <ManualAddDialog open={manualOpen} onOpenChange={setManualOpen} />
        </div>

        {/* Controls: on mobile, place Search below the buttons */}
        <div className="flex w-full gap-3 sm:flex-row sm:items-center flex-col-reverse">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <SearchInput />
            <AdvancedFilters />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <FilterButton />
            {section !== 'Archive' && (
              <>
                <Button
                  onClick={() => setManualOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-primary-foreground h-9"
                >
                  Manual Add
                </Button>
                <DeleteButton
                  selectedCount={selectedCount}
                  onDelete={onDelete}
                  disabled={!selectedCount}
                  loading={false}
                />
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
