import { useState, type FormEvent } from 'react';
import { api, HttpError } from '../api';

const MESSAGES: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않아요.',
  too_many_attempts: '로그인 시도가 너무 많아요. 10분 후 다시 시도해 주세요.',
  admin_not_configured: '서버에 관리자 계정(ADMIN_EMAIL / ADMIN_PASSWORD)이 설정되지 않았어요.',
};

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.login(email, password);
      onLogin(r.token);
    } catch (err) {
      setError(err instanceof HttpError ? (MESSAGES[err.code] ?? '로그인하지 못했어요.') : '서버에 연결할 수 없어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login card" onSubmit={submit}>
        <div className="login-logo">🌤️👕</div>
        <h1>옷날씨 관리자</h1>
        <p className="muted">관리자 계정으로 로그인하세요.</p>
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label>
          비밀번호
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error ? <p className="error" role="alert">{error}</p> : null}
        <button className="primary" disabled={busy}>{busy ? '로그인 중…' : '로그인'}</button>
      </form>
    </div>
  );
}
