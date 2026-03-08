import { config } from "dotenv";

config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		"No DATABASE_URL provided. Set it in .env for local dev, or use Docker Compose (includes PostgreSQL)."
	);
}

/**
 * Use Neon serverless driver only for Neon URLs (Cloudflare Workers, serverless).
 * Use postgres.js for standard PostgreSQL (Docker, local dev with local Postgres).
 */
const isNeonUrl = databaseUrl.includes("neon.tech");

let db: import("drizzle-orm/neon-http").NeonHttpDatabase | import("drizzle-orm/postgres-js").PostgresJsDatabase;

if (isNeonUrl) {
	const { neon } = await import("@neondatabase/serverless");
	const { drizzle } = await import("drizzle-orm/neon-http");
	const sql = neon(databaseUrl);
	db = drizzle({ client: sql });
} else {
	const postgres = (await import("postgres")).default;
	const { drizzle } = await import("drizzle-orm/postgres-js");
	const client = postgres(databaseUrl);
	db = drizzle(client);
}

export { db };
