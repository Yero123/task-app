import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getTasks, createTask, deleteTask } from '@/services/task-service'
import type { Tenant } from '@/types/task'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'default',
  done: 'outline',
}

export default function App() {
  const [tenant, setTenant] = useState<Tenant>('tenant_a')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('pending')

  const queryClient = useQueryClient()

  
  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks', tenant],
    queryFn: () => getTasks(tenant),
  })

  const createMutation = useMutation({
    mutationFn: ({ title, status }: { title: string; status: string }) =>
      createTask(tenant, { title, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', tenant] })
      setOpen(false)
      setTitle('')
      setStatus('pending')
    },
  })


  

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', tenant] })
    },
  })

  function handleCreate(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate({ title: title.trim(), status })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Task Manager</h1>
            <p className="text-sm text-muted-foreground">Multi-tenant task management</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Tenant Selector */}
            <Select value={tenant} onValueChange={(v) => setTenant(v as Tenant)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant_a">Tenant A</SelectItem>
                <SelectItem value="tenant_b">Tenant B</SelectItem>
              </SelectContent>
            </Select>

            {/* Create Task Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={!title.trim() || createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Creating…' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Active tenant indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Viewing tasks for</span>
          <Badge variant="outline">{tenant === 'tenant_a' ? 'Tenant A' : 'Tenant B'}</Badge>
        </div>

        {/* Task Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Loading tasks…
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive py-10">
                    Failed to load tasks. Is the API running?
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    No tasks yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[task.status] ?? 'secondary'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(task.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
