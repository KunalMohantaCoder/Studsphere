import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from '../components/Layout';
import { getSocket } from '../hooks/useSocket';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations').then(r => setConversations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (userId) loadChat(userId);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('message:receive', (msg) => {
      if (msg.sender._id === activeUser?._id || msg.sender === activeUser?._id) {
        setMessages(p => [...p, msg]);
      }
      setConversations(prev => {
        const exists = prev.find(c => c.user._id === (msg.sender._id || msg.sender));
        if (exists) return prev.map(c => c.user._id === (msg.sender._id || msg.sender) ? { ...c, lastMessage: msg, unread: c.user._id === activeUser?._id ? 0 : c.unread + 1 } : c);
        return prev;
      });
    });
    socket.on('typing:start', ({ senderId }) => { if (senderId === activeUser?._id) setIsTyping(true); });
    socket.on('typing:stop', ({ senderId }) => { if (senderId === activeUser?._id) setIsTyping(false); });
    return () => { socket.off('message:receive'); socket.off('typing:start'); socket.off('typing:stop'); };
  }, [activeUser]);

  const loadChat = async (uid) => {
    try {
      const [msgRes, userRes] = await Promise.all([
        api.get(`/messages/${uid}`),
        api.get(`/users/${uid}`)
      ]);
      setMessages(msgRes.data);
      setActiveUser(userRes.data.user);
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    const socket = getSocket();
    try {
      const r = await api.post('/messages', { receiverId: activeUser._id, content: text });
      setMessages(p => [...p, r.data]);
      setText('');
      socket?.emit('message:send', { ...r.data, receiverId: activeUser._id });
    } catch {}
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!typing) { setTyping(true); socket?.emit('typing:start', { receiverId: activeUser?._id, senderId: me._id }); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { setTyping(false); socket?.emit('typing:stop', { receiverId: activeUser?._id, senderId: me._id }); }, 1000);
  };

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Messages</h2>
      <div style={{ display: 'grid', gridTemplateColumns: activeUser ? '280px 1fr' : '1fr', gap: 16, height: 'calc(100vh - 140px)' }}>
        {/* Conversations */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Conversations</div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.length === 0 && <div style={{ padding: 24, color: 'var(--text3)', fontSize: 14, textAlign: 'center' }}>No conversations yet</div>}
            {conversations.map(c => (
              <Link key={c.user._id} to={`/messages/${c.user._id}`} onClick={() => loadChat(c.user._id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: activeUser?._id === c.user._id ? 'var(--bg2)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}>
                <AvatarDisplay user={c.user} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.user.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage?.content}</div>
                </div>
                {c.unread > 0 && <span className="badge badge-primary">{c.unread}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Chat */}
        {activeUser && (
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <AvatarDisplay user={activeUser} size={36} />
              <div>
                <div style={{ fontWeight: 600 }}>{activeUser.username}</div>
                {isTyping && <div style={{ fontSize: 12, color: 'var(--primary)' }}>typing...</div>}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((msg, i) => {
                const isMine = (msg.sender._id || msg.sender) === me._id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? 'var(--primary)' : 'var(--bg2)', color: isMine ? '#fff' : 'var(--text)', fontSize: 14, lineHeight: 1.4 }}>
                      {msg.content}
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input className="input" value={text} onChange={handleTyping} placeholder="Type a message..." style={{ flex: 1 }} />
              <button className="btn btn-primary" type="submit" disabled={!text.trim()}>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
