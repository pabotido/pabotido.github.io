import type { Request } from 'express';

export type ApiRequest = Request & { requestId?: string };
