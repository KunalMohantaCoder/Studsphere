import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AvatarDisplay } from '../components/Layout';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

const ICONS = { like: '❤️', comment: '💬', follow: '👤', message: '✉️', reply: '↩️' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {}).finally(() => setLoading(false));
    api.post('/notifications/read-all').catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Notifications</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => api.post('/notifications/read-all').then(() => setNotifs(p => p.map(n => ({ ...n, read: true }))))}>Mark all read</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div style={{ fontWeight: 600 }}>No notifications yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifs.map(n => (
            <div key={n._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: n.read ? 'var(--card)' : 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)', transition: 'background 0.2s' }}>
              <span style={{ fontSize: 20 }}>{ICONS[n.type]}</span>
              <Link to={`/profile/${n.sender?._id}`}><AvatarDisplay user={n.sender} size={36} /></Link>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{n.sender?.username}</span>
                <span style={{ color: 'var(--text2)', fontSize: 14 }}> {n.message}</span>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
