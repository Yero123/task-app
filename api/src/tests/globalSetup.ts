import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { tenants } from '../db/schema'

/**
 * Runs once before all test files.
 * - Applies pending migrations to the test DB
 * - Seeds tenant_a and tenant_b (required by the auth tokens)
 */
export async function setup() {
	const client = postgres(process.env.DATABASE_TEST_URL!)
	const db = drizzle(client)

	await migrate(db, { migrationsFolder: './migrations' })

	await drizzle(client, { schema: { tenants } })
		.insert(tenants)
		.values([{ id: 'tenant_a' }, { id: 'tenant_b' }])
		.onConflictDoNothing()

	await client.end()
	console.log('✓ Test DB ready')
}
