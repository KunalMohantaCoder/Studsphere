import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import api from '../lib/api';

const TAGS = ['buildinpublic', 'startup', 'collaborate', 'feedback', 'learning', 'coding'];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('');
  const [search, setSearch] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const r = await api.get('/posts', { params: { tag: activeTag, search } });
      setPosts(r.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [activeTag, search]);

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Home Feed</h2>
      <CreatePost onPost={(p) => setPosts(prev => [p, ...prev])} />

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search posts, tags, users..." />
      </div>

      {/* Tag filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className={`btn btn-sm ${activeTag === '' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTag('')}>All</button>
        {TAGS.map(t => (
          <button key={t} className={`btn btn-sm ${activeTag === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTag(activeTag === t ? '' : t)}>#{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>No posts yet</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Be the first to share something!</div>
        </div>
      ) : (
        posts.map(p => <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} />)
      )}
    </div>
  );
}
