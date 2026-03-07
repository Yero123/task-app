import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getTasks, createTask, deleteTask } from '@/services/task-service'
import type { Tenant } from '@/types/tenant'

export function useTasks(tenant: Tenant) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks', tenant],
    queryFn: () => getTasks(tenant),
  })

  const createMutation = useMutation({
    mutationFn: ({ title, status }: { title: string; status: string }) =>
      createTask(tenant, { title, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', tenant] })
      toast.success('Task created')
    },
    onError: () => toast.error('Failed to create task. Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', tenant] })
      setDeletingId(null)
      toast.success('Task deleted')
    },
    onError: () => {
      setDeletingId(null)
      toast.error('Failed to delete task. Please try again.')
    },
  })

  function handleDelete(id: string) {
    setDeletingId(id)
    deleteMutation.mutate(id)
  }

  return { tasks, isLoading, isError, createMutation, deletingId, handleDelete }
}
