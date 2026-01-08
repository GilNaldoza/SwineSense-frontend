import * as React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import client from "@/api/client"
import { toast } from "sonner"
import { colleges, departmentsByCollege, yearLevels } from "@/lib/colleges"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { getUsers } from "@/api/users"
import { Loader2, Search, User, UserPlus } from "lucide-react"

function randomManualRfid(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ1234567890'
  let tail = ''
  for (let i = 0; i < 8; i++) tail += chars[Math.floor(Math.random() * chars.length)]
  return `MANUAL-${tail}`
}

type Props = { open: boolean; onOpenChange: (v: boolean) => void }

export default function ManualAddDialog({ open, onOpenChange }: Props) {
  const [mode, setMode] = React.useState<'search' | 'create'>('search')
  
  // Create Mode state
  const [userType, setUserType] = React.useState<'student' | 'faculty'>('student')
  const [idNumber, setIdNumber] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [college, setCollege] = React.useState('')
  const [department, setDepartment] = React.useState('')
  const [yearLevel, setYearLevel] = React.useState('')

  // Search Mode state
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = React.useState<any>(null)

  // Shared state
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = React.useState<string>(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [submitting, setSubmitting] = React.useState(false)

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['users-search', debouncedSearch],
    queryFn: () => getUsers({ search: debouncedSearch, page: 1, limit: 5 }),
    enabled: mode === 'search' && debouncedSearch.length > 1,
  })

  // Cascading departments
  const deptOptions = React.useMemo(() => departmentsByCollege[college] ?? [], [college])
  React.useEffect(() => {
    if (mode === 'create' && department && !deptOptions.includes(department)) setDepartment('')
  }, [mode, deptOptions, department])

  const qc = useQueryClient()

  function assembleTimestamp() {
    try {
      const [h, m] = time.split(':').map((v) => Number(v))
      const [y, mo, d] = date.split('-').map((v) => Number(v))
      const dt = new Date(y, (mo || 1) - 1, d || 1, h || 0, m || 0)
      return dt.toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const entryTimestamp = assembleTimestamp()
      const targetIdNumber = mode === 'search' ? selectedUser?.idNumber : idNumber

      if (!targetIdNumber) {
        toast.error("Missing ID number")
        return
      }

      if (mode === 'create') {
        // Create user first
        await client.post('/users', {
          idNumber,
          rfidTag: randomManualRfid(),
          firstName,
          lastName,
          userType,
          college,
          department,
          yearLevel,
          email: '', // Optional
        })
      }

      // Create Log
      await client.post('/logs', {
        idNumber: targetIdNumber,
        entryMethod: 'manual',
        entryTimestamp
      })

      toast.success("Entry added")
      qc.invalidateQueries({ queryKey: ['entries'] })
      onOpenChange(false)
      
      // Reset form
      setIdNumber('')
      setFirstName('')
      setLastName('')
      setSearch('')
      setSelectedUser(null)
    } catch (err: unknown) {
      console.error(err)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any).response?.data?.message || "Failed to add entry")
    } finally {
      setSubmitting(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectUser = (u: any) => {
    setSelectedUser(u)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manual Entry</DialogTitle>
        </DialogHeader>
        
        <div className="flex w-full rounded-md border p-1 mb-4 bg-muted/50">
          <button
             onClick={() => setMode('search')}
             className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-sm transition-all ${mode === 'search' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
             <Search className="h-4 w-4" /> Search Student
          </button>
          <button
             onClick={() => setMode('create')}
             className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-sm transition-all ${mode === 'create' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
             <UserPlus className="h-4 w-4" /> New Student
          </button>
        </div>

        <div className="grid gap-4 py-2">
          {mode === 'search' && (
            <div className="space-y-4">
               {!selectedUser ? (
                 <div className="relative">
                   <div className="relative">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input 
                       placeholder="Search by name or ID..." 
                       className="pl-9"
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                       autoFocus
                     />
                   </div>
                   {isSearching && <div className="absolute right-3 top-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/></div>}
                   
                   {debouncedSearch.length > 1 && searchResults?.data?.users && (
                     <div className="border rounded-md mt-1 divide-y max-h-[200px] overflow-auto">
                        {searchResults.data.users.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">No users found</div>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            searchResults.data.users.map((u: any) => (
                             <button 
                               key={u.id}
                               onClick={() => handleSelectUser(u)}
                               className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between items-center"
                             >
                                <div>
                                    <div className="font-medium">{u.firstName} {u.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{u.idNumber} • {u.college}</div>
                                </div>
                                <User className="h-4 w-4 text-muted-foreground" />
                             </button>
                            ))
                        )}
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="rounded-lg border p-4 bg-primary/5 border-primary/20 flex justify-between items-center">
                    <div>
                        <div className="text-sm text-primary font-medium mb-1">Selected Student</div>
                        <div className="font-bold text-lg">{selectedUser.firstName} {selectedUser.lastName}</div>
                        <div className="text-sm text-muted-foreground">{selectedUser.idNumber} • {selectedUser.department || selectedUser.college}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Change</Button>
                 </div>
               )}
            </div>
          )}

          {mode === 'create' && (
            <div className="grid gap-3">
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-sm font-medium">User Type</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={userType}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(e) => setUserType(e.target.value as any)}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium">ID Number</label>
                    <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="e.g. 2023-0001" />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-sm font-medium">First Name</label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                     <label className="text-sm font-medium">College</label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={college} onChange={e => setCollege(e.target.value)}>
                        <option value="">Select College</option>
                        {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                   <div className="space-y-1">
                     <label className="text-sm font-medium">Department</label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={department} onChange={e => setDepartment(e.target.value)}>
                        <option value="">Select Department</option>
                        {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                   </div>
               </div>
               <div className="space-y-1">
                     <label className="text-sm font-medium">Year Level</label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={yearLevel} onChange={e => setYearLevel(e.target.value)}>
                        <option value="">Select Year</option>
                        {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
                     </select>
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t">
              <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Log Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Log Time</label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || (mode === 'search' && !selectedUser) || (mode === 'create' && (!idNumber || !firstName || !lastName))}
          >
            {submitting ? 'Adding...' : 'Add Log Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}