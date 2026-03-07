export const TaskStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Done: 'done',
} as const

export type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
}

export type Task = {
  id: string
  title: string
  status: string
  tenantId: string
  createdAt: string
}

export type CreateTaskBody = {
  title: string
  status?: string
}
