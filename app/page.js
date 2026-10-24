'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { session } from '@/lib/api';

const CHANNELS = [
  { name: 'Web form', tone: 'blue', text: 'Describe the incident, pick the LGA, attach photos, video or audio, and share your GPS position. Best when you have data and a few minutes.' },
  { name: 'SMS', tone: 'green', text: 'No data? Text the report. You get a reference code back by SMS.', code: 'VW <polling unit code> VIOLENCE Thugs at the gate' },
  { name: 'Hotline', tone: 'navy', text: 'Call the hotline and describe what you see. A moderator reviews the recording and places the report. The number is issued to accredited observers.' },
];

const STEPS = [
  ['Report', 'An observer files the incident by web, SMS or phone call.'],
  ['Reference', 'Every report gets a short code such as VW-K7QM-3XPD, so it can be followed up.'],
  ['Review', 'Moderators move it from new to under review, then verified, escalated or resolved. Rejections and escalations need a written reason.'],
  ['Record', 'Each status change and note is kept in the report history.'],
];

export default function Landing() {
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(session.get()?.user || null); }, []);
  const href = user ? (user.role === 'observer' ? '/report/new' : '/dashboard') : '/login';
  const cta = user ? (user.role === 'observer' ? 'File a report' : 'Open dashboard') : 'Sign in';

  return (
    <>
      <header className="bar">
        <Link href="/" className="brandlink"><img src="/logo.png" alt="Voter Witness" /></Link>
        <nav><a href="#channels">Ways to report</a><a href="#how">How it works</a></nav>
        <Link className="btn" href={href}>{cta}</Link>
      </header>

      <main>
        <section className="hero wrap">
          <div>
            <p className="eyebrow">Nasarawa State pilot · 2027 elections</p>
            <h1>Every incident from every polling unit, in one place.</h1>
            <p className="lead">Voter Witness gives accredited observers a fast way to report election incidents by web, SMS or phone, and gives reviewers one queue to verify them and act.</p>
            <p className="btns">
              <Link className="btn big" href={href}>{cta}</Link>
              <a className="btn big ghost" href="#how">How it works</a>
            </p>
          </div>
          <aside className="sample panel sev-high" aria-label="Example report">
            <p className="tag">Example report</p>
            <p className="meta">Intimidation · High severity · SMS</p>
            <p>Group of men blocking the queue at the gate and turning voters away.</p>
            <p className="muted">Karu LGA · polling unit code on file</p>
            <p><span className="pill st-under_review">Under review</span> <span className="ref-sm">VW-K7QM-3XPD</span></p>
          </aside>
        </section>

        <section id="channels" className="wrap block">
          <h2>Three ways to report</h2>
          <div className="cols">
            {CHANNELS.map((c) => (
              <article key={c.name} className={`chan ${c.tone}`}>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
                {c.code && <code>{c.code}</code>}
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="wrap block">
          <h2>How it works</h2>
          <ol className="steps">
            {STEPS.map(([t, d], i) => (
              <li key={t}><span className="num">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="band">
          <div className="wrap cols4">
            <div><b>13 LGAs</b><span>covered by the Nasarawa pilot</span></div>
            <div><b>Role-based</b><span>observers see only their own reports</span></div>
            <div><b>Audited</b><span>every status change is recorded</span></div>
            <div><b>Evidence</b><span>photos, video and audio attach to the report</span></div>
          </div>
        </section>
      </main>

      <footer className="wrap foot">
        <img src="/logo.png" alt="Voter Witness" width="150" />
        <p className="muted">Voter Witness 2027 · Nasarawa State pilot. Access is for accredited observers and authorised reviewers; accounts are issued by administrators.</p>
      </footer>
    </>
  );
}
