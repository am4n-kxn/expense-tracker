import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../theme.jsx';
import { useAuth } from '../auth.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Ledger<span>.</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div className="user-menu">
              {user.picture && (
                <img className="user-avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
              )}
              <div className="user-info">
                <div className="user-name">{user.name}</div>
              </div>
              <button className="user-logout" onClick={logout}>Sign out</button>
            </div>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="toggle-icon">{theme === 'dark' ? '☀' : '☾'}</span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          entries recorded manually
          <br />
          &amp; via WhatsApp (soon)
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
