import { Router } from 'express';
import mongoose from 'mongoose';
import TaskModel from '../models/task.model';

const tasksRouter = Router();

const isValidTaskText = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

tasksRouter.get('/', async (_req, res) => {
  const tasks = await TaskModel.find().sort({ createdAt: -1 });
  res.status(200).json({
    data: tasks.map((task) => ({
      id: task.id,
      text: task.text
    }))
  });
});

tasksRouter.post('/', async (req, res) => {
  const { text } = req.body as { text?: unknown };

  if (!isValidTaskText(text)) {
    res.status(400).json({ message: 'Task text is required' });
    return;
  }

  const task = await TaskModel.create({ text: text.trim() });
  res.status(201).json({ data: { id: task.id, text: task.text } });
});

tasksRouter.put('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { text } = req.body as { text?: unknown };

  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400).json({ message: 'Invalid task id' });
    return;
  }

  if (!isValidTaskText(text)) {
    res.status(400).json({ message: 'Task text is required' });
    return;
  }

  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    { text: text.trim() },
    { new: true, runValidators: true }
  );

  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }

  res.status(200).json({ data: { id: task.id, text: task.text } });
});

tasksRouter.delete('/:id', async (req, res) => {
  const taskId = req.params.id;

  if (!mongoose.isValidObjectId(taskId)) {
    res.status(400).json({ message: 'Invalid task id' });
    return;
  }

  const deletedTask = await TaskModel.findByIdAndDelete(taskId);
  if (!deletedTask) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }

  res.status(204).send();
});

export default tasksRouter;
