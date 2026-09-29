import express, { Express } from 'express';
import { TaskController } from './controllers/TaskController';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository';
import { createTaskRouter } from './routes/taskRoutes';
import { TaskService } from './services/TaskService';

const app: Express = express();

app.use(express.json());

const taskRepository = new InMemoryTaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

app.use('/api/tasks', createTaskRouter(taskController));

export default app;
