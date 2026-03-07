import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

// Load DATABASE_TEST_URL before workers start so globalSetup and testDb can read it
config({ path: '.env.test', override: true })

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		globalSetup: './src/tests/globalSetup.ts',
		setupFiles: ['./src/tests/setup.ts'],
	},
})
