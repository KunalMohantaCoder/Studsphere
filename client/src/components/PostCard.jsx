import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from './Layout';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(post.savedBy?.includes(user?._id));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const handleLike = async () => {
    try {
      const r = await api.post(`/posts/${post._id}/like`);
      setLiked(r.data.liked); setLikes(r.data.likesCount);
    } catch {}
  };

  const handleSave = async () => {
    try {
      const r = await api.post(`/posts/${post._id}/save`);
      setSaved(r.data.saved);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const r = await api.post(`/posts/${post._id}/comments`, { content: commentText });
      setComments(prev => [...prev, r.data]);
      setCommentText('');
    } catch {} finally { setPosting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.delete(`/posts/${post._id}`); onDelete?.(post._id); } catch {}
  };

  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <Link to={`/profile/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AvatarDisplay user={post.author} size={38} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{post.author?.username}</span>
              {post.author?.isFounder && <span className="badge badge-accent" style={{ fontSize: 10 }}>Founder</span>}
              {post.author?.buildInPublic && <span className="badge badge-success" style={{ fontSize: 10 }}>Building 🔨</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {post.type === 'blog' && <span className="badge badge-primary" style={{ fontSize: 10 }}>Blog</span>}
          {post.author?._id === user?._id && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, padding: 4 }}>×</button>
          )}
        </div>
      </div>

      {/* Content */}
      {post.title && <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{post.title}</h3>}
      <p style={{ color: 'var(--text2)', lineHeight: 1.6, fontSize: 15, whiteSpace: 'pre-wrap' }}>{post.content}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {post.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <ActionBtn onClick={handleLike} active={liked} color="var(--danger)">
          <HeartIcon filled={liked} /> {likes}
        </ActionBtn>
        <ActionBtn onClick={() => setShowComments(p => !p)}>
          <CommentIcon /> {comments.length}
        </ActionBtn>
        <ActionBtn onClick={handleSave} active={saved} color="var(--primary)">
          <BookmarkIcon filled={saved} /> {saved ? 'Saved' : 'Save'}
        </ActionBtn>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop: 16 }}>
          {comments.map(c => (
            <div key={c._id} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <AvatarDisplay user={c.author} size={28} />
              <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.author?.username}</span>
                <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 2 }}>{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="input" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" type="submit" disabled={posting}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, active, color }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: active ? color : 'var(--text3)', fontSize: 13, fontWeight: 500, padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s' }}>
      {children}
    </button>
  );
}

function HeartIcon({ filled }) {
  return <svg width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function CommentIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function BookmarkIcon({ filled }) {
  return <svg width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
