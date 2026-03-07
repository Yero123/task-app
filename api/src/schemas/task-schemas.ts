import { z } from '@hono/zod-openapi';

export const TaskSchema = z
	.object({
		id: z.string().uuid().openapi({
			example: '550e8400-e29b-41d4-a716-446655440000',
			description: 'Unique task identifier',
		}),
		title: z.string().openapi({
			example: 'Complete project documentation',
			description: 'Task title',
		}),
		status: z.string().openapi({
			example: 'pending',
			description: 'Task status (e.g. pending, in_progress, done)',
		}),
		tenantId: z.string().openapi({
			example: 'tenant-abc-123',
			description: 'Tenant identifier for multi-tenant isolation',
		}),
		createdAt: z.string().openapi({
			example: '2025-03-03T12:00:00.000Z',
			description: 'ISO 8601 timestamp when the task was created',
		}),
	})
	.openapi('Task');

export const CreateTaskBodySchema = z
	.object({
		title: z
			.string()
			.min(1, 'title is required')
			.openapi({
				example: 'Review pull request',
				description: 'Task title (required)',
			}),
		status: z
			.string()
			.optional()
			.default('pending')
			.openapi({
				example: 'pending',
				description: 'Task status, defaults to "pending"',
			}),
	})
	.openapi('CreateTaskBody');

export const TaskIdParamSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: 'id', in: 'path' },
			example: '550e8400-e29b-41d4-a716-446655440000',
			description: 'Task UUID to delete',
		}),
});

export const BearerAuthSchema = z.object({
	authorization: z
		.string()
		.min(1, 'Authorization header is required')
		.startsWith('Bearer ', 'Must use Bearer token')
		.openapi({
			param: { name: 'authorization', in: 'header' },
			example: 'Bearer token_tenant_a',
			description: 'Bearer token for authentication (e.g. token_tenant_a or token_tenant_b)',
		}),
});

export const ErrorSchema = z.object({
	error: z.string().openapi({
		example: 'Validation failed',
		description: 'Error message',
	}),
});

export const SuccessSchema = z.object({
	success: z.literal(true).openapi({
		description: 'Indicates the operation completed successfully',
	}),
});
