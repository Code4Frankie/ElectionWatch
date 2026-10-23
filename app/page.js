'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, session } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const { data } = await api('/auth/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } });
      session.set(data);
      router.replace(data.user.role === 'observer' ? '/report/new' : '/dashboard');
    } catch (x) { setErr(x.message); setBusy(false); }
  }

  return (
    <main className="login">
      <h1>ElectWatch 2027</h1>
      <p className="muted">Sign in to report or review incidents.</p>
      <form onSubmit={submit} className="stack">
        <label className="field">Email<input name="email" type="email" autoComplete="username" required /></label>
        <label className="field">Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
