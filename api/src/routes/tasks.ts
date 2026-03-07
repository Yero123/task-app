import { OpenAPIHono, $ } from '@hono/zod-openapi';
import { db } from '../db';
import { TaskRepository } from '../repositories/task-repository';
import { TaskService } from '../services/task-service';
import { authMiddleware } from '../middleware/auth';
import { postRateLimitMiddleware } from '../middleware/rate-limit';
import type { Variables } from '../types/env';
import { getTasksRoute, createTaskRoute, deleteTaskRoute } from './task-routes';

const taskRepository = new TaskRepository(db);
const taskService = new TaskService(taskRepository);

const tasks = $(new OpenAPIHono<{ Variables: Variables }>()
	.use(authMiddleware)
	.use(postRateLimitMiddleware));

tasks.openapi(getTasksRoute, async (c) => {
	const tenantId = c.get('tenantId');
	const items = await taskService.findAllByTenantId(tenantId);
	const serialized = items.map((t) => ({
		...t,
		createdAt: t.createdAt.toISOString(),
	}));
	return c.json(serialized, 200);
});

tasks.openapi(createTaskRoute, async (c) => {
	const tenantId = c.get('tenantId');
	const body = c.req.valid('json');
	const task = await taskService.create(
		{ title: body.title, status: body.status ?? 'pending' },
		tenantId,
	);
	return c.json(
		{
			...task,
			createdAt: task.createdAt.toISOString(),
		},
		201,
	);
});

tasks.openapi(deleteTaskRoute, async (c) => {
	const tenantId = c.get('tenantId');
	const { id } = c.req.valid('param');
	const deleted = await taskService.deleteById(id, tenantId);
	if (!deleted) {
		return c.json({ error: 'Task not found or access denied' }, 404);
	}
	return c.json({ success: true as const }, 200);
});

export default tasks;
