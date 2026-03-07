import { TaskRepository } from '../repositories/task-repository';
import type { Task } from '../db/schema';

export interface CreateTaskInput {
	title: string;
	status?: string;
}

export class TaskService {
	constructor(private readonly taskRepository: TaskRepository) {}

	async findAllByTenantId(tenantId: string): Promise<Task[]> {
		return this.taskRepository.findAllByTenantId(tenantId);
	}

	async create(input: CreateTaskInput, tenantId: string): Promise<Task> {
		return this.taskRepository.create(
			{
				title: input.title,
				status: input.status ?? 'pending',
			},
			tenantId,
		);
	}

	async deleteById(id: string, tenantId: string): Promise<Task | null> {
		return this.taskRepository.deleteById(id, tenantId);
	}
}
