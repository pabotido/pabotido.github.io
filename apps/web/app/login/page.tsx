'use client';

import { FormEvent, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(null);
    try { const response = await fetch(`${apiUrl}/auth/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); if (!response.ok) { const body = await response.json().catch(() => null) as { error?: { message?: string } } | null; throw new Error(body?.error?.message ?? 'Đăng nhập không thành công'); } window.location.href = '/'; } catch (caught) { setError(caught instanceof Error ? caught.message : 'Đăng nhập không thành công'); setSubmitting(false); }
  }

  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><div className="brand"><div className="brand-mark">P</div><div><strong>Portal</strong><span>Enterprise workspace</span></div></div><h1>Đăng nhập</h1><p>Đăng nhập bằng tài khoản doanh nghiệp của bạn.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label><label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button" disabled={submitting}>{submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></form></main>;
}
