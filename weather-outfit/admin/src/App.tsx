import { useEffect, useState } from 'react';
import { session } from './api';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { UserDetailPage } from './pages/UserDetail';
import { Users } from './pages/Users';

/** 해시 라우팅: #/ , #/users , #/users/:id */
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const on = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash.slice(1);
}

export function App() {
  const [token, setToken] = useState(session.get());
  const route = useHashRoute();

  useEffect(() => {
    const out = () => setToken(null);
    window.addEventListener('admin:logout', out);
    return () => window.removeEventListener('admin:logout', out);
  }, []);

  if (!token) return <Login onLogin={(t) => (session.set(t), setToken(t))} />;

  const userMatch = route.match(/^\/users\/([^/?]+)/);
  const page = userMatch ? 'users' : route.startsWith('/users') ? 'users' : 'dashboard';

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">🌤️ 옷날씨 <small>관리자</small></div>
        <nav>
          <a href="#/" className={page === 'dashboard' ? 'on' : ''}>📊 대시보드</a>
          <a href="#/users" className={page === 'users' ? 'on' : ''}>👥 회원 관리</a>
        </nav>
        <button
          className="logout"
          onClick={() => {
            session.clear();
            setToken(null);
          }}
        >
          로그아웃
        </button>
      </aside>
      <main className="main">
        {userMatch ? <UserDetailPage id={decodeURIComponent(userMatch[1])} /> : page === 'users' ? <Users /> : <Dashboard />}
      </main>
    </div>
  );
}
