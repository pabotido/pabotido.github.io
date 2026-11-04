export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

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
