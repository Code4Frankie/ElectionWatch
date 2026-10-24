'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useSession } from '@/lib/useSession';
import Shell from '@/components/Shell';
import { CATEGORIES, TRANSITIONS, label } from '@/lib/constants';

export default function ReportDetail() {
  const { id } = useParams();
  const user = useSession();
  const [r, setR] = useState(null);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => api(`/reports/${id}`).then((x) => setR(x.data)).catch((x) => setErr(x.message)), [id]);
  useEffect(() => { if (user) load(); }, [user, load]);

  async function move(status) {
    setErr('');
    try { await api(`/reports/${id}/status`, { method: 'PATCH', body: { status, note: note || undefined } }); setNote(''); load(); }
    catch (x) { setErr(x.message); }
  }
  async function addNote() {
    try { await api(`/reports/${id}/notes`, { method: 'POST', body: { note } }); setNote(''); load(); }
    catch (x) { setErr(x.message); }
  }

  if (!user) return null;
  const staff = user.role !== 'observer';
  const next = r ? [...TRANSITIONS[r.status], ...(user.role === 'admin' && ['rejected', 'resolved'].includes(r.status) ? ['under_review'] : [])] : [];

  return (
    <Shell user={user}>
      {err && <p className="err" role="alert">{err}</p>}
      {r && (
        <>
          <h1>{r.refCode} <span className={`pill st-${r.status}`}>{label(r.status)}</span></h1>
          <section className={`panel sev-${r.severity}`}>
            <p className="meta">{CATEGORIES[r.category]} · {label(r.severity)} severity · {label(r.channel)} · {new Date(r.createdAt).toLocaleString()}</p>
            <p>{r.description}</p>
            <p className="muted">
              {r.location.unresolved ? 'Location unresolved' : `${r.location.lga}, ${r.location.state}`}{r.location.ward && ` · ${r.location.ward}`}{r.location.pollingUnitCode && ` · PU ${r.location.pollingUnitCode}`}
              {r.location.geo?.coordinates && (<> · <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${r.location.geo.coordinates[1]},${r.location.geo.coordinates[0]}`}>Open map</a></>)}
            </p>
            {staff && <p className="muted">Reporter: {r.reporter?.name || r.reporterPhone || 'Unknown'}{!r.reporterVerified && ' (unverified sender)'}</p>}
            <div className="media">
              {r.media.map((m) => m.resourceType === 'image' ? <a key={m.url} href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt="Attached evidence" /></a>
                : m.resourceType === 'audio' ? <audio key={m.url} controls src={m.url} />
                : <video key={m.url} controls src={m.url} />)}
            </div>
          </section>

          {staff && (
            <section className="panel stack">
              <h2>Review</h2>
              <label className="field">Note (required to reject or escalate)<textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} /></label>
              <div className="actions">
                {next.map((s) => <button key={s} className="btn" onClick={() => move(s)}>{s === 'under_review' && r.status !== 'new' ? 'Reopen' : `Mark ${label(s).toLowerCase()}`}</button>)}
                <button className="btn ghost" disabled={!note} onClick={addNote}>Add note only</button>
              </div>
            </section>
          )}

          <section className="panel">
            <h2>History</h2>
            {r.history.length ? (
              <ol className="history">
                {r.history.map((h, i) => (
                  <li key={i}><b>{h.from === h.to ? 'Note' : `${label(h.from)} to ${label(h.to)}`}</b> by {h.by?.name || 'system'} on {new Date(h.at).toLocaleString()}{h.note && <p>{h.note}</p>}</li>
                ))}
              </ol>
            ) : <p className="muted">No activity yet.</p>}
          </section>
        </>
      )}
    </Shell>
  );
}
