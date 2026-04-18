import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from '../components/Layout';
import PostCard from '../components/PostCard';
import api from '../lib/api';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const isMe = me?._id === id;

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`).then(r => {
      setData(r.data);
      setFollowing(r.data.user.followers?.some(f => f._id === me?._id || f === me?._id));
      setForm({ bio: r.data.user.bio || '', skills: r.data.user.skills?.join(', ') || '', interests: r.data.user.interests?.join(', ') || '', isFounder: r.data.user.isFounder || false, buildInPublic: r.data.user.buildInPublic || false });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    try {
      const r = await api.post(`/users/${id}/follow`);
      setFollowing(r.data.following);
      setData(prev => ({ ...prev, user: { ...prev.user, followers: r.data.following ? [...prev.user.followers, { _id: me._id }] : prev.user.followers.filter(f => f._id !== me._id) } }));
    } catch {}
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), interests: form.interests.split(',').map(s => s.trim()).filter(Boolean) };
      const r = await api.put(`/users/${id}`, payload);
      setData(prev => ({ ...prev, user: { ...prev.user, ...r.data } }));
      updateUser(r.data);
      setEditing(false);
    } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>User not found</div>;

  const { user, posts } = data;

  return (
    <div>
      {/* Cover / Profile header */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <AvatarDisplay user={user} size={72} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontWeight: 800, fontSize: 22 }}>{user.username}</h2>
                {user.isFounder && <span className="badge badge-accent">Founder 🚀</span>}
                {user.buildInPublic && <span className="badge badge-success">Building 🔨</span>}
              </div>
              {user.bio && <p style={{ color: 'var(--text2)', marginTop: 6, fontSize: 14, maxWidth: 400 }}>{user.bio}</p>}
              <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                <Stat label="Posts" value={posts.length} />
                <Stat label="Followers" value={user.followers?.length || 0} />
                <Stat label="Following" value={user.following?.length || 0} />
              </div>
            </div>
          </div>
          <div>
            {isMe ? (
              <button className="btn btn-ghost" onClick={() => setEditing(p => !p)}>{editing ? 'Cancel' : 'Edit Profile'}</button>
            ) : (
              <button className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`} onClick={handleFollow}>{following ? 'Unfollow' : 'Follow'}</button>
            )}
          </div>
        </div>

        {/* Skills & Interests */}
        {user.skills?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {user.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        )}
        {user.interests?.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {user.interests.map(i => <span key={i} className="tag">{i}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing && isMe && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Bio</label>
              <textarea className="input" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Skills (comma-separated)</label>
              <input className="input" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="React, Python, Design..." />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Interests (comma-separated)</label>
              <input className="input" value={form.interests} onChange={e => setForm(p => ({ ...p, interests: e.target.value }))} placeholder="AI, Startups, Music..." />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.isFounder} onChange={e => setForm(p => ({ ...p, isFounder: e.target.checked }))} />
                Founder badge
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.buildInPublic} onChange={e => setForm(p => ({ ...p, buildInPublic: e.target.checked }))} />
                Build in Public
              </label>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
          </div>
        </div>
      )}

      {/* Posts */}
      <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Posts</h3>
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No posts yet</div>
      ) : (
        posts.map(p => <PostCard key={p._id} post={p} />)
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</div>
    </div>
  );
}
