import { createRoute, z } from '@hono/zod-openapi';
import {
	TaskSchema,
	CreateTaskBodySchema,
	TaskIdParamSchema,
	BearerAuthSchema,
	ErrorSchema,
	SuccessSchema,
} from '../schemas/task-schemas';

export const getTasksRoute = createRoute({
	method: 'get',
	path: '/',
	summary: 'List tasks',
	description: 'Returns all tasks belonging to the authenticated tenant only. Requires Bearer token.',
	request: {
		headers: BearerAuthSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.array(TaskSchema),
					description: 'List of tasks for the tenant',
				},
			},
			description: 'Successfully retrieved tasks',
		},
		401: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Missing or invalid Bearer token',
		},
	},
});

export const createTaskRoute = createRoute({
	method: 'post',
	path: '/',
	summary: 'Create task',
	description: 'Creates a new task for the authenticated tenant. Requires Bearer token.',
	request: {
		headers: BearerAuthSchema,
		body: {
			content: {
				'application/json': {
					schema: CreateTaskBodySchema,
					description: 'Task data to create',
				},
			},
			required: true,
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: TaskSchema,
					description: 'The created task',
				},
			},
			description: 'Task created successfully',
		},
		400: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Invalid request body (e.g. missing title)',
		},
		401: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Missing or invalid Bearer token',
		},
		429: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Rate limit exceeded (max 10 POST requests per minute per tenant)',
		},
	},
});

export const deleteTaskRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	summary: 'Delete task',
	description: 'Deletes a task only if it belongs to the authenticated tenant. Requires Bearer token.',
	request: {
		headers: BearerAuthSchema,
		params: TaskIdParamSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: SuccessSchema,
					description: 'Task deleted successfully',
				},
			},
			description: 'Task deleted successfully',
		},
		401: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Missing or invalid Bearer token',
		},
		404: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Task not found or access denied (task belongs to another tenant)',
		},
	},
});
