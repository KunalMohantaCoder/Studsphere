import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api from '../lib/api';

export default function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/saved').then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Saved Posts</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
          <div style={{ fontWeight: 600 }}>No saved posts yet</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Bookmark posts to find them here</div>
        </div>
      ) : (
        posts.map(p => <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} />)
      )}
    </div>
  );
}
