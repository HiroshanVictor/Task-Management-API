import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { InMemoryTaskRepository } from '../repositories/InMemoryTaskRepository';
import { TaskService } from '../services/TaskService';

const taskRepository = new InMemoryTaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

const router = Router();

router.get('/', (req, res) => taskController.getAllTasks(req, res));
router.get('/:id', (req, res) => taskController.getTaskById(req, res));
router.post('/', (req, res) => taskController.createTask(req, res));
router.put('/:id', (req, res) => taskController.updateTask(req, res));
router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

export default router;
