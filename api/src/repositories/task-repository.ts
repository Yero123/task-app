import { eq, and } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tasks, type Task, type NewTask } from '../db/schema';

export class TaskRepository {
	constructor(private readonly db: NeonHttpDatabase) {}

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
