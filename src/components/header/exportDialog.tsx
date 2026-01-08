import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import client from "@/api/client"
import { toast } from "sonner"
import { colleges, departmentsByCollege, yearLevels } from "@/lib/colleges"

type Period = 'all' | 'today' | 'pick_day' | 'last_7d' | 'last_30d' | 'last_90d' | 'this_year' | 'custom'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}
function startOfYear(d: Date) {
  return startOfDay(new Date(d.getFullYear(), 0, 1))
}

function pickRange(period: Period, customStart?: string, customEnd?: string) {
  const now = new Date()
  switch (period) {
    case 'all':
      return { startDate: undefined as Date | undefined, endDate: undefined as Date | undefined }
    case 'today': {
      return { startDate: startOfDay(now), endDate: endOfDay(now) }
    }
    case 'pick_day': {
      const base = customStart ? new Date(customStart) : undefined
      return {
        startDate: base ? startOfDay(base) : undefined,
        endDate: base ? endOfDay(base) : undefined,
      }
    }
    case 'last_7d': {
      const s = new Date(now)
      s.setDate(now.getDate() - 6)
      return { startDate: startOfDay(s), endDate: endOfDay(now) }
    }
    case 'last_30d': {
      const s = new Date(now)
      s.setDate(now.getDate() - 29)
      return { startDate: startOfDay(s), endDate: endOfDay(now) }
    }
    case 'last_90d': {
      const s = new Date(now)
      s.setDate(now.getDate() - 89)
      return { startDate: startOfDay(s), endDate: endOfDay(now) }
    }
    case 'this_year': {
      const s = startOfYear(now)
      return { startDate: startOfDay(s), endDate: endOfDay(now) }
    }
    case 'custom': {
      const s = customStart ? new Date(customStart) : undefined
      const e = customEnd ? new Date(customEnd) : undefined
      return {
        startDate: s ? startOfDay(s) : undefined,
        endDate: e ? endOfDay(e) : undefined,
      }
    }
    default:
      return { startDate: startOfDay(now), endDate: endOfDay(now) }
  }
}

function yearLabelToDigit(label: string | undefined): string | undefined {
  if (!label) return undefined
  const m = label.match(/[0-9]/)
  return m ? m[0] : undefined
}

export default function ExportDialog({ open, onOpenChange, userType = 'all', redactedOnly = false }: { open: boolean; onOpenChange: (v: boolean) => void; userType?: 'student' | 'faculty' | 'all'; redactedOnly?: boolean }) {
  const [period, setPeriod] = React.useState<Period>('today')
  const [startDateStr, setStartDateStr] = React.useState<string>('') // yyyy-mm-dd
  const [endDateStr, setEndDateStr] = React.useState<string>('') // yyyy-mm-dd
  const [college, setCollege] = React.useState<string>('')
  const [department, setDepartment] = React.useState<string>('')
  const [yearLevel, setYearLevel] = React.useState<string>('')
  const [location, setLocation] = React.useState<string>('')

  const deptOptions = React.useMemo(() => {
    if (!college) return [] as string[]
    return departmentsByCollege[college] ?? []
  }, [college])

  React.useEffect(() => {
    // Reset department if college changes and department not in new options
    if (department && !deptOptions.includes(department)) setDepartment('')
  }, [deptOptions, department])

  async function handleDownload() {
    try {
      const { startDate, endDate } = pickRange(period, startDateStr || undefined, endDateStr || undefined)
      const params: Record<string, string> = { format: 'csv' }
      if (userType && userType !== 'all') params.userType = userType
      if (redactedOnly) params.redactedOnly = 'true'
      if (period !== 'all') {
        if (period === 'custom') {
          if (!startDate || !endDate) {
            toast.error('Please select both start and end dates')
            return
          }
        } else if (period === 'pick_day') {
          if (!startDate) {
            toast.error('Please select a date')
            return
          }
        } else if (!startDate || !endDate) {
          throw new Error('Invalid date range')
        }
        params.startDate = startDate.toISOString()
        params.endDate = (endDate ?? startDate).toISOString()
      }
      if (college) params.college = college
      if (department) params.department = department
      if (location) params.location = location
      const ylDigit = yearLabelToDigit(yearLevel)
      if (ylDigit) params.yearLevel = ylDigit

      const resp = await client.get('/logs/export', { params, responseType: 'blob' })
      const blob = resp.data as Blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Build normalized filename: <scope>-<date or range>[-<college>][-<department>].csv
      const scope = redactedOnly ? 'redacted' : (userType === 'student' ? 'student' : userType === 'faculty' ? 'faculty' : 'all')
      const fmt = (d: Date) => d.toISOString().slice(0,10)
      const slug = (s: string) => s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      let dateLabel: string
      if (!startDate || !endDate) {
        // All time or missing dates — use today's date
        dateLabel = fmt(new Date())
      } else {
        const s = fmt(startDate)
        const e = fmt(endDate)
        dateLabel = s === e ? s : `${s}-${e}`
      }
      const parts = [scope, dateLabel]
      if (location) parts.push(slug(location))
      if (college) parts.push(slug(college))
      if (department) parts.push(slug(department))
      const filename = `${parts.join('-')}.csv`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onOpenChange(false)
    } catch (err) {
      console.error('Export download failed', err)
      toast.error('Export failed. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export Records</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="mt-1">
                <option value="today">Today</option>
                <option value="pick_day">Pick a day</option>
                <option value="last_7d">Last 7 days</option>
                <option value="last_30d">Last 30 days</option>
                <option value="last_90d">Last 90 days</option>
                <option value="this_year">This year</option>
                <option value="all">All time</option>
                <option value="custom">Custom range</option>
              </Select>
            </div>
            {period === 'custom' ? (
              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <Input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} className="mt-1" />
                </div>
              </div>
            ) : period === 'pick_day' ? (
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} className="mt-1" />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={''} onChange={() => {}} className="mt-1" disabled />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="text-sm font-medium">Location</label>
              <Select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1">
                <option value="">All Locations</option>
                <option value="Main Library">Main Library</option>
                <option value="Graduate Library">Graduate Library</option>
                <option value="Electronic Library">Electronic Library</option>
                <option value="CEA Library">CEA Library</option>
                <option value="CSM Library">CSM Library</option>
                <option value="CITC Library">CITC Library</option>
                <option value="COT Library">COT Library</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">College</label>
              <Select value={college} onChange={(e) => setCollege(e.target.value)} className="mt-1">
                <option value="">All</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="text-sm font-medium">Department</label>
              <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1">
                <option value="">All</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>         
            <div>
              <label className="text-sm font-medium">Year Level</label>
              <Select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="mt-1">
                <option value="">All</option>
                {yearLevels.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDownload} className="bg-primary text-white hover:bg-primary-foreground">Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
