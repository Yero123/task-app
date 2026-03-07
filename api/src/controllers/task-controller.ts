import type { Context } from 'hono';
import { TaskService } from '../services/task-service';
import type { Variables } from '../types/env';

type TaskContext = Context<{ Variables: Variables }>;

const serializeTask = (task: {
	id: string;
	title: string;
	status: string;
	tenantId: string;
	createdAt: Date;
}) => ({
	...task,
	createdAt: task.createdAt.toISOString(),
});

export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	async getAll(c: TaskContext) {
		const tenantId = c.get('tenantId');
		const items = await this.taskService.findAllByTenantId(tenantId);
		return c.json(items.map(serializeTask));
	}

	async create(c: TaskContext) {
		const tenantId = c.get('tenantId');
		const body = (c.req.valid as (target: 'json') => { title: string; status?: string })('json');

		const task = await this.taskService.create(
			{
				title: body.title,
				status: body.status ?? 'pending',
			},
			tenantId,
		);

		return c.json(serializeTask(task), 201);
	}

	async deleteById(c: TaskContext) {
		const tenantId = c.get('tenantId');
		const { id } = (c.req.valid as (target: 'param') => { id: string })('param');

		const deleted = await this.taskService.deleteById(id, tenantId);

		if (!deleted) {
			return c.json({ error: 'Task not found or access denied' }, 404);
		}

		return c.json({ success: true });
	}
}
