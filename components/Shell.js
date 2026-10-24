'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, session } from '@/lib/api';

export default function Shell({ user, children }) {
  const router = useRouter();
  const out = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    session.clear();
    router.replace('/login');
  };
  return (
    <>
      <header className="bar">
        <Link href="/" className="brandlink"><img src="/logo.png" alt="Voter Witness" /></Link>
        <nav>
          <Link href="/report/new">New report</Link>
          <Link href="/dashboard">{user.role === 'observer' ? 'My reports' : 'Reports'}</Link>
          {user.role === 'admin' && <Link href="/admin/users">Users</Link>}
        </nav>
        <span className="who">{user.name}</span>
        <button className="btn ghost" onClick={out}>Log out</button>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}
