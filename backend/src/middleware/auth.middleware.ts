import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token missing or invalid.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'attendsync_fallback_secret_key_12345';
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT verification error details:', error);
    res.status(403).json({ message: 'Token expired or invalid.' });
    return;
  }
};
