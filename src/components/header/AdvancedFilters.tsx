import { useLocationFilter } from "@/components/table/LocationContext"
import { useDateRangeFilter } from "@/components/table/DateRangeContext"
import { useDepartmentCollegeFilter } from "@/components/table/DepartmentCollegeContext"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FilterX } from "lucide-react"
import { colleges, departmentsByCollege } from "@/lib/colleges"

export default function AdvancedFilters() {
  const { location, setLocation } = useLocationFilter()
  const { startDate, endDate, setDateRange } = useDateRangeFilter()
  const { college, setCollege, department, setDepartment } = useDepartmentCollegeFilter()

  const availableDepartments = college ? departmentsByCollege[college] || [] : []

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Location Selector */}
      <div className="w-[140px]">
        <Select 
          value={location || "all"} 
          onChange={(e) => setLocation(e.target.value === "all" ? "" : e.target.value)}
        >
          <option value="all">All Locations</option>
          <option value="Main Library">Main Library</option>
          <option value="Graduate Library">Graduate Library</option>
          <option value="Electronic Library">Electronic Library</option>
          <option value="CEA Library">CEA Library</option>
          <option value="CSM Library">CSM Library</option>
          <option value="CITC Library">CITC Library</option>
          <option value="COT Library">COT Library</option>
        </Select>
      </div>

      {/* College Selector */}
      <div className="w-[140px]">
         <Select 
           value={college || "all"} 
           onChange={(e) => setCollege(e.target.value === "all" ? "" : e.target.value)}
           title="College"
         >
           <option value="all">All Colleges</option>
           {colleges.map(c => (
             <option key={c} value={c}>{c}</option>
           ))}
         </Select>
      </div>

      {/* Department Selector */}
      {college && availableDepartments.length > 0 && (
        <div className="w-[140px]">
          <Select 
            value={department || "all"} 
            onChange={(e) => setDepartment(e.target.value === "all" ? "" : e.target.value)}
            title="Department"
          >
            <option value="all">All Departments</option>
            {availableDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </div>
      )}

      {/* Date Range */}
      <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-white h-9 border-input">
         <span className="text-xs text-muted-foreground mr-1">From:</span>
         <input 
            type="date" 
            className="text-xs outline-none bg-transparent w-24 font-sans text-slate-700" 
            value={startDate || ''}
            onChange={(e) => setDateRange(e.target.value, endDate)}
         />
         <div className="w-px h-4 bg-gray-200 mx-1"></div>
         <span className="text-xs text-muted-foreground mr-1">To:</span>
         <input 
            type="date" 
            className="text-xs outline-none bg-transparent w-24 font-sans text-slate-700" 
            value={endDate || ''}
            onChange={(e) => setDateRange(startDate, e.target.value)}
         />
      </div>
      
      {(location || startDate || endDate || college || department) && (
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
              setLocation("")
              setDateRange(undefined, undefined)
              setCollege("")
              setDepartment("")
          }} title="Clear Filters">
              <FilterX className="h-4 w-4" />
          </Button>
      )}

    </div>
  )
}
