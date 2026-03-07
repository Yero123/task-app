import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

// Load DATABASE_TEST_URL before workers start — no override so CI env vars take precedence
config({ path: '.env.test' })

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		globalSetup: './src/tests/globalSetup.ts',
		setupFiles: ['./src/tests/setup.ts'],
	},
})
