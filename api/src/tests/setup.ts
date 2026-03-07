import { beforeEach, vi } from 'vitest'
import { testDb } from './testDb'
import { tasks } from '../db/schema'

// Replace the production neon db with the local postgres test db
vi.mock('../db', () => ({ db: testDb }))

// Wipe tasks before each test so every test starts with a clean slate
beforeEach(async () => {
	await testDb.delete(tasks)
})
