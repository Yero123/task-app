import { describe, expect, it } from 'vitest'
import app from '../index'

interface TaskResponse {
	id: string
	title: string
	status: string
	tenantId: string
	createdAt: string
}

const HEADERS_A = {
	Authorization: 'Bearer token_tenant_a',
	'Content-Type': 'application/json',
}

const HEADERS_B = {
	Authorization: 'Bearer token_tenant_b',
	'Content-Type': 'application/json',
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

describe('Auth', () => {
	it('returns 401 without token', async () => {
		const res = await app.request('/tasks')
		expect(res.status).toBe(401)
	})

	it('returns 401 with an invalid token', async () => {
		const res = await app.request('/tasks', {
			headers: { Authorization: 'Bearer wrong_token' },
		})
		expect(res.status).toBe(401)
	})
})

// ---------------------------------------------------------------------------
// GET /tasks
// ---------------------------------------------------------------------------

describe('GET /tasks', () => {
	it('returns an empty list when the tenant has no tasks', async () => {
		const res = await app.request('/tasks', { headers: HEADERS_A })
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual([])
	})

	it('returns only the tasks belonging to the authenticated tenant', async () => {
		await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: 'Task A' }),
		})
		await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_B,
			body: JSON.stringify({ title: 'Task B' }),
		})

		const resA = await app.request('/tasks', { headers: HEADERS_A })
		const tasksA = (await resA.json()) as TaskResponse[]
		expect(tasksA).toHaveLength(1)
		expect(tasksA[0].title).toBe('Task A')
		expect(tasksA[0].tenantId).toBe('tenant_a')

		const resB = await app.request('/tasks', { headers: HEADERS_B })
		const tasksB = (await resB.json()) as TaskResponse[]
		expect(tasksB).toHaveLength(1)
		expect(tasksB[0].title).toBe('Task B')
		expect(tasksB[0].tenantId).toBe('tenant_b')
	})
})

// ---------------------------------------------------------------------------
// POST /tasks
// ---------------------------------------------------------------------------

describe('POST /tasks', () => {
	it('creates a task with default pending status', async () => {
		const res = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: 'New Task' }),
		})
		expect(res.status).toBe(201)
		const task = (await res.json()) as TaskResponse
		expect(task.title).toBe('New Task')
		expect(task.status).toBe('pending')
		expect(task.tenantId).toBe('tenant_a')
		expect(task.id).toBeDefined()
		expect(task.createdAt).toBeDefined()
	})

	it('creates a task with a custom status', async () => {
		const res = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: 'Done Task', status: 'done' }),
		})
		expect(res.status).toBe(201)
		expect(((await res.json()) as TaskResponse).status).toBe('done')
	})

	it('returns 400 when title is missing', async () => {
		const res = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({}),
		})
		expect(res.status).toBe(400)
	})

	it('returns 400 when title is empty', async () => {
		const res = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: '' }),
		})
		expect(res.status).toBe(400)
	})

	it('returns 401 without token', async () => {
		const res = await app.request('/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: 'Task' }),
		})
		expect(res.status).toBe(401)
	})
})

// ---------------------------------------------------------------------------
// DELETE /tasks/:id
// ---------------------------------------------------------------------------

describe('DELETE /tasks/:id', () => {
	it('deletes a task that belongs to the tenant', async () => {
		const createRes = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: 'To Delete' }),
		})
		const { id } = (await createRes.json()) as TaskResponse

		const deleteRes = await app.request(`/tasks/${id}`, {
			method: 'DELETE',
			headers: HEADERS_A,
		})
		expect(deleteRes.status).toBe(200)
		expect(await deleteRes.json()).toEqual({ success: true })
	})

	it('returns 404 for a non-existent task', async () => {
		const res = await app.request('/tasks/00000000-0000-0000-0000-000000000000', {
			method: 'DELETE',
			headers: HEADERS_A,
		})
		expect(res.status).toBe(404)
	})

	it('returns 401 without token', async () => {
		const res = await app.request('/tasks/00000000-0000-0000-0000-000000000000', {
			method: 'DELETE',
		})
		expect(res.status).toBe(401)
	})

	it('the deleted task no longer appears in GET /tasks', async () => {
		const createRes = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: 'Temporary Task' }),
		})
		const { id } = (await createRes.json()) as TaskResponse

		await app.request(`/tasks/${id}`, { method: 'DELETE', headers: HEADERS_A })

		const listRes = await app.request('/tasks', { headers: HEADERS_A })
		const list = (await listRes.json()) as TaskResponse[]
		expect(list.find((t) => t.id === id)).toBeUndefined()
	})
})

// ---------------------------------------------------------------------------
// Tenant isolation
// ---------------------------------------------------------------------------

describe('Tenant Isolation', () => {
	it('tenant_a cannot see tasks created by tenant_b', async () => {
		await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_B,
			body: JSON.stringify({ title: 'Secret B task' }),
		})

		const res = await app.request('/tasks', { headers: HEADERS_A })
		expect(await res.json()).toHaveLength(0)
	})

	it('tenant_b cannot see tasks created by tenant_a', async () => {
		await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_A,
			body: JSON.stringify({ title: 'Secret A task' }),
		})

		const res = await app.request('/tasks', { headers: HEADERS_B })
		expect(await res.json()).toHaveLength(0)
	})

	it('tenant_a cannot delete a task owned by tenant_b', async () => {
		const createRes = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_B,
			body: JSON.stringify({ title: 'B task' }),
		})
		const { id } = (await createRes.json()) as TaskResponse

		const deleteRes = await app.request(`/tasks/${id}`, {
			method: 'DELETE',
			headers: HEADERS_A, // tenant_a attempts to delete tenant_b's task
		})
		expect(deleteRes.status).toBe(404)
	})

	it("tenant_b's task still exists after tenant_a's failed delete attempt", async () => {
		const createRes = await app.request('/tasks', {
			method: 'POST',
			headers: HEADERS_B,
			body: JSON.stringify({ title: 'B task' }),
		})
		const { id } = (await createRes.json()) as TaskResponse

		await app.request(`/tasks/${id}`, { method: 'DELETE', headers: HEADERS_A })

		const listRes = await app.request('/tasks', { headers: HEADERS_B })
		const list = (await listRes.json()) as TaskResponse[]
		expect(list.find((t) => t.id === id)).toBeDefined()
	})
})
