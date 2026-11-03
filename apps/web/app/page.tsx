'use client';

import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
type DashboardData = { user: { displayName: string | null }; stats: { activeEmployees: number; departments: number }; recentActivity: Array<{ id: string; action: string; resource: string; createdAt: string; actor: { profile: { displayName: string | null } | null } | null }>; unavailableModules: string[] };

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    fetch(`${apiUrl}/dashboard`, { credentials: 'include' })
      .then(async (response) => { if (response.status === 401) { window.location.href = '/login'; return null; } if (!response.ok) throw new Error('dashboard'); return response.json() as Promise<{ data: DashboardData }>; })
      .then((result) => { if (!result) return; setData(result.data); setState('ready'); })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <main className="portal-state"><p>Đang tải dữ liệu dashboard…</p></main>;
  if (state === 'error') return <main className="portal-state"><h1>Không tải được dashboard</h1><p>Kiểm tra kết nối API rồi thử tải lại trang.</p><button onClick={() => window.location.reload()}>Thử lại</button></main>;
  if (state === 'empty' || !data) return <main className="portal-state"><h1>Chưa có dữ liệu</h1><p>Dashboard chưa có dữ liệu phù hợp với tài khoản này.</p></main>;

  async function logout() {
    const csrf = document.cookie.split('; ').find((item) => item.startsWith('portal_csrf='))?.split('=')[1];
    await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include', headers: csrf ? { 'x-csrf-token': decodeURIComponent(csrf) } : {} });
    window.location.href = '/login';
  }

  return <div className="portal-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">P</div><div><strong>Portal</strong><span>Enterprise workspace</span></div></div><div className="workspace-switcher"><span className="workspace-dot" /> Không gian doanh nghiệp</div><nav className="nav" aria-label="Điều hướng chính"><p className="nav-label">TỔNG QUAN</p><a className="nav-item active" href="/">▦ Tổng quan</a><button className="nav-item nav-button" onClick={logout}>↪ Đăng xuất</button><p className="nav-label">ĐÃ TRIỂN KHAI</p><span className="nav-item disabled">♙ Nhân sự · API có sẵn, UI đang triển khai</span><span className="nav-item disabled">▤ Phòng ban · API có sẵn, UI đang triển khai</span><p className="nav-label">CHƯA TRIỂN KHAI</p>{data.unavailableModules.map((module) => <span className="nav-item disabled" key={module}>— {module}</span>)}</nav><div className="sidebar-footer"><div className="avatar small">{(data.user.displayName ?? 'U').slice(0, 2).toUpperCase()}</div><div><strong>{data.user.displayName ?? 'Người dùng'}</strong><span>Tài khoản hiện tại</span></div></div></aside><main className="main-content"><header className="topbar"><div className="breadcrumb">Tổng quan <span>/</span> Dashboard</div></header><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">DỮ LIỆU THỰC TỪ API</p><h1>Chào, {data.user.displayName ?? 'bạn'} <span>✦</span></h1><p className="subheading">Các số liệu dưới đây lấy trực tiếp từ hệ thống, không dùng dữ liệu mẫu.</p></div></section><section className="stats-grid"><article className="stat-card blue"><div className="stat-icon">♙</div><div><p>Nhân sự đang hoạt động</p><strong>{data.stats.activeEmployees}</strong><small>Nguồn: PostgreSQL</small></div></article><article className="stat-card green"><div className="stat-icon">⌂</div><div><p>Phòng ban</p><strong>{data.stats.departments}</strong><small>Nguồn: PostgreSQL</small></div></article><article className="stat-card orange"><div className="stat-icon">◷</div><div><p>Yêu cầu chờ duyệt</p><strong>—</strong><small>Module approvals chưa triển khai</small></div></article><article className="stat-card purple"><div className="stat-icon">▱</div><div><p>Tài liệu nội bộ</p><strong>—</strong><small>Module documents chưa triển khai</small></div></article></section><section className="dashboard-grid"><article className="panel activity-panel"><div className="panel-heading"><div><h2>Audit gần đây</h2><p>Hoạt động đã được ghi nhận trong hệ thống</p></div></div>{data.recentActivity.length === 0 ? <div className="empty-activity"><p>Chưa có hoạt động nào được ghi nhận.</p></div> : <div className="activity-list">{data.recentActivity.map((item) => <div className="activity" key={item.id}><div className="avatar blue">{(item.actor?.profile?.displayName ?? 'SY').slice(0, 2).toUpperCase()}</div><div><p><strong>{item.actor?.profile?.displayName ?? 'Hệ thống'}</strong> · {item.action} · {item.resource}</p><small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small></div></div>)}</div>}</article><article className="panel calendar-panel"><div className="panel-heading"><div><h2>Lịch làm việc</h2><p>Module calendar chưa được triển khai</p></div></div><div className="empty-activity"><p>Chưa có API lịch làm việc. Không hiển thị dữ liệu giả.</p></div></article></section></div></main></div>;
}