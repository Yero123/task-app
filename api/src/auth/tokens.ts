export type AuthPayload = {
	tenantId: string;
	userId: string;
};

export type TokenRegistry = Record<string, AuthPayload>;

export const TOKENS: TokenRegistry = {
	token_tenant_a: { tenantId: 'tenant_a', userId: 'user_1' },
	token_tenant_b: { tenantId: 'tenant_b', userId: 'user_2' },
};

export const getAuthFromToken = (token: string | undefined): AuthPayload | null => {
	if (!token || typeof token !== 'string') return null;
	return TOKENS[token] ?? null;
};
