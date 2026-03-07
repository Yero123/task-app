import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'

// Uses a standard postgres-js driver — works with local Docker PostgreSQL
const client = postgres(process.env.DATABASE_TEST_URL!)
export const testDb = drizzle(client, { schema })
