// React import not required with the new JSX transform
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StudentBadge, YearLevelBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EntryRow } from "@/api/entries"

export type RecordCardProps = {
  record: EntryRow
  showRole?: boolean // only for redacted
  className?: string
}

export default function RecordCard({ record, showRole = false, className }: RecordCardProps) {
  const roleLabel = String(record.role || '').toLowerCase() === 'faculty' ? 'Faculty' : 'Student'

  return (
    <Card className={cn("min-w-0 w-full", className)}>
      <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-2">
        <div className="flex flex-col">
          <CardTitle className="text-base tracking-wide">{record.id}</CardTitle>
          <div className="mt-1">
            <div className="text-sm font-medium">{record.lastName}</div>
            <div className="text-sm text-muted-foreground">{record.firstName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Show Student/Faculty only when requested (ALL + Redacted) */}
          {showRole ? <StudentBadge value={roleLabel} /> : null}
          {/* Year level is always shown if present */}
          <YearLevelBadge value={record.yearLevel} />
        </div>
      </CardHeader>
      <div className="border-t" />
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-y-3">
          <div className="text-xs text-muted-foreground uppercase">College</div>
          <div className="justify-self-end text-sm wrap-break-word text-right">{record.college || '-'}</div>
          <div className="text-xs text-muted-foreground uppercase">Department</div>
          <div className="justify-self-end text-sm wrap-break-word text-right">{record.department || '-'}</div>
          <div className="text-xs text-muted-foreground uppercase">Method</div>
          <div className="justify-self-end text-sm wrap-break-word text-right">{record.entryMethod || '-'}</div>
          <div className="text-xs text-muted-foreground uppercase">Log Date</div>
          <div className="justify-self-end text-sm wrap-break-word text-right">{record.logDate || '-'}</div>
          <div className="text-xs text-muted-foreground uppercase">Log Time</div>
          <div className="justify-self-end text-sm wrap-break-word text-right">{record.logTime || '-'}</div>
        </div>
      </CardContent>
    </Card>
  )
}
