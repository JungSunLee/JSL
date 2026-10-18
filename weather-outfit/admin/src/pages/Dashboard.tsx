import { useEffect, useState } from 'react';
import { api, BODY_LABEL, PROVIDER_LABEL, SENS_LABEL, type Stats } from '../api';

function Tile({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="card tile">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {sub ? <div className="tile-sub">{sub}</div> : null}
    </div>
  );
}

/** 단일 계열 세로 막대: 최근 14일 가입자 */
function DailyBars({ data }: { data: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 640;
  const H = 180;
  const pad = { l: 28, r: 8, t: 12, b: 24 };
  const bw = (W - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="최근 14일 일별 가입자 수">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 6} y={y(t) + 4} className="axis" textAnchor="end">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * bw;
          const h = y(0) - y(d.count);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
              {d.count > 0 ? (
                <path
                  d={`M${x + 2},${y(0)} v${-Math.max(h - 4, 0)} q0,-4 4,-4 h${bw - 12} q4,0 4,4 v${Math.max(h - 4, 0)} z`}
                  className={hover === i ? 'bar on' : 'bar'}
                />
              ) : null}
              {i % 2 === 1 || i === data.length - 1 ? (
                <text x={x + bw / 2} y={H - 6} className="axis" textAnchor="middle">{d.date.slice(5).replace('-', '/')}</text>
              ) : null}
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} className="baseline" />
      </svg>
      {hover !== null ? (
        <div className="tooltip" style={{ left: `${((pad.l + (hover + 0.5) * bw) / W) * 100}%` }}>
          <b>{data[hover].count}명</b> · {data[hover].date}
        </div>
      ) : null}
    </div>
  );
}

/** 단일 계열 가로 막대 (분포) */
function HBars({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="card">
      <h3>{title}</h3>
      {rows.map((r) => (
        <div key={r.label} className="hrow" title={`${r.label}: ${r.value}명`}>
          <span className="hlabel">{r.label}</span>
          <span className="htrack">
            <span className="hfill" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="hval">
            {r.value}
            <small>{total ? ` ${Math.round((r.value / total) * 100)}%` : ''}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.stats().then(setS).catch(() => setErr('통계를 불러오지 못했어요.'));
  }, []);
  if (err) return <p className="error">{err}</p>;
  if (!s) return <p className="muted">불러오는 중…</p>;
  const pct = (n: number) => (s.totalUsers ? `${Math.round((n / s.totalUsers) * 100)}%` : '-');
  return (
    <>
      <h1>대시보드</h1>
      <div className="tiles">
        <Tile label="전체 회원" value={s.totalUsers.toLocaleString()} sub={`정지 ${s.suspended}명`} />
        <Tile label="오늘 가입" value={s.newToday} sub={`최근 7일 ${s.new7d}명`} />
        <Tile label="7일 활성" value={s.active7d} sub={`전체의 ${pct(s.active7d)}`} />
        <Tile label="프로필 입력 완료" value={s.onboarded} sub={`전환율 ${pct(s.onboarded)}`} />
      </div>
      <div className="card">
        <h3>일별 가입자 (최근 14일)</h3>
        <DailyBars data={s.signupsByDay} />
      </div>
      <div className="cols3">
        <HBars title="로그인 방식" rows={(Object.keys(PROVIDER_LABEL) as (keyof typeof PROVIDER_LABEL)[]).filter((k) => k !== 'dev' || s.byProvider.dev).map((k) => ({ label: PROVIDER_LABEL[k], value: s.byProvider[k] ?? 0 }))} />
        <HBars title="온도감" rows={['-2', '-1', '0', '1', '2'].map((k) => ({ label: SENS_LABEL[k], value: s.bySensitivity[k] ?? 0 }))} />
        <HBars title="체형" rows={Object.keys(BODY_LABEL).map((k) => ({ label: BODY_LABEL[k], value: s.byBodyType[k] ?? 0 }))} />
      </div>
    </>
  );
}
