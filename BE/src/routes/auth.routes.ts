import { Router } from 'express';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';

const authRouter = Router();
const scrypt = promisify(scryptCallback);
const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
};

const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, 'hex');

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
};

authRouter.post('/signup', async (req, res) => {
  const { name, email, password } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (!isNonEmptyString(name)) {
    res.status(400).json({ message: 'Name is required' });
    return;
  }

  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    res.status(400).json({ message: 'Valid email is required' });
    return;
  }

  if (!isNonEmptyString(password) || password.trim().length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await UserModel.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(409).json({ message: 'Email already exists' });
    return;
  }

  try {
    const passwordHash = await hashPassword(password.trim());
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    const errorCode = (error as { code?: number }).code;
    if (errorCode === 11000) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }

    res.status(500).json({ message: 'Failed to create user' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    res.status(400).json({ message: 'Valid email is required' });
    return;
  }

  if (!isNonEmptyString(password)) {
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await UserModel.findOne({ email: normalizedEmail }).select(
    '+passwordHash'
  );

  if (!user || !user.passwordHash) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const isMatch = await verifyPassword(password.trim(), user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });

  res.status(200).json({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      token
    }
  });
});

export default authRouter;
