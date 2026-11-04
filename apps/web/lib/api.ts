export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export type CmsArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  audienceType: 'COMPANY' | 'DEPARTMENT';
  departmentId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; profile: { displayName: string | null } | null };
  department: { id: string; name: string } | null;
  categories: Array<{ category: CmsTaxonomy }>;
  tags: Array<{ tag: CmsTaxonomy }>;
};

export type CurrentUser = { id: string; email: string; permissions: string[] };
export type CmsDepartment = { id: string; name: string };
export type CmsTaxonomy = { id: string; name: string; slug: string };
export type PublishedNewsPage = { items: CmsArticle[]; page: number; pageSize: number; total: number };

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(init?.method && init.method !== 'GET' ? { 'x-csrf-token': window.sessionStorage.getItem('portal_csrf') ?? '' } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 401) {
    window.location.assign('/login');
    throw new Error('unauthorized');
  }
  const result = await response.json() as { data?: T; error?: { message?: string } };
  if (!response.ok || result.data === undefined) throw new Error(result.error?.message ?? 'Yêu cầu không thành công. Vui lòng thử lại.');
  return result.data;
}

export const listPublishedNews = (filters: { q?: string; category?: string; tag?: string; page?: number; pageSize?: number } = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value !== undefined && value !== '') params.set(key, String(value));
  return apiRequest<PublishedNewsPage>(`/news${params.size ? `?${params.toString()}` : ''}`);
};
export const getPublishedNews = (slug: string) => apiRequest<CmsArticle>(`/news/${encodeURIComponent(slug)}`);
export const listManagedArticles = () => apiRequest<CmsArticle[]>('/cms/articles');
export const getCurrentUser = () => apiRequest<CurrentUser>('/auth/me');
export const listCmsDepartments = () => apiRequest<CmsDepartment[]>('/cms/departments');
export const listCmsCategories = () => apiRequest<CmsTaxonomy[]>('/cms/categories');
export const listCmsTags = () => apiRequest<CmsTaxonomy[]>('/cms/tags');
export const listPublicCategories = () => apiRequest<CmsTaxonomy[]>('/news/categories');
export const listPublicTags = () => apiRequest<CmsTaxonomy[]>('/news/tags');
export const createArticle = (input: Pick<CmsArticle, 'title' | 'slug' | 'summary' | 'body'> & { audienceType: CmsArticle['audienceType']; departmentId?: string; categoryIds?: string[]; tagIds?: string[] }) =>
  apiRequest<CmsArticle>('/cms/articles', { method: 'POST', body: JSON.stringify(input) });
export const updateArticle = (id: string, input: Partial<Pick<CmsArticle, 'title' | 'slug' | 'summary' | 'body' | 'audienceType'>> & { departmentId?: string; categoryIds?: string[]; tagIds?: string[] }) =>
  apiRequest<CmsArticle>(`/cms/articles/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const createCmsCategory = (input: Pick<CmsTaxonomy, 'name' | 'slug'>) => apiRequest<CmsTaxonomy>('/cms/categories', { method: 'POST', body: JSON.stringify(input) });
export const createCmsTag = (input: Pick<CmsTaxonomy, 'name' | 'slug'>) => apiRequest<CmsTaxonomy>('/cms/tags', { method: 'POST', body: JSON.stringify(input) });
export const submitArticle = (id: string) => apiRequest<CmsArticle>(`/cms/articles/${id}/submit`, { method: 'POST' });
export const approveArticle = (id: string) => apiRequest<CmsArticle>(`/cms/articles/${id}/approve`, { method: 'POST' });
export const publishArticle = (id: string) => apiRequest<CmsArticle>(`/cms/articles/${id}/publish`, { method: 'POST' });

export type DashboardData = {
  user: { displayName: string | null };
  stats: { activeEmployees: number; departments: number };
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string;
    createdAt: string;
    actor: { profile: { displayName: string | null } | null } | null;
  }>;
  unavailableModules: string[];
};

export async function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  const response = await fetch(`${apiUrl}/dashboard`, {
    credentials: 'include',
    signal,
  });

  if (response.status === 401) {
    window.location.assign('/login');
    throw new Error('unauthorized');
  }

  if (!response.ok) throw new Error('dashboard_request_failed');

  const result = (await response.json()) as { data: DashboardData };
  return result.data;
}

export async function revokeSession(csrfToken: string | null) {
  if (!csrfToken) throw new Error('Không tìm thấy mã bảo vệ phiên. Hãy tải lại trang và thử lại.');
  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'x-csrf-token': csrfToken },
  });
  if (!response.ok && response.status !== 401) throw new Error('Không thể đăng xuất. Vui lòng thử lại.');
}
