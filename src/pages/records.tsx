import * as React from "react"
import TableRecords from "@/features/tableRecords/tableRecords"
import { columns } from "@/features/tableRecords/columns"
import { TableFilterProvider } from "@/components/table/TableFilterContext"
import SortProvider from "@/components/table/SortContext"
import SearchProvider from "@/components/table/SearchContext"
import YearLevelProvider from "@/components/table/YearLevelContext"
import LocationProvider from "@/components/table/LocationContext"
import DateRangeProvider from "@/components/table/DateRangeContext"
import DepartmentCollegeProvider from "@/components/table/DepartmentCollegeContext"
import { LayoutProvider } from "@/components/layout/LayoutContext"
import Sidebar from "@/components/sidebar/sidebar"
import Header from "@/components/header/header"
import { TableSelectionProvider } from "@/components/table/SelectionContext"
import AnalyticsPage from '@/pages/analytics'
import ArchiveTable from '@/features/tableRecords/redactedTable'
import MobileRecordsAdapter from '@/features/tableRecords/MobileRecordsAdapter'
import MobileRedactedAdapter from '@/features/tableRecords/MobileRedactedAdapter'
import { useLayout } from '@/components/layout/useLayout'
import StaffManagement from '@/pages/staffManagement'

const RecordsContent: React.FC = () => {
  const { section } = useLayout()
  return (
    <div className="flex h-dvh min-h-dvh w-full bg-[#F7F7FF] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex min-h-0 flex-col overflow-y-auto overflow-x-hidden px-5 md:py-3 lg:py-5">
        <div className="w-full max-w-[1500px] mx-auto">

          {section === 'Analytics' ? (
            <AnalyticsPage />
          ) : section === 'Staff' ? (
             <StaffManagement />
          ) : section === 'Archive' ? (
            <TableFilterProvider initialKeys={[...columns.map((c) => c.key), 'role']}>
              <SortProvider>
                <SearchProvider>
                  <YearLevelProvider>
                    <LocationProvider>
                      <DateRangeProvider>
                        <DepartmentCollegeProvider>
                          <TableSelectionProvider>
                            <Header />
                            <div className="mt-5">
                              {/* Mobile cards */}
                              <div className="block sm:hidden">
                                <MobileRedactedAdapter />
                              </div>
                              {/* Desktop/table */}
                              <div className="hidden sm:block">
                                <ArchiveTable />
                              </div>
                            </div>
                          </TableSelectionProvider>
                        </DepartmentCollegeProvider>
                      </DateRangeProvider>
                    </LocationProvider>
                  </YearLevelProvider>
                </SearchProvider>
              </SortProvider>
            </TableFilterProvider>
          ) : (
            <TableFilterProvider initialKeys={section === 'All' ? [...columns.map((c) => c.key), 'role'] : columns.map((c) => c.key)}>
              <SortProvider>
                <SearchProvider>
                  <YearLevelProvider>
                    <LocationProvider>
                      <DateRangeProvider>
                        <DepartmentCollegeProvider>
                          <TableSelectionProvider>
                            <Header />
                            <div className="mt-5">
                              {/* Mobile cards */}
                              <div className="block sm:hidden">
                                <MobileRecordsAdapter />
                              </div>
                              {/* Desktop/table */}
                              <div className="hidden sm:block">
                                <TableRecords />
                              </div>
                            </div>
                          </TableSelectionProvider>
                        </DepartmentCollegeProvider>
                      </DateRangeProvider>
                    </LocationProvider>
                  </YearLevelProvider>
                </SearchProvider>
              </SortProvider>
            </TableFilterProvider>
          )}

        </div>
      </main>
    </div>
  )
}

const Records: React.FC = () => {
  return (
    <LayoutProvider>
      <RecordsContent />
    </LayoutProvider>
  )
}

export default Records
