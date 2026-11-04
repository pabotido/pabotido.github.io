'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { revokeSession } from '../../lib/api';

type PortalShellProps = {
  displayName: string;
  unavailableModules: string[];
  children: React.ReactNode;
};

export function PortalShell({ displayName, unavailableModules, children }: PortalShellProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const pathname = usePathname();
  const initials = displayName.trim().slice(0, 2).toUpperCase() || 'U';

  async function logout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await revokeSession(window.sessionStorage.getItem('portal_csrf'));
      window.sessionStorage.removeItem('portal_csrf');
      window.location.assign('/login');
    } catch {
      setLogoutError('Không thể đăng xuất lúc này. Vui lòng thử lại.');
      setLoggingOut(false);
    }
  }

  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Portal - Tổng quan">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span><strong>Portal</strong><small>Cổng thông tin nội bộ</small></span>
        </Link>

        <div className="workspace-switcher" aria-label="Không gian hiện tại">
          <span className="workspace-dot" aria-hidden="true" />
          <span>Không gian doanh nghiệp</span>
        </div>

        <nav className="nav" aria-label="Điều hướng chính">
          <p className="nav-label">TỔNG QUAN</p>
          <Link className={`nav-item${pathname === '/' ? ' active' : ''}`} href="/">
            <span aria-hidden="true">▦</span> Tổng quan
          </Link>

          <p className="nav-label">NỀN TẢNG</p>
          <Link className={`nav-item${pathname === '/news' ? ' active' : ''}`} href="/news">
            <span aria-hidden="true">▤</span> Tin tức
          </Link>
          <Link className={`nav-item${pathname.startsWith('/admin') ? ' active' : ''}`} href="/admin/cms/news">
            <span aria-hidden="true">✎</span> Quản lý nội dung
          </Link>
          <span className="nav-item disabled" title="Giao diện đang được triển khai">
            <span aria-hidden="true">♙</span> Nhân sự <em>Đang làm</em>
          </span>
          <span className="nav-item disabled" title="Giao diện đang được triển khai">
            <span aria-hidden="true">▤</span> Phòng ban <em>Đang làm</em>
          </span>

          <p className="nav-label">VẬN HÀNH</p>
          <Link className={`nav-item${pathname.startsWith('/operations') ? ' active' : ''}`} href="/operations">
            <span aria-hidden="true">▣</span> Vận hành
          </Link>

          <p className="nav-label">SẮP CÓ</p>
          {unavailableModules.map((module) => (
            <span className="nav-item disabled" key={module}>
              <span aria-hidden="true">—</span> {module}
            </span>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="avatar small" aria-hidden="true">{initials}</span>
          <span className="profile-summary"><strong>{displayName}</strong><small>Tài khoản hiện tại</small></span>
          <button className="icon-button" type="button" onClick={logout} disabled={loggingOut} aria-label="Đăng xuất" title="Đăng xuất">
            <span aria-hidden="true">↪</span>
          </button>
        </div>
        {logoutError && <p className="form-error" role="alert">{logoutError}</p>}
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
