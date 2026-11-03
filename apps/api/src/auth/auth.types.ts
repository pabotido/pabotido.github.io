import type { UserStatus } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  status: UserStatus;
  permissions: string[];
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    sessionId?: string;
  }
}
