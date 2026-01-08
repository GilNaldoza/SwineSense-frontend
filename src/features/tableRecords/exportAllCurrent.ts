import client from '@/api/client'
import { type EntriesResponse } from '@/api/entries'
import { useLayout } from '@/components/layout/useLayout'
import { useSearch } from '@/components/table/searchStore'
import { useSort, type SortOption } from '@/components/table/sortStore'
import { toast } from "sonner"

function mapSortToBackend(s: SortOption | undefined): string | undefined {
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
}

async function fetchPage(params: { userType?: string; query?: string; page: number; limit: number; sort?: string }): Promise<EntriesResponse> {
  // Reuse server API with same normalization path used by getEntries, but call endpoints directly for efficiency
  const { userType, query, page, limit, sort } = params
  
  const paramsObj: Record<string, unknown> = { page, limit }
  if (userType && userType !== 'all') paramsObj.userType = userType
  if (sort) paramsObj.sort = sort
  if (query) paramsObj.search = query // Backend v2 might not support search yet

  const resp = await client.get('/logs', { params: paramsObj })
  
  const data = resp.data
  const entries = Array.isArray(data?.data?.entries) ? data.data.entries : Array.isArray(data?.entries) ? data.entries : []
  const pagination = typeof data?.data?.pagination === 'object' ? data.data.pagination : data?.pagination
  return { entries, pagination }
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return ''
  // Define stable column order
  const columns = [
    'id', 'userId', 'logId', 'role', 'firstName', 'lastName', 'department', 'college', 'yearLevel', 'entryMethod', 'status', 'logDate', 'logTime', 'createdAt'
  ]
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    const needsQuotes = /[",\n]/.test(s)
    const escaped = s.replace(/"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }
  function normalize(row: Record<string, unknown>): Record<string, unknown> {
    const item = row
    const user = (item['user'] as Record<string, unknown>) || {}

    const rawTs = item['entryTimestamp'] ?? item['entry_timestamp'] ?? item['entryTimestamp']
    const timestamp = typeof rawTs === 'number' ? (rawTs as number) : rawTs ? Date.parse(String(rawTs)) : undefined

    const dateStr = timestamp ? new Date(timestamp).toLocaleDateString('en-US') : undefined
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined

    const logId = String(item['logId'] ?? item['log_id'] ?? '')

    const fallbackUserId = String(user['idNumber'] ?? user['id_number'] ?? user['rfid_tag'] ?? user['userId'] ?? item['userId'] ?? item['user_id'] ?? '')
    const id = fallbackUserId

    const role = String(user['userType'] ?? user['user_type'] ?? user['role'] ?? 'student')

    const firstName = String(user['firstName'] ?? user['first_name'] ?? '')
    const lastName = String(user['lastName'] ?? user['last_name'] ?? '')
    const department = String(user['department'] ?? '')
    const college = String(user['college'] ?? '')
    const yearLevel = String(user['yearLevel'] ?? user['year_level'] ?? '')

    const userId = String(item['userId'] ?? item['user_id'] ?? '')
    const entryMethod = String(item['entryMethod'] ?? item['entry_method'] ?? '')
    const status = String(item['status'] ?? '')
    const createdAt = item['createdAt'] ? String(item['createdAt']) : undefined

    return {
      id,
      userId,
      logId,
      role,
      firstName,
      lastName,
      department,
      college,
      yearLevel,
      entryMethod,
      status,
      logDate: dateStr,
      logTime: timeStr,
      createdAt,
    }
  }
  const header = columns.join(',')
    const lines = rows.map(r => {
      const n = normalize(r)
      return columns.map(c => escape((n as Record<string, unknown>)[c])).join(',')
    })
  return [header, ...lines].join('\n')
}

function downloadBlob(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function useExportAllCurrent() {
  const { section } = useLayout()
  const { query } = useSearch()
  const { sort } = useSort()

  const userType = section === 'Students' ? 'student' : section === 'Faculties' ? 'faculty' : 'all'
  const backendSort = mapSortToBackend(sort)

  return async function exportAll() {
    try {
      // Try to fetch "all" in a single request using a very high limit.
      const preferredLimit = 10000
      const first = await fetchPage({ userType, query: String(query || ''), page: 1, limit: preferredLimit, sort: backendSort })
      const totalPages = Number(first.pagination?.totalPages ?? 1) || 1
      const allRows: Array<Record<string, unknown>> = []
      allRows.push(...first.entries as Array<Record<string, unknown>>)

      // If backend returns everything in one go (totalPages === 1), we can skip paging.
      if (totalPages === 1) {
        const csv = toCsv(allRows)
        const filenameBase = section.toLowerCase() || 'entries'
        const filename = `${filenameBase}-export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
        downloadBlob(csv, filename)
        return
      }

      // Otherwise, paginate with generous per-request limit to reduce calls and respect rate limits.
      const limit = Math.min(preferredLimit, 200)
      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

      for (let p = 2; p <= totalPages; p++) {
        try {
          // small delay between requests to avoid 429
          await sleep(250)
          const resp = await fetchPage({ userType, query: String(query || ''), page: p, limit, sort: backendSort })
          allRows.push(...(resp.entries as Array<Record<string, unknown>>))
        } catch (err: unknown) {
          // If rate limited, back off and retry once
          const message = (err as { message?: string })?.message ?? String(err)
          if (message.includes('429') || message.toLowerCase().includes('too many requests')) {
            await sleep(1500)
            const retry = await fetchPage({ userType, query: String(query || ''), page: p, limit, sort: backendSort })
            allRows.push(...(retry.entries as Array<Record<string, unknown>>))
          } else {
            throw err
          }
        }
      }

      const csv = toCsv(allRows)
      const filenameBase = section.toLowerCase() || 'entries'
      const filename = `${filenameBase}-export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
      downloadBlob(csv, filename)
    } catch (err) {
      console.error('Export failed', err)
      toast.error('Export failed. Please try again.')
    }
  }
}
