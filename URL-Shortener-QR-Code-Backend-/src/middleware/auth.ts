import { Request, Response, NextFunction } from 'express';
import { authSupabase } from '../config/supabase.auth';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  const { data, error } = await authSupabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

req.user = {
  id: data.user.id,
  email: data.user.email ?? '',
};

  next();
};
