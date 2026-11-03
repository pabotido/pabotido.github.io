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

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=').slice(1).join('=');
}

export async function revokeSession() {
  const csrf = readCookie('portal_csrf');
  await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: csrf ? { 'x-csrf-token': decodeURIComponent(csrf) } : undefined,
  });
}
