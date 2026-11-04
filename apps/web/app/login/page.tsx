'use client';

import { FormEvent, useState } from 'react';
import { apiUrl } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(null);
    try {
      const response = await fetch(`${apiUrl}/auth/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!response.ok) { const body = await response.json().catch(() => null) as { error?: { message?: string } } | null; throw new Error(body?.error?.message ?? 'Đăng nhập không thành công'); }
      const body = await response.json() as { data?: { csrfToken?: string } };
      if (!body.data?.csrfToken) throw new Error('Không nhận được mã bảo vệ phiên. Vui lòng thử lại.');
      window.sessionStorage.setItem('portal_csrf', body.data.csrfToken);
      window.location.assign('/');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Đăng nhập không thành công'); setSubmitting(false); }
  }
  return <main className="auth-page"><div className="auth-layout"><section className="auth-intro"><span className="brand-mark" aria-hidden="true">P</span><p className="eyebrow">ENTERPRISE WORKSPACE</p><h1>Một không gian làm việc rõ ràng, bảo mật.</h1><p>Truy cập thông tin nội bộ và các công cụ vận hành của doanh nghiệp trong một nơi duy nhất.</p></section><form className="auth-card" onSubmit={submit}><div className="auth-heading"><span className="brand-mark" aria-hidden="true">P</span><div><strong>Portal</strong><small>Cổng thông tin nội bộ</small></div></div><h2>Đăng nhập</h2><p className="form-lead">Sử dụng tài khoản doanh nghiệp để tiếp tục.</p><label htmlFor="email">Email doanh nghiệp<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" placeholder="ten@congty.vn" /></label><label htmlFor="password">Mật khẩu<input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button" disabled={submitting}>{submitting ? 'Đang xác thực…' : 'Đăng nhập'}</button><p className="auth-note">Phiên đăng nhập được bảo vệ bằng cookie bảo mật.</p></form></div></main>;
}
