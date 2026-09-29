import { Request, Response } from 'express';
import { TaskNotFoundError, ValidationError } from '../models/errors';
import { TaskService } from '../services/TaskService';

interface TaskParams {
  id: string;
}

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  getAllTasks(req: Request, res: Response): void {
    try {
      const tasks = this.taskService.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  getTaskById(req: Request<TaskParams>, res: Response): void {
    try {
      const task = this.taskService.getTaskById(req.params.id);
      res.status(200).json(task);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  createTask(req: Request, res: Response): void {
    try {
      const task = this.taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  updateTask(req: Request<TaskParams>, res: Response): void {
    try {
      const task = this.taskService.updateTask(req.params.id, req.body);
      res.status(200).json(task);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  deleteTask(req: Request<TaskParams>, res: Response): void {
    try {
      this.taskService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof TaskNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
