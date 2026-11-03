'use client';

import { useEffect, useState } from 'react';
import { getDashboard, type DashboardData } from '../lib/api';
import { PortalShell } from '../components/portal/portal-shell';

type ViewState = 'loading' | 'ready' | 'empty' | 'error';

function DashboardState({ state, onRetry }: { state: Exclude<ViewState, 'ready'>; onRetry?: () => void }) {
  const content = {
    loading: { title: 'Đang tải tổng quan', text: 'Đang đồng bộ dữ liệu từ hệ thống.' },
    empty: { title: 'Chưa có dữ liệu', text: 'Dashboard chưa có dữ liệu phù hợp với tài khoản này.' },
    error: { title: 'Không tải được dashboard', text: 'Kiểm tra kết nối API rồi thử lại.' },
  }[state];
  return <section className={`dashboard-state ${state}`} aria-live="polite">
    {state === 'loading' && <span className="loading-spinner" aria-hidden="true" />}
    <h1>{content.title}</h1><p>{content.text}</p>
    {state === 'error' && <button className="primary-button" type="button" onClick={onRetry}>Thử lại</button>}
  </section>;
}

function formatActivity(activity: DashboardData['recentActivity'][number]) { return `${activity.action} ${activity.resource}`; }

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<ViewState>('loading');
  async function loadDashboard() {
    setState('loading');
    try { const result = await getDashboard(); setData(result); setState(result ? 'ready' : 'empty'); }
    catch (error) { if (error instanceof Error && error.message === 'unauthorized') return; setState('error'); }
  }
  useEffect(() => { void loadDashboard(); }, []);
  if (state !== 'ready' || !data) {
    const pendingState = state === 'ready' ? 'loading' : state;
    return <main className="portal-state"><DashboardState state={pendingState} onRetry={() => void loadDashboard()} /></main>;
  }
  const displayName = data.user.displayName ?? 'bạn';
  return <PortalShell displayName={displayName} unavailableModules={data.unavailableModules}>
    <header className="topbar"><div className="breadcrumb"><span>Không gian doanh nghiệp</span><strong>/</strong> Tổng quan</div><span className="data-badge"><i aria-hidden="true" /> Dữ liệu trực tiếp</span></header>
    <div className="content-wrap">
      <section className="welcome-row"><div><p className="eyebrow">TỔNG QUAN HỆ THỐNG</p><h1>Chào, {displayName}</h1><p className="subheading">Theo dõi nhanh tình hình vận hành từ những dữ liệu đã được triển khai.</p></div></section>
      <section className="stats-grid" aria-label="Chỉ số tổng quan">
        <article className="stat-card blue"><span className="stat-icon" aria-hidden="true">♙</span><div><p>Nhân sự hoạt động</p><strong>{data.stats.activeEmployees}</strong><small>Đồng bộ từ PostgreSQL</small></div></article>
        <article className="stat-card green"><span className="stat-icon" aria-hidden="true">⌂</span><div><p>Phòng ban</p><strong>{data.stats.departments}</strong><small>Đồng bộ từ PostgreSQL</small></div></article>
        <article className="stat-card muted"><span className="stat-icon" aria-hidden="true">◷</span><div><p>Phê duyệt</p><strong>—</strong><small>Chưa triển khai</small></div></article>
        <article className="stat-card muted"><span className="stat-icon" aria-hidden="true">▤</span><div><p>Tài liệu</p><strong>—</strong><small>Chưa triển khai</small></div></article>
      </section>
      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="activity-title"><div className="panel-heading"><div><h2 id="activity-title">Hoạt động gần đây</h2><p>Nhật ký hoạt động từ hệ thống</p></div></div><div className="activity-list">{data.recentActivity.length === 0 ? <div className="inline-empty">Chưa có hoạt động gần đây.</div> : data.recentActivity.map((activity) => <div className="activity" key={activity.id}><span className="activity-dot" aria-hidden="true" /><div><p><strong>{activity.actor?.profile?.displayName ?? 'Hệ thống'}</strong> {formatActivity(activity)}</p><small>{new Date(activity.createdAt).toLocaleString('vi-VN')}</small></div></div>)}</div></section>
        <section className="panel" aria-labelledby="modules-title"><div className="panel-heading"><div><h2 id="modules-title">Phạm vi hệ thống</h2><p>Trạng thái các module hiện tại</p></div></div><div className="module-list"><div className="module-row"><span className="module-status available" />Nhân sự và người dùng <b>API sẵn sàng</b></div><div className="module-row"><span className="module-status available" />Phòng ban <b>API sẵn sàng</b></div>{data.unavailableModules.map((module) => <div className="module-row" key={module}><span className="module-status pending" />{module}<b>Chưa triển khai</b></div>)}</div></section>
      </div>
    </div>
  </PortalShell>;
}
