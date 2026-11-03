import type { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
  permissions: string[];
};

export type AuthRequest = Request & { user?: AuthenticatedUser; sessionId?: string };
