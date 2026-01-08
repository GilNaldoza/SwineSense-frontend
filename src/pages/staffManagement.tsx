import * as React from 'react'
import { getAdmins, deleteAdmin, createAdmin, type Admin } from '@/api/admins'
import { getAudits, type AuditLog } from '@/api/audit'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2, Plus, ShieldCheck, User, Activity, Loader2 } from 'lucide-react'
import WobbleFlipLoader from '@/components/ui/WobbleFlipLoader'

function AuditDialog({ admin, open, onOpenChange }: { admin: Admin | null, open: boolean, onOpenChange: (v: boolean) => void }) {
    const [page, setPage] = React.useState(1)
    
    // Reset page when admin changes
    React.useEffect(() => {
        if(open) setPage(1)
    }, [open, admin])

    const { data, isLoading } = useQuery({
        queryKey: ['audits', admin?.adminId, page],
        queryFn: () => getAudits({ adminId: admin?.adminId, page, limit: 10 }),
        enabled: !!admin && open
    })

    const audits = (data?.data?.audits || []) as AuditLog[]
    const pagination = data?.data?.pagination

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Audit Logs: {admin?.username}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader>
                             <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[150px]">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : audits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No activity found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                audits.map(audit => (
                                    <TableRow key={audit.auditId}>
                                        <TableCell className="font-medium capitalize">{audit.actionType}</TableCell>
                                        <TableCell>{audit.targetTable} #{audit.targetId}</TableCell>
                                        <TableCell className="text-muted-foreground">{audit.description}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(audit.createdAt).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {pagination && pagination.totalPages > 1 && (
                     <div className="flex justify-center gap-2 pt-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!pagination.hasPrevPage}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm">
                            Page {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => p + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                        </Button>
                     </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default function StaffManagement() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = React.useState(false)
  
  // Audits state
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null)
  
  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: getAdmins
  })

  // Create Form State
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<'staff' | 'super_admin'>('staff')

  const createMut = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Staff created successfully')
      setModalOpen(false)
      setUsername(''); setPassword(''); setFullName(''); setEmail(''); setRole('staff')
    },
    onError: (err) => {
      toast.error('Failed to create staff')
      console.error(err)
    }
  })

  const deleteMut = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Staff deleted')
    },
    onError: () => {
        toast.error('Failed to delete staff')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || !fullName || !email) {
        toast.warning('All fields are required')
        return
    }
    createMut.mutate({ username, password, fullName, email, role })
  }

  // Get current user ID to prevent self-delete button
  const currentAdminId = React.useMemo(() => {
      try {
          const p = JSON.parse(localStorage.getItem('profile') || '{}')
          return p.adminId
      } catch { return -1 }
  }, [])

  if (isLoading) return <div className="flex justify-center p-10"><WobbleFlipLoader /></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">Manage system administrators and staff access.</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 text-white bg-blue-600 hover:bg-blue-700"> <Plus size={16} /> Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="jdoe" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="john@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Role</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" name="role" checked={role === 'staff'} onChange={() => setRole('staff')} />
                                Staff
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" name="role" checked={role === 'super_admin'} onChange={() => setRole('super_admin')} />
                                Super Admin
                            </label>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMut.isPending}>
                            {createMut.isPending ? 'Creating...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {admins?.map((admin) => (
                    <TableRow key={admin.adminId}>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{admin.fullName}</span>
                                <span className="text-xs text-muted-foreground">@{admin.username}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {admin.role === 'super_admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                                {admin.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                            </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                            {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
                             <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => setSelectedAdmin(admin)}
                                title="View Activity"
                            >
                                <Activity size={16} />
                            </Button>

                            {admin.adminId !== currentAdminId && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this staff member?')) {
                                            deleteMut.mutate(admin.adminId)
                                        }
                                    }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>

      <AuditDialog 
        admin={selectedAdmin} 
        open={!!selectedAdmin} 
        onOpenChange={(v) => !v && setSelectedAdmin(null)} 
      />

    </div>
  )
}
