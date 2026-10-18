import { useEffect, useState } from 'react';
import { ACTIVITY_LABEL, api, BODY_LABEL, fmtDate, PROVIDER_LABEL, SENS_LABEL, type UserDetail } from '../api';

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

export function UserDetailPage({ id }: { id: string }) {
  const [u, setU] = useState<UserDetail | null>(null);
  const [memo, setMemo] = useState('');
  const [err, setErr] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api
      .user(id)
      .then((d) => (setU(d), setMemo(d.adminMemo)))
      .catch(() => setErr('회원을 찾을 수 없어요.'));
  }, [id]);

  if (err) return (<><a href="#/users">← 회원 목록</a><p className="error">{err}</p></>);
  if (!u) return <p className="muted">불러오는 중…</p>;

  const flash = (m: string) => {
    setSaved(m);
    setTimeout(() => setSaved(''), 2000);
  };

  const toggleStatus = async () => {
    const next = u.status === 'active' ? 'suspended' : 'active';
    const msg = next === 'suspended' ? `${u.name}님의 이용을 정지할까요? 앱 로그인과 코디 추천이 차단됩니다.` : `${u.name}님의 이용 정지를 해제할까요?`;
    if (!confirm(msg)) return;
    setU(await api.updateUser(u.id, { status: next }));
    flash(next === 'suspended' ? '이용을 정지했어요' : '정지를 해제했어요');
  };

  const remove = async () => {
    if (prompt(`회원 정보가 영구 삭제됩니다. 확인을 위해 "${u.name}"을(를) 입력하세요.`) !== u.name) return;
    await api.deleteUser(u.id);
    window.location.hash = '#/users';
  };

  const p = u.profile;
  return (
    <>
      <a href="#/users">← 회원 목록</a>
      <div className="detail-head">
        <h1>
          {u.name} <span className={`badge ${u.status}`}>{u.status === 'active' ? '정상' : '정지'}</span>
        </h1>
        {saved ? <span className="saved">✓ {saved}</span> : null}
      </div>
      <div className="cols2">
        <div className="card">
          <h3>계정</h3>
          <Row k="회원 ID" v={<code>{u.id}</code>} />
          <Row k="이메일" v={u.email ?? '-'} />
          <Row k="로그인 방식" v={u.providers.map((x) => PROVIDER_LABEL[x]).join(', ')} />
          <Row k="가입일" v={fmtDate(u.createdAt)} />
          <Row k="최근 로그인" v={fmtDate(u.lastLoginAt)} />
        </div>
        <div className="card">
          <h3>코디 프로필</h3>
          {p ? (
            <>
              <Row k="출생연도" v={`${p.birthYear}년 (${new Date().getFullYear() - p.birthYear}세)`} />
              <Row k="성별" v={p.sex === 'female' ? '여성' : p.sex === 'male' ? '남성' : '-'} />
              <Row k="키 / 몸무게" v={`${p.heightCm ? `${p.heightCm}cm` : '-'} / ${p.weightKg ? `${p.weightKg}kg` : '-'}`} />
              <Row k="체형" v={BODY_LABEL[p.bodyType]} />
              <Row k="온도감" v={SENS_LABEL[String(p.sensitivity)]} />
              <Row k="활동량" v={ACTIVITY_LABEL[p.activity]} />
              <Row k="정보 이용 동의" v={u.profileConsentAt ? fmtDate(u.profileConsentAt) : '-'} />
            </>
          ) : (
            <p className="muted">아직 프로필을 입력하지 않았어요.</p>
          )}
        </div>
      </div>
      <div className="card">
        <h3>관리자 메모 <small className="muted">(회원에게 보이지 않아요)</small></h3>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={4} maxLength={1000} placeholder="문의 내용, 조치 이력 등을 기록하세요" />
        <button
          className="primary"
          onClick={async () => {
            setU(await api.updateUser(u.id, { adminMemo: memo }));
            flash('메모를 저장했어요');
          }}
        >
          메모 저장
        </button>
      </div>
      <div className="card danger-zone">
        <h3>계정 조치</h3>
        <div className="actions">
          <button onClick={toggleStatus} className={u.status === 'active' ? 'warn' : 'primary'}>
            {u.status === 'active' ? '이용 정지' : '정지 해제'}
          </button>
          <button onClick={remove} className="danger">회원 삭제</button>
        </div>
      </div>
    </>
  );
}
