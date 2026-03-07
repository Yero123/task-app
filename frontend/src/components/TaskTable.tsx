import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { formatStatus } from '@/lib/utils'
import type { Task } from '@/types/task'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'default',
  done: 'outline',
}

interface Props {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  deletingId: string | null
  onDelete: (id: string) => void
}

export function TaskTable({ tasks, isLoading, isError, deletingId, onDelete }: Props) {
  return (
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
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
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
                  {formatStatus(task.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(task.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DeleteConfirmDialog
                  id={task.id}
                  title={task.title}
                  onConfirm={onDelete}
                  isPending={deletingId === task.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
