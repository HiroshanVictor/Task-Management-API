import { Task } from '../models/Task';
import { TaskRepository } from './TaskRepository';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, changes: Partial<Task>): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Task = { ...existing, ...changes };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
