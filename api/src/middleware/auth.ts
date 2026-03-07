import type { Context, Next } from 'hono';
import type { Variables } from '../types/env';
import { getAuthFromToken } from '../auth/tokens';

export const authMiddleware = async (c: Context<{ Variables: Variables }>, next: Next) => {
	const authHeader = c.req.header('Authorization');
	console.log('authHeader', authHeader);
	const token = authHeader?.startsWith('Bearer ')
		? authHeader.slice(7).trim()
		: undefined;
	console.log('token', token);
	const auth = getAuthFromToken(token);
	if (!auth) {
		return c.json({ error: 'Missing or invalid token' }, 401);
	}

	c.set('tenantId', auth.tenantId);
	c.set('userId', auth.userId);
	await next();
};
