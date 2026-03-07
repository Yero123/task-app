import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import tasks from './routes/tasks';

const app = new OpenAPIHono();

app.use(
	'*',
	cors({
		origin: (origin) => origin ?? '*',
		allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
	}),
);

app.get('/', (c) =>
	c.json({
		name: 'Task App API',
		version: '1.0.0',
		docs: '/ui',
	}),
);

app.route('/tasks', tasks);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
	type: 'http',
	scheme: 'bearer',
	bearerFormat: 'token',
});

app.doc('/doc', {
	openapi: '3.0.0',
	info: {
		title: 'Task App API',
		version: '1.0.0',
		description:
			'Multi-tenant task management API. All task endpoints require a **Bearer token** for authentication. Use token_tenant_a or token_tenant_b for testing.',
	},
	security: [{ BearerAuth: [] }],
});

app.get('/ui', swaggerUI({ url: '/doc' }));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
	console.error('Unhandled error:', err, c);
	return c.json({ error: 'Internal server error' }, 500);
});

export default app;
