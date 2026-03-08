import { eq, and } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { tasks, type Task, type NewTask } from '../db/schema';

type Database = NeonHttpDatabase<Record<string, never>> | PostgresJsDatabase<Record<string, never>>;

export class TaskRepository {
	constructor(private readonly db: Database) {}

	async findAllByTenantId(tenantId: string): Promise<Task[]> {
		return this.db.select().from(tasks).where(eq(tasks.tenantId, tenantId));
	}

	async create(data: Omit<NewTask, 'id' | 'createdAt' | 'tenantId'>, tenantId: string): Promise<Task> {
		const [task] = await this.db
			.insert(tasks)
			.values({ ...data, tenantId })
			.returning();
		return task;
	}

	async deleteById(id: string, tenantId: string): Promise<Task | null> {
		const [deleted] = await this.db
			.delete(tasks)
			.where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)))
			.returning();
		return deleted ?? null;
	}
}
