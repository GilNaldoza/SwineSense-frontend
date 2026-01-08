import client from "./client"

export type EntryRow = {
  id: string
  role: string
  firstName: string
  lastName: string
  department?: string
  college?: string
  logDate?: string
  logTime?: string
  logTimestamp?: number
  yearLevel?: string
  logId?: string
  userId?: string
  entryMethod?: string
  status?: string
  location?: string
  createdAt?: string
  [key: string]: React.ReactNode | string | number | null | undefined
}

export type GetEntriesOptions = {
  userType?: "student" | "faculty" | "all"
  query?: string
  page?: number
  limit?: number
  sort?: string
  yearLevel?: string
  location?: string
  startDate?: string
  endDate?: string
  college?: string
  department?: string
}

// Fetch entries from backend. The backend README documents a protected GET /entries endpoint.
export type EntriesResponse = {
  entries: EntryRow[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getEntries(opts?: GetEntriesOptions): Promise<EntriesResponse> {
  try {
    const o: GetEntriesOptions = opts ?? {}
    const params: Record<string, unknown> = {}

    // Pagination
    params.page = o.page ?? 1
    params.limit = o.limit ?? 10

    // Filters
    // Backend API accepts: startDate, endDate, userType, department, college
    // Frontend options are: query, yearLevel, userType
    
    if (o.userType && o.userType !== 'all') params.userType = o.userType
    
    // Note: The backend currently does not support generic search 'query' or 'yearLevel' filtering on GET /logs.
    // We pass them anyway in case backend adds support, or we map them if possible.
    // 'query' might be intended for name search, but backend doesn't support it yet.
    if (o.query) params.search = o.query 
    if (o.yearLevel && String(o.yearLevel).trim() !== '') params.yearLevel = o.yearLevel
    if (o.location && String(o.location).trim() !== '') params.location = o.location
    if (o.startDate) params.startDate = o.startDate
    if (o.endDate) params.endDate = o.endDate
    if (o.college && String(o.college).trim() !== '') params.college = o.college
    if (o.department && String(o.department).trim() !== '') params.department = o.department

    // Sort
    // Backend hardcodes sort to 'entryTimestamp: desc' but we send params anyway.
    if (o.sort) {
      params.sort = o.sort
    }

    // Use GET /logs for everything (was /entries and POST /entries/filter)
    console.debug('Calling GET /logs with params:', params)
    const resp = await client.get('/logs', { params })
    const responseData = resp.data

    // Backend returns an envelope: { success, data: { entries, pagination } }
    let entriesArray: unknown[] = []
    let pagination: EntriesResponse['pagination'] | undefined

    if (Array.isArray(responseData)) {
      entriesArray = responseData
    } else if (responseData && typeof responseData === 'object') {
      const top = responseData as Record<string, unknown>
      if ('data' in top) {
        const inner = top['data'] as Record<string, unknown> | undefined
        if (inner && Array.isArray(inner['entries'])) entriesArray = inner['entries'] as unknown[]
        if (inner && typeof inner['pagination'] === 'object') {
          const p = inner['pagination'] as Record<string, unknown>
          pagination = {
            total: Number(p['total'] ?? 0),
            page: Number(p['page'] ?? o.page ?? 1),
            limit: Number(p['limit'] ?? o.limit ?? (Array.isArray(inner['entries']) ? inner['entries'].length : 0)),
            totalPages: Number(p['totalPages'] ?? Math.ceil((Number(p['total'] ?? 0) || (Array.isArray(inner['entries']) ? inner['entries'].length : 0)) / (Number(p['limit'] ?? o.limit ?? 1)))),
          }
        }
      } else if (Array.isArray(top['entries'])) {
        entriesArray = top['entries'] as unknown[]
      }
    }

    if (!Array.isArray(entriesArray)) entriesArray = []

    const mapped = entriesArray.map((d: unknown) => {
      const item = d as Record<string, unknown>
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

      // Important: spread the raw `item` first so normalized/derived fields below override any conflicting keys
      // This prevents raw backend fields from overwriting formatted values (logDate/logTime) or derived ids
      return {
        ...item,
        id,
        role,
        firstName,
        lastName,
        department,
        college,
        yearLevel,
        logId,
        userId,
        entryMethod,
        status,
        createdAt,
        logDate: dateStr,
        logTime: timeStr,
        logTimestamp: timestamp,
      } as EntryRow
    })

    return { entries: mapped, pagination }
  } catch (err: unknown) {
    let message = 'Failed to fetch entries'
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>
      const resp = e['response'] as Record<string, unknown> | undefined
      const data = resp?.['data'] as Record<string, unknown> | undefined
      const candidate = data?.['message'] ?? data?.['error'] ?? resp?.['message']
      if (typeof candidate === 'string') message = candidate
      else if (candidate != null) message = String(candidate)
    } else {
      message = String(err)
    }
    throw new Error(message || 'Failed to fetch entries')
  }
}

export default { getEntries }

// Delete entry logs by their logId values. Falls back to per-id delete.
export async function deleteEntriesByLogIds(ids: Array<string | number>) {
  const clean = ids
    .map((v) => (typeof v === 'number' ? String(v) : String(v)))
    .filter((s) => s.trim() !== '')

  if (clean.length === 0) return { success: true }

  // Backend v2 only supports single delete at DELETE /logs/:id
  // We must delete sequentially.
  
  const results = await Promise.allSettled(clean.map(id => client.delete(`/logs/${encodeURIComponent(id)}`)));

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
      console.warn('Some deletes failed', failures);
      // Return success false if all failed? Or just partial?
      // For now, if any succeed, we consider it a partial success, but the UI expects a simple object.
  }
  
  return { success: true, count: clean.length - failures.length };
}

// Fetch redacted (soft-deleted) entries
export async function getRedactedEntries(opts?: { userType?: 'student' | 'faculty' | 'all'; page?: number; limit?: number; sort?: string }): Promise<EntriesResponse> {
  const params: Record<string, unknown> = {}
  // Backend v2 archive endpoint does not filter by userType yet, but we pass it anyway
  if (opts?.userType && opts.userType !== 'all') params.userType = opts.userType
  if (opts?.page) params.page = opts.page
  if (opts?.limit) params.limit = opts.limit
  
  // Call the new backend endpoint
  const resp = await client.get('/logs/archive', { params })
  const responseData = resp.data as {
    data?: {
      entries?: unknown[]
      pagination?: { total?: number; page?: number; limit?: number; totalPages?: number }
    }
  }
  let rawEntries: unknown[] = []
  let pagination: EntriesResponse['pagination'] | undefined

  if (Array.isArray(responseData?.data?.entries)) {
    rawEntries = responseData.data.entries
    const p = responseData.data.pagination || {}
    pagination = {
      total: Number(p.total ?? 0),
      page: Number(p.page ?? opts?.page ?? 1),
      limit: Number(p.limit ?? opts?.limit ?? 10),
      totalPages: Number(p.totalPages ?? Math.ceil((Number(p.total ?? 0)) / (Number(p.limit ?? opts?.limit ?? 1) || 1))),
    }
  }

  const mapped = rawEntries.map((d: unknown) => {
    const item = d as Record<string, unknown>
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
      ...item,
      id,
      role,
      firstName,
      lastName,
      department,
      college,
      yearLevel,
      logId,
      userId,
      entryMethod,
      status,
      createdAt,
      logDate: dateStr,
      logTime: timeStr,
      logTimestamp: timestamp,
    } as EntryRow
  })

  return { entries: mapped, pagination }
}
