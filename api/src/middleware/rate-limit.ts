import type { Context, Next } from 'hono';
import type { Variables } from '../types/env';

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

const store = new Map<string, { count: number; resetAt: number }>();

export const postRateLimitMiddleware = async (
	c: Context<{ Variables: Variables }>,
	next: Next,
) => {
	if (c.req.method !== 'POST') {
		await next();
		return;
	}

	const tenantId = c.get('tenantId');
	const key = `post:${tenantId}`;
	const now = Date.now();

	let entry = store.get(key);
	if (!entry) {
		entry = { count: 0, resetAt: now + WINDOW_MS };
		store.set(key, entry);
	}

	if (now >= entry.resetAt) {
		entry.count = 0;
		entry.resetAt = now + WINDOW_MS;
	}

	entry.count++;

	if (entry.count > MAX_REQUESTS) {
		return c.json(
			{ error: 'Too many requests. Please try again later.' },
			429,
		);
	}

	await next();
};
