import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';

type AuthenticatedRequest = Request & { userId?: string };

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Missing auth token' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { sub?: string };
    if (!payload.sub) {
      res.status(401).json({ message: 'Invalid auth token' });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid auth token' });
  }
};
