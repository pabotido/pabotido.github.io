export type ApiMeta = { requestId: string };

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
};
