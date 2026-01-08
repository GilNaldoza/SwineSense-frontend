import * as React from 'react'
import { useLayout } from '@/components/layout/useLayout'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { getTrends, getByCollege, getByDepartment, getTimeByCollege, getTimeByDepartment } from '@/api/analytics'
import { colleges as collegeList } from '@/lib/colleges'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, LineChart, Line } from 'recharts'

export default function AnalyticsPage() {
  const { section } = useLayout()
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '365d' | 'custom'>('30d')
  const [customStart, setCustomStart] = React.useState<string>('')
  const [customEnd, setCustomEnd] = React.useState<string>('')
  // Grouping is derived from filters: if a college is selected, group by department; else by college
  // Filters for area and ranking (College only)
  const [areaCollege, setAreaCollege] = React.useState<string>('')
  const [rankCollege, setRankCollege] = React.useState<string>('')

  // Special option to compare all departments across all colleges
  const ALL_DEPTS = '__ALL_DEPTS__'

  // Trends by user type for stacked area
  // Stacked area: dynamic categories for students only (composition over time)
  const [stackCategories, setStackCategories] = React.useState<string[]>([])
  const [stackSafeCategories, setStackSafeCategories] = React.useState<string[]>([])
  const [stackData, setStackData] = React.useState<Array<Record<string, number | string>>>([])
  const [barData, setBarData] = React.useState<{ name: string; count: number }[]>([])
  const [lineData, setLineData] = React.useState<{ date: string; count: number; label: string }[]>([])

  // Load stacked composition data by college/department (students only)
  const makeKey = React.useCallback((label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), [])

  const computedGroupByArea: 'college' | 'department' = areaCollege ? 'department' : 'college'
  const computedGroupByRank: 'college' | 'department' = rankCollege ? 'department' : 'college'
  const normalizeCollege = (val: string) => (val && val !== ALL_DEPTS ? val : undefined)

  React.useEffect(() => {
    (async () => {
      const useRange = timeRange === 'custom' && customStart && customEnd
      if (timeRange === 'custom' && !useRange) return
      const preset = (t: '7d' | '30d' | '90d' | '365d' | 'custom'): '7d' | '30d' | '90d' | '365d' | '1y' | undefined => (t === 'custom' ? '30d' : t)
      if (computedGroupByArea === 'college') {
        const res = await (useRange
          ? getTimeByCollege('30d', { startDate: customStart, endDate: customEnd }, { topN: 5, includeOther: true })
          : getTimeByCollege(preset(timeRange), undefined, { topN: 5, includeOther: true }))
        const safeCats = res.categories.map(makeKey)
        const transformed = res.data.map(row => {
          const out: Record<string, number | string> = { date: row.date as string, label: row.label as string }
          res.categories.forEach((c, idx) => {
            const key = c
            const safe = safeCats[idx]
            out[safe] = (row[key] as number) ?? 0
          })
          return out
        })
        setStackCategories(res.categories)
        setStackSafeCategories(safeCats)
        setStackData(transformed)
      } else {
        const collegeParam = normalizeCollege(areaCollege)
        const res = await (useRange
          ? getTimeByDepartment('30d', { startDate: customStart, endDate: customEnd }, { college: collegeParam }, { topN: 5, includeOther: true })
          : getTimeByDepartment(preset(timeRange), undefined, { college: collegeParam }, { topN: 5, includeOther: true }))
        const safeCats = res.categories.map(makeKey)
        const transformed = res.data.map(row => {
          const out: Record<string, number | string> = { date: row.date as string, label: row.label as string }
          res.categories.forEach((c, idx) => {
            const key = c
            const safe = safeCats[idx]
            out[safe] = (row[key] as number) ?? 0
          })
          return out
        })
        setStackCategories(res.categories)
        setStackSafeCategories(safeCats)
        setStackData(transformed)
      }
    })()
  }, [computedGroupByArea, timeRange, customStart, customEnd, areaCollege, makeKey])

  React.useEffect(() => {
    (async () => {
      const useCustomRange = timeRange === 'custom' && customStart && customEnd
      if (timeRange === 'custom' && !useCustomRange) return

      // Build an explicit date range for ranking even for preset ranges
      const buildRange = (): { startDate: string; endDate: string } => {
        if (useCustomRange) return { startDate: customStart, endDate: customEnd }
        const end = new Date()
        const start = new Date()
        const map: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }
        const days = map[timeRange as keyof typeof map] ?? 30
        start.setDate(end.getDate() - days + 1)
        const toISO = (d: Date) => d.toISOString().split('T')[0]
        return { startDate: toISO(start), endDate: toISO(end) }
      }
      const range = buildRange()

      if (computedGroupByRank === 'college') {
        const res = await getByCollege(range)
        setBarData(res.colleges.map((c) => ({ name: c.college, count: c.count })))
      } else {
        const collegeParam = normalizeCollege(rankCollege)
        const res = await getByDepartment(range, { college: collegeParam })
        setBarData(res.departments.map((d) => ({ name: d.department, count: d.count })))
      }
    })()
  }, [computedGroupByRank, timeRange, customStart, customEnd, rankCollege])

  React.useEffect(() => {
    (async () => {
      const useRange = timeRange === 'custom' && customStart && customEnd
      if (timeRange === 'custom' && !useRange) return
      const preset = (t: '7d' | '30d' | '90d' | '365d' | 'custom'): '7d' | '30d' | '90d' | '365d' | '1y' | undefined => (t === 'custom' ? '30d' : t)
      const res = await (useRange ? getTrends('30d', undefined, { startDate: customStart, endDate: customEnd }) : getTrends(preset(timeRange)))
      setLineData(res.trends)
    })()
  }, [timeRange, customStart, customEnd])

  // Build chart config dynamically for up to 9 series
  const palette = React.useMemo(() => ['var(--chart-1)','var(--chart-2)','var(--chart-3)','var(--chart-4)','var(--chart-5)','var(--chart-6)','var(--chart-7)','var(--chart-8)','var(--chart-9)'], [])
  const areaConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {}
    stackSafeCategories.forEach((safe, idx) => {
      const original = stackCategories[idx]
      cfg[safe] = { label: original, color: palette[idx % palette.length] }
    })
    return cfg
  }, [stackCategories, stackSafeCategories, palette])

  const barConfig = {
    count: { label: 'Entries', color: 'var(--chart-3)' },
  }

  const lineConfig = {
    count: { label: 'Entries', color: 'var(--chart-4)' },
  }

  const mergedAreaData = stackData

  // Abbreviate long X-axis labels for ranking chart
  const abbreviateLabel = React.useCallback((label: string) => {
    if (!label) return ''
    const max = 16
    if (label.length <= max) return label
    const stop = new Set(['of','in','and','for','the','department','college','program'])
    const words = label.split(/\s+/).filter(Boolean)
    const initials = words
      .filter(w => !stop.has(w.toLowerCase()))
      .map(w => w[0]?.toUpperCase())
      .join('')
    if (initials.length >= 3 && initials.length <= max) return initials
    const compact = words.slice(0, 3).map(w => (w.length > 4 ? w.slice(0,3) : w)).join(' ')
    return compact.length > max ? compact.slice(0, max - 1) + '…' : compact
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-primary">{section}</h1>
        <div className="w-full sm:w-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '365d' | 'custom')} className="h-9 w-full sm:w-56">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last 1 year</option>
            <option value="custom">Custom range</option>
          </Select>
          {timeRange === 'custom' && (
            <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
              <input aria-label="Start date" type="date" className="h-9 rounded border px-2 text-sm w-full sm:w-auto" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span className="hidden sm:inline text-muted-foreground">to</span>
              <input aria-label="End date" type="date" className="h-9 rounded border px-2 text-sm w-full sm:w-auto" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          )}
        </div>
      </header>

      {/* Stacked Area: Composition over time by College/Department (students only) */}
      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">Composition over time</div>
              <div className="text-sm text-muted-foreground">Students — by {computedGroupByArea}</div>
            </div>
            {/* College filter on header right */}
            <Select value={areaCollege} onChange={(e)=>{ setAreaCollege(e.target.value) }} className="h-9 w-full sm:w-56">
              <option value="">All colleges</option>
              <option value={ALL_DEPTS}>All departments</option>
              {collegeList.map(c => (<option key={c} value={c}>{c}</option>))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={areaConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart data={mergedAreaData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {stackSafeCategories.map((safe) => (
                <Area key={safe} dataKey={safe} type="monotone" stroke={`var(--color-${safe})`} fill={`var(--color-${safe})`} stackId="a" />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar: Ranking by College/Department (single period) */}
      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">Ranking</div>
              <div className="text-sm text-muted-foreground">Entries by {computedGroupByRank}</div>
            </div>
            {/* College filter on header right */}
            <Select value={rankCollege} onChange={(e)=>{ setRankCollege(e.target.value) }} className="h-9 w-full sm:w-56">
              <option value="">All colleges</option>
              <option value={ALL_DEPTS}>All departments</option>
              {collegeList.map(c => (<option key={c} value={c}>{c}</option>))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={barConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={barData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-35} height={70} tickFormatter={(value: string | number) => abbreviateLabel(String(value))} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Line: Trends over time */}
      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Entry trends</div>
              <div className="text-sm text-muted-foreground">{timeRange === 'custom' && customStart && customEnd ? `${customStart} to ${customEnd}` : `Last ${timeRange}`}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={lineConfig} className="aspect-auto h-[260px] w-full">
            <LineChart data={lineData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="count" type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}