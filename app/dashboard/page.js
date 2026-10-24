'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSession } from '@/lib/useSession';
import Shell from '@/components/Shell';
import { useGeo } from '@/lib/useGeo';
import { CATEGORIES, SEVERITIES, STATUSES, label } from '@/lib/constants';

export default function Dashboard() {
  const user = useSession();
  const { states, lgasOf } = useGeo();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, limit: 25 });
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');
  const staff = user && user.role !== 'observer';

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
    try {
      const r = await api(`/reports?${qs}`);
      setData({ items: r.data, total: r.meta.total, limit: r.meta.limit });
      setErr('');
    } catch (x) { setErr(x.message); }
  }, [filters, page]);

  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => {
    if (staff) api('/stats/summary').then((r) => setStats(r.data)).catch(() => {});
  }, [staff]);

  if (!user) return null;
  const set = (k) => (e) => { setPage(1); setFilters((f) => ({ ...f, [k]: e.target.value })); };
  const setState = (e) => { setPage(1); setFilters((f) => ({ ...f, state: e.target.value, lga: '' })); };
  const pages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <Shell user={user}>
      <h1>{staff ? 'Incident queue' : 'My reports'}</h1>

      {stats && (
        <div className="stats">
          <div><b>{stats.total}</b> total</div>
          <div className="crit"><b>{stats.openCritical}</b> open critical</div>
          <div><b>{stats.byStatus.new || 0}</b> awaiting review</div>
          <div><b>{stats.unverifiedSources}</b> unverified senders</div>
        </div>
      )}

      <div className="filters">
        <select aria-label="Status" onChange={set('status')}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <select aria-label="Severity" onChange={set('severity')}><option value="">All severities</option>{SEVERITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <select aria-label="Type" onChange={set('category')}><option value="">All types</option>{Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select aria-label="State" value={filters.state || ''} onChange={setState}><option value="">All states</option>{states.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="LGA" value={filters.lga || ''} onChange={set('lga')} disabled={!filters.state}><option value="">All LGAs</option>{lgasOf(filters.state).map((l) => <option key={l}>{l}</option>)}</select>
        <select aria-label="Channel" onChange={set('channel')}><option value="">All channels</option><option value="web">Web</option><option value="sms">SMS</option><option value="voice">Voice</option></select>
        <input aria-label="Search" placeholder="Search text" onKeyDown={(e) => e.key === 'Enter' && set('q')(e)} />
      </div>

      {err && <p className="err" role="alert">{err}</p>}
      <div className="scroll">
        <table>
          <thead><tr><th>Reference</th><th>Type</th><th>Where</th><th>Channel</th><th>Status</th><th>Received</th></tr></thead>
          <tbody>
            {data.items.map((r) => (
              <tr key={r._id} className={`sev-${r.severity}`}>
                <td><Link href={`/dashboard/${r._id}`}>{r.refCode}</Link></td>
                <td>{CATEGORIES[r.category]}</td>
                <td>{r.location.unresolved ? 'Location unresolved' : `${r.location.lga}, ${r.location.state}`}{r.location.ward ? ` · ${r.location.ward}` : ''}</td>
                <td>{label(r.channel)}{r.reporterVerified ? '' : ' (unverified)'}</td>
                <td><span className={`pill st-${r.status}`}>{label(r.status)}</span></td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!data.items.length && <tr><td colSpan={6} className="muted">No reports match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="btn ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </Shell>
  );
}
