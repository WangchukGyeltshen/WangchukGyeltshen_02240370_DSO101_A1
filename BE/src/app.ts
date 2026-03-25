import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import healthRouter from './routes/health.routes';
import tasksRouter from './routes/tasks.routes';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Welcome to DSO101 backend API' });
});

app.use('/api/health', healthRouter);
app.use('/api/tasks', tasksRouter);

export default app;
