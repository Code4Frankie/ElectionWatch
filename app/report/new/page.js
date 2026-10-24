'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSession } from '@/lib/useSession';
import Shell from '@/components/Shell';
import { useGeo } from '@/lib/useGeo';
import { CATEGORIES, SEVERITIES, label } from '@/lib/constants';

export default function NewReport() {
  const user = useSession();
  const { states, lgasOf } = useGeo();
  const [state, setState] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [coords, setCoords] = useState(null);
  const [geoMsg, setGeoMsg] = useState('');

  function locate() {
    setGeoMsg('Finding location…');
    navigator.geolocation?.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoMsg('Location attached'); },
      () => setGeoMsg('Could not get location. You can still submit.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const form = new FormData(e.currentTarget);
    if (coords) { form.set('latitude', coords.lat); form.set('longitude', coords.lng); }
    try {
      const { data } = await api('/reports', { method: 'POST', form });
      setDone(data);
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  if (!user) return null;
  if (done) {
    return (
      <Shell user={user}>
        <section className="panel">
          <h1>Report received</h1>
          <p>Reference <strong className="ref">{done.refCode}</strong>. Keep it to follow up.</p>
          <p><button className="btn" onClick={() => { setDone(null); setCoords(null); setGeoMsg(''); }}>File another report</button>{' '}
            <Link className="btn ghost" href={`/dashboard/${done._id}`}>View report</Link></p>
        </section>
      </Shell>
    );
  }

  return (
    <Shell user={user}>
      <h1>Report an incident</h1>
      <form onSubmit={submit} className="panel stack">
        <div className="grid2">
          <label className="field">What happened
            <select name="category" required defaultValue="">
              <option value="" disabled>Choose a type</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="field">How serious
            <select name="severity" defaultValue="medium">
              {SEVERITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </label>
          <label className="field">State
            <select name="state" required value={state} onChange={(e) => setState(e.target.value)}>
              <option value="" disabled>Choose a state</option>
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">LGA
            <select name="lga" required defaultValue="" key={state} disabled={!state}>
              <option value="" disabled>{state ? 'Choose an LGA' : 'Choose a state first'}</option>
              {lgasOf(state).map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="field">Ward (optional)<input name="ward" maxLength={100} /></label>
          <label className="field">Polling unit code (optional)<input name="pollingUnitCode" maxLength={40} placeholder="Fills in LGA and ward when recognised" /></label>
          <label className="field">When it happened<input name="occurredAt" type="datetime-local" /></label>
        </div>
        <label className="field">Describe what you saw
          <textarea name="description" rows={5} required minLength={10} maxLength={2000} />
        </label>
        <label className="field">Photos, video or audio (up to 5, 10MB each)
          <input name="media" type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/wav,audio/webm" />
        </label>
        <div>
          <button type="button" className="btn ghost" onClick={locate}>Attach my location</button>{' '}
          <span className="muted">{geoMsg}</span>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send report'}</button>
      </form>
    </Shell>
  );
}
