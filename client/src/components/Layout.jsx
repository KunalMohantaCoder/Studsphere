import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../hooks/useSocket';
import { useState, useEffect } from 'react';
import api from '../lib/api';

const Icon = ({ name, size = 20 }) => {
  const icons = {
    home: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    explore: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    messages: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    bell: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    focus: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    saved: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    sun: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[name] || null;
};

export { Icon };

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  useSocket();

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/auth'); };

  const navItems = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/explore', label: 'Explore', icon: 'explore' },
    { to: '/messages', label: 'Messages', icon: 'messages' },
    { to: '/notifications', label: 'Notifications', icon: 'bell', badge: unread },
    { to: '/focus', label: 'Focus Corner', icon: 'focus' },
    { to: '/saved', label: 'Saved', icon: 'saved' },
    { to: `/profile/${user?._id}`, label: 'Profile', icon: 'user' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', letterSpacing: -1 }}>StudSphere</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.badge > 0 && <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <button className="nav-link" onClick={toggle}><Icon name={theme === 'dark' ? 'sun' : 'moon'} />{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
          <button className="nav-link" onClick={handleLogout}><Icon name="logout" />Logout</button>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
            <AvatarDisplay user={user} size={36} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
              {user.isFounder && <span className="badge badge-accent" style={{ fontSize: 10 }}>Founder</span>}
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Nav */}
      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0', color: 'var(--text3)', fontSize: 10, gap: 2 }}
            className={({ isActive }) => isActive ? 'active' : ''}>
            {({ isActive }) => <>
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text3)', position: 'relative' }}>
                <Icon name={item.icon} size={22} />
                {item.badge > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', borderRadius: '50%', width: 8, height: 8 }} />}
              </span>
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text3)' }}>{item.label}</span>
            </>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function AvatarDisplay({ user, size = 40 }) {
  if (user?.avatar) return <img src={user.avatar} alt="" className="avatar" style={{ width: size, height: size }} />;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: 'var(--primary)', color: '#fff' }}>
      {user?.username?.[0]?.toUpperCase() || '?'}
    </div>
  );
}
