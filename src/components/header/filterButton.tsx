import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { columns } from "@/features/tableRecords/columns"
import { useTableFilter } from "@/components/table/tableFilterStore"
import { useSort } from "@/components/table/sortStore"
import { LABELS, type SortOption } from "@/components/table/sortConfig"
import { useOptionalYearLevel } from "@/components/table/yearLevelStore"
import { SlidersHorizontal } from "lucide-react"

export default function FilterButton() {
  const { isSelected, toggle } = useTableFilter()
  const { sort, setSort } = useSort()
  const yearCtx = useOptionalYearLevel()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="
            inline-flex items-center gap-2
            h-9
            border border-primary
            bg-white
            px-5 py-2.5
            text-xs font-medium
            text-primary
            hover:bg-blue-50
          "
        >
          Filter
          <SlidersHorizontal size={18} strokeWidth={2.2} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={isSelected(col.key)}
            onCheckedChange={(v) => toggle(col.key, Boolean(v))}
          >
            {col.header}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Sort records</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sort}
          onValueChange={(v) => setSort(v as SortOption)}
        >
          {(Object.keys(LABELS) as SortOption[]).map((k) => (
            <DropdownMenuRadioItem key={k} value={k}>
              {LABELS[k]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Year level</DropdownMenuLabel>
        {yearCtx ? (
          <DropdownMenuRadioGroup
            value={yearCtx.yearLevel}
            onValueChange={(v) => yearCtx.setYearLevel((v as string) || "all")}
          >
            {(["all", "1", "2", "3", "4", "5"] as const).map((lvl) => (
              <DropdownMenuRadioItem key={lvl} value={lvl}>
                {lvl === "all" ? "All" : `Year ${lvl}`}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
