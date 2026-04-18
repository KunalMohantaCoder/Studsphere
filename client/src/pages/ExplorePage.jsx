import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AvatarDisplay } from '../components/Layout';
import api from '../lib/api';

export default function ExplorePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    api.get('/users/suggestions').then(r => {
      const safe = (r.data || []).map(u => ({
        ...u,
        skills: Array.isArray(u.skills) ? u.skills : [],
        followers: Array.isArray(u.followers) ? u.followers : [],
      }));
      setUsers(safe);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId) => {
    try {
      const r = await api.post(`/users/${userId}/follow`);
      setFollowing(p => ({ ...p, [userId]: r.data.following }));
      setUsers(prev => prev.map(u => u._id === userId ? {
        ...u,
        followers: r.data.following ? [...(u.followers || []), 'me'] : (u.followers || []).slice(0, -1)
      } : u));
    } catch {}
  };

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Explore People</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24, fontSize: 14 }}>Discover students and founders to connect with</p>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {users.map(u => (
            <div key={u._id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link to={`/profile/${u._id}`}><AvatarDisplay user={u} size={52} /></Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Link to={`/profile/${u._id}`} style={{ fontWeight: 700, fontSize: 15 }}>{u.username}</Link>
                  {u.isFounder && <span className="badge badge-accent" style={{ fontSize: 10 }}>Founder</span>}
                </div>
                {u.bio && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{u.followers.length} followers</div>
                {u.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {u.skills.slice(0, 4).map(s => <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>)}
                  </div>
                )}
              </div>
              <button className={`btn btn-sm ${following[u._id] ? 'btn-ghost' : 'btn-primary'}`} onClick={() => handleFollow(u._id)}>
                {following[u._id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <div style={{ fontWeight: 600 }}>No suggestions right now</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
