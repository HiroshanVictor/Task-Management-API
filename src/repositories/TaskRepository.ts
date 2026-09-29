import { Task } from '../models/Task';

export interface TaskRepository {
  findAll(): Task[];
  findById(id: string): Task | undefined;
  create(task: Task): Task;
  update(id: string, changes: Partial<Task>): Task | undefined;
  delete(id: string): boolean;
}
