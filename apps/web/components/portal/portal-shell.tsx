'use client';

import { useState } from 'react';
import Link from 'next/link';
import { revokeSession } from '../../lib/api';

type PortalShellProps = {
  displayName: string;
  unavailableModules: string[];
  children: React.ReactNode;
};

export function PortalShell({ displayName, unavailableModules, children }: PortalShellProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = displayName.trim().slice(0, 2).toUpperCase() || 'U';

  async function logout() {
    setLoggingOut(true);
    try {
      await revokeSession();
    } finally {
      window.location.assign('/login');
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
          <Link className="nav-item active" href="/">
            <span aria-hidden="true">▦</span> Tổng quan
          </Link>

          <p className="nav-label">NỀN TẢNG</p>
          <span className="nav-item disabled" title="Giao diện đang được triển khai">
            <span aria-hidden="true">♙</span> Nhân sự <em>Đang làm</em>
          </span>
          <span className="nav-item disabled" title="Giao diện đang được triển khai">
            <span aria-hidden="true">▤</span> Phòng ban <em>Đang làm</em>
          </span>

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
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
