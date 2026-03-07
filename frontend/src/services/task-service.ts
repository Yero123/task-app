import type { Task, CreateTaskBody, Tenant } from '@/types/task'
import { TENANT_TOKENS } from '@/types/task'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

function getHeaders(tenant: Tenant): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TENANT_TOKENS[tenant]}`,
  }
}

export async function getTasks(tenant: Tenant): Promise<Task[]> {
  console.log('getTasks', tenant)
  console.log('getHeaders', getHeaders(tenant))
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: getHeaders(tenant),
  })
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(tenant: Tenant, body: CreateTaskBody): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getHeaders(tenant),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function deleteTask(tenant: Tenant, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(tenant),
  })
  if (!res.ok) throw new Error('Failed to delete task')
}
