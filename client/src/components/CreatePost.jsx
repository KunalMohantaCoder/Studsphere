import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from './Layout';
import api from '../lib/api';

const POPULAR_TAGS = ['buildinpublic', 'startup', 'collaborate', 'feedback', 'learning', 'coding', 'design', 'motivation'];

export default function CreatePost({ onPost }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('thought');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTag = (tag) => {
    const clean = tag.replace('#', '').trim().toLowerCase();
    if (clean && !tags.includes(clean)) setTags(p => [...p, clean]);
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const r = await api.post('/posts', { title, content, tags, type });
      onPost?.(r.data);
      setTitle(''); setContent(''); setTags([]); setOpen(false);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
      {!open ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <AvatarDisplay user={user} size={38} />
          <button onClick={() => setOpen(true)} style={{ flex: 1, textAlign: 'left', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--text3)', fontSize: 14, cursor: 'text' }}>
            What's on your mind?
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['thought', 'blog'].map(t => (
              <button key={t} type="button" className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setType(t)}>
                {t === 'thought' ? '💭 Quick Thought' : '📝 Blog Post'}
              </button>
            ))}
          </div>
          {type === 'blog' && (
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." style={{ marginBottom: 12 }} />
          )}
          <textarea className="input" value={content} onChange={e => setContent(e.target.value)} placeholder={type === 'blog' ? 'Write your blog post...' : 'Share a thought...'} rows={4} style={{ resize: 'vertical', marginBottom: 12 }} />

          {/* Tags */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {POPULAR_TAGS.map(t => (
                <button key={t} type="button" className="tag" onClick={() => addTag(t)} style={{ cursor: 'pointer', opacity: tags.includes(t) ? 0.4 : 1 }}>#{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))} placeholder="Add custom tag..." style={{ flex: 1 }} />
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {tags.map(t => (
                  <span key={t} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setTags(p => p.filter(x => x !== t))}>#{t} ×</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !content.trim()}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
