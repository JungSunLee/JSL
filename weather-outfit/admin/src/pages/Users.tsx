import { useEffect, useState } from 'react';
import { api, fmtDate, PROVIDER_LABEL, type UserSummary } from '../api';

export function Users() {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ total: number; pageSize: number; items: UserSummary[] } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setErr('');
    api.users({ q: query, provider, status, page }).then(setData).catch(() => setErr('회원 목록을 불러오지 못했어요.'));
  }, [query, provider, status, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <h1>회원 관리</h1>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q);
        }}
      >
        <input placeholder="이름·이메일·회원ID 검색" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={provider} onChange={(e) => (setProvider(e.target.value), setPage(1))} aria-label="로그인 방식">
          <option value="">전체 로그인 방식</option>
          {Object.entries(PROVIDER_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))} aria-label="상태">
          <option value="">전체 상태</option>
          <option value="active">정상</option>
          <option value="suspended">정지</option>
        </select>
        <button className="primary">검색</button>
      </form>

      {err ? <p className="error">{err}</p> : null}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>로그인</th>
              <th>프로필</th>
              <th>상태</th>
              <th>가입일</th>
              <th>최근 로그인</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id} onClick={() => (window.location.hash = `#/users/${u.id}`)} className="clickable">
                <td><a href={`#/users/${u.id}`}>{u.name}</a></td>
                <td className="muted">{u.email ?? '-'}</td>
                <td>{u.providers.map((p) => PROVIDER_LABEL[p]).join(', ')}</td>
                <td>{u.onboarded ? '입력 완료' : <span className="muted">미입력</span>}</td>
                <td><span className={`badge ${u.status}`}>{u.status === 'active' ? '정상' : '정지'}</span></td>
                <td className="muted">{fmtDate(u.createdAt)}</td>
                <td className="muted">{fmtDate(u.lastLoginAt)}</td>
              </tr>
            ))}
            {data && data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">조건에 맞는 회원이 없어요.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span className="muted">총 {data?.total ?? 0}명</span>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button>
        <span>{page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>다음</button>
      </div>
    </>
  );
}
