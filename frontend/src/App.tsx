import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toaster } from '@/components/ui/sonner'
import { CreateTaskDialog } from '@/components/CreateTaskDialog'
import { TaskTable } from '@/components/TaskTable'
import { useTasks } from '@/hooks/useTasks'
import type { Tenant } from '@/types/tenant'

export default function App() {
  const [tenant, setTenant] = useState<Tenant>('tenant_a')
  const { tasks, isLoading, isError, createMutation, deletingId, handleDelete } = useTasks(tenant)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Task Manager</h1>
            <p className="text-sm text-muted-foreground">Multi-tenant task management</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={tenant} onValueChange={(v) => setTenant(v as Tenant)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant_a">Tenant A</SelectItem>
                <SelectItem value="tenant_b">Tenant B</SelectItem>
              </SelectContent>
            </Select>
            <CreateTaskDialog
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Viewing tasks for</span>
          <Badge variant="outline">{tenant === 'tenant_a' ? 'Tenant A' : 'Tenant B'}</Badge>
        </div>

        <TaskTable
          tasks={tasks}
          isLoading={isLoading}
          isError={isError}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      </div>
      <Toaster />
    </div>
  )
}
