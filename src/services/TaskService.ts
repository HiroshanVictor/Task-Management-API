import { randomUUID } from 'crypto';
import { Task, TaskStatus } from '../models/Task';
import { TaskNotFoundError, ValidationError } from '../models/errors';
import { TaskRepository } from '../repositories/TaskRepository';

const ALLOWED_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'done'];

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
}

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  getAllTasks(): Task[] {
    return this.taskRepository.findAll();
  }

  getTaskById(id: string): Task {
    const task = this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(`Task with id "${id}" not found`);
    }
    return task;
  }

  createTask(input: CreateTaskInput): Task {
    const title = this.validateTitle(input.title);
    const status = this.validateStatus(input.status ?? 'pending');

    const now = new Date();
    const task: Task = {
      id: randomUUID(),
      title,
      description: input.description,
      status,
      createdAt: now,
      updatedAt: now,
    };

    return this.taskRepository.create(task);
  }

  updateTask(id: string, changes: UpdateTaskInput): Task {
    const existing = this.taskRepository.findById(id);
    if (!existing) {
      throw new TaskNotFoundError(`Task with id "${id}" not found`);
    }

    const updates: Partial<Task> = { updatedAt: new Date() };

    if (changes.title !== undefined) {
      updates.title = this.validateTitle(changes.title);
    }
    if (changes.description !== undefined) {
      updates.description = changes.description;
    }
    if (changes.status !== undefined) {
      updates.status = this.validateStatus(changes.status);
    }

    const updated = this.taskRepository.update(id, updates);
    if (!updated) {
      throw new TaskNotFoundError(`Task with id "${id}" not found`);
    }
    return updated;
  }

  deleteTask(id: string): void {
    const deleted = this.taskRepository.delete(id);
    if (!deleted) {
      throw new TaskNotFoundError(`Task with id "${id}" not found`);
    }
  }

  private validateTitle(title: string): string {
    const trimmed = typeof title === 'string' ? title.trim() : '';
    if (trimmed.length < 1 || trimmed.length > 100) {
      throw new ValidationError('title is required and must be between 1 and 100 characters');
    }
    return trimmed;
  }

  private validateStatus(status: string): TaskStatus {
    if (!ALLOWED_STATUSES.includes(status as TaskStatus)) {
      throw new ValidationError(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
    }
    return status as TaskStatus;
  }
}
