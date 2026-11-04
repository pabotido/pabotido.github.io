'use client';

import { useEffect, useState } from 'react';
import { listApprovals, listLeaves, listNotifications, listProjects, searchOperations, type OperationsData } from '../../lib/api';
import { PortalShell } from '../../components/portal/portal-shell';

export default function OperationsPage() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<string, unknown[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void Promise.all([listProjects(), listApprovals(), listLeaves(), listNotifications()]).then(([projects, approvals, leaves, notifications]) => setData({ projects, approvals, leaves, notifications })).catch(() => setError('Không tải được dữ liệu vận hành.')); }, []);
  async function search() { if (query.trim().length < 2) return; try { setResults(await searchOperations(query)); } catch { setError('Không tìm kiếm được dữ liệu.'); } }
  return <PortalShell displayName="Vận hành" unavailableModules={[]}>
    <header className="topbar"><div className="breadcrumb"><span>Không gian doanh nghiệp</span><strong>/</strong> Vận hành</div><span className="data-badge"><i aria-hidden="true" /> API trực tiếp</span></header>
    <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">OPERATIONS</p><h1>Trung tâm vận hành</h1><p className="subheading">Theo dõi dự án, phê duyệt, nghỉ phép và thông báo.</p></div></section>
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="panel operations-search"><label htmlFor="operations-search">Tìm kiếm toàn hệ thống</label><div><input id="operations-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên dự án, công việc, tài liệu..." /><button className="primary-button" type="button" onClick={() => void search()}>Tìm kiếm</button></div></section>
      {results && <section className="panel"><div className="panel-heading"><div><h2>Kết quả tìm kiếm</h2><p>{Object.values(results).reduce((total, items) => total + items.length, 0)} kết quả</p></div></div><pre className="operations-results">{JSON.stringify(results, null, 2)}</pre></section>}
      <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Dự án</h2><p>{data?.projects.length ?? '—'} dự án được phép xem</p></div></div>{data?.projects.map((project) => <div className="activity" key={project.id}><span className="activity-dot" /><div><p><strong>{project.name}</strong> · {project.status}</p><small>{project._count.tasks} công việc · {project._count.members} thành viên</small></div></div>) ?? <p>Đang tải...</p>}</section>
      <section className="panel"><div className="panel-heading"><div><h2>Phê duyệt & nghỉ phép</h2><p>{data ? `${data.approvals.length} phê duyệt · ${data.leaves.length} đơn nghỉ` : 'Đang tải...'}</p></div></div>{data?.approvals.slice(0, 5).map((item) => <div className="activity" key={item.id}><span className="activity-dot" /><div><p><strong>{item.title}</strong></p><small>Phê duyệt: {item.status}</small></div></div>)}{data?.leaves.slice(0, 5).map((item) => <div className="activity" key={item.id}><span className="activity-dot" /><div><p><strong>{item.reason}</strong></p><small>{item.status} · {item.startDate.slice(0, 10)} → {item.endDate.slice(0, 10)}</small></div></div>)}</section></div>
      <section className="panel"><div className="panel-heading"><div><h2>Thông báo</h2><p>{data?.notifications.length ?? '—'} thông báo gần đây</p></div></div>{data?.notifications.map((item) => <div className="activity" key={item.id}><span className="activity-dot" /><div><p><strong>{item.title}</strong> · {item.message}</p></div></div>) ?? <p>Đang tải...</p>}</section>
    </div>
  </PortalShell>;
}
