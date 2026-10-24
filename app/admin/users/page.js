'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSession } from '@/lib/useSession';
import Shell from '@/components/Shell';
import { useGeo } from '@/lib/useGeo';
import { label } from '@/lib/constants';

const ROLES = ['observer', 'moderator', 'admin'];
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // no look-alike characters
function genPassword() {
  const b = new Uint32Array(14);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => ALPHA[x % ALPHA.length]).join('');
}

export default function Users() {
  const me = useSession();
  const { states } = useGeo();
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('observer');
  const [pw, setPw] = useState('');
  const [creds, setCreds] = useState(null); // shown once after create/reset
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('/users?limit=100').then((r) => setUsers(r.data)).catch((x) => setErr(x.message)), []);
  useEffect(() => { setPw(genPassword()); }, []);
  useEffect(() => { if (me?.role === 'admin') load(); }, [me, load]);

  async function create(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get('name'), email: f.get('email'), role, password: f.get('password'),
      assignedStates: role === 'moderator' ? f.getAll('state') : [],
    };
    if (f.get('phone')) body.phone = f.get('phone');
    try {
      await api('/users', { method: 'POST', body });
      setCreds({ name: body.name, email: body.email, password: body.password });
      e.target.reset(); setRole('observer'); setPw(genPassword());
      load();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  async function patch(u, body, onOk) {
    setErr('');
    try { await api(`/users/${u._id}`, { method: 'PATCH', body }); onOk?.(); load(); }
    catch (x) { setErr(x.message); }
  }
  const resetPw = (u) => { const password = genPassword(); patch(u, { password }, () => setCreds({ name: u.name, email: u.email, password })); };

  if (!me) return null;
  if (me.role !== 'admin') return <Shell user={me}><p>This page is for administrators.</p></Shell>;

  return (
    <Shell user={me}>
      <h1>Users</h1>
      {err && <p className="err" role="alert">{err}</p>}
      {creds && (
        <section className="panel creds" role="status">
          <h2>Share these sign-in details with {creds.name}</h2>
          <p>Email: <b>{creds.email}</b><br />Password: <b className="mono">{creds.password}</b></p>
          <p className="muted">This password is shown once. Send it privately, not in a group chat.</p>
          <button className="btn ghost" onClick={() => navigator.clipboard.writeText(`Email: ${creds.email}\nPassword: ${creds.password}`)}>Copy</button>{' '}
          <button className="btn ghost" onClick={() => setCreds(null)}>Done</button>
        </section>
      )}

      <form onSubmit={create} className="panel stack">
        <h2>Add a user</h2>
        <div className="grid2">
          <label className="field">Full name<input name="name" required minLength={2} maxLength={120} /></label>
          <label className="field">Email<input name="email" type="email" required /></label>
          <label className="field">Phone (optional, used to recognise SMS senders)<input name="phone" placeholder="08012345678" /></label>
          <label className="field">Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}
            </select>
          </label>
          <label className="field">Temporary password
            <span className="row"><input name="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={10} className="mono" />
              <button type="button" className="btn ghost" onClick={() => setPw(genPassword())}>New</button></span>
          </label>
        </div>
        {role === 'moderator' && (
          <fieldset className="lgas"><legend>States this moderator reviews (none ticked = national)</legend>
            {states.map((s) => <label key={s}><input type="checkbox" name="state" value={s} /> {s}</label>)}
          </fieldset>
        )}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create user'}</button>
      </form>

      <div className="scroll">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>States</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td><td>{label(u.role)}</td>
                <td>{u.role === 'moderator' ? (u.assignedStates.join(', ') || 'National') : '-'}</td>
                <td><span className={`pill ${u.isActive ? 'st-verified' : 'st-rejected'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
                <td className="actions">
                  <button className="btn ghost" onClick={() => resetPw(u)}>Reset password</button>
                  {u._id !== me._id && <button className="btn ghost" onClick={() => patch(u, { isActive: !u.isActive })}>{u.isActive ? 'Deactivate' : 'Activate'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
