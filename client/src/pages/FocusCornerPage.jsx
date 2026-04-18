import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

const TIMER_MODES = [
  { label: 'Focus', minutes: 25, color: 'var(--primary)' },
  { label: 'Short Break', minutes: 5, color: 'var(--success)' },
  { label: 'Long Break', minutes: 15, color: 'var(--accent)' },
];

export default function FocusCornerPage() {
  const [session, setSession] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [activeTab, setActiveTab] = useState('timer');
  const [timerMode, setTimerMode] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [newTask, setNewTask] = useState('');
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);

  useEffect(() => {
    api.get('/focus/today').then(r => setSession(r.data)).catch(() => {});
    fetchAnalytics();
  }, []);

  const fetchAnalytics = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    api.get('/focus/analytics', { params: { month, year } }).then(r => setAnalytics(r.data)).catch(() => {});
  };

  useEffect(() => {
    setTimeLeft(TIMER_MODES[timerMode].minutes * 60);
    setRunning(false);
  }, [timerMode]);

  useEffect(() => {
    if (running) {
      sessionStartRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const elapsed = Math.round((Date.now() - sessionStartRef.current) / 60000);
            if (timerMode === 0 && elapsed > 0) {
              api.post('/focus/log', { minutes: elapsed }).then(r => { setSession(r.data); fetchAnalytics(); }).catch(() => {});
              setCycles(c => c + 1);
            }
            new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA').play?.().catch(() => {});
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        if (sessionStartRef.current && timerMode === 0) {
          const elapsed = Math.round((Date.now() - sessionStartRef.current) / 60000);
          if (elapsed > 0) {
            api.post('/focus/log', { minutes: elapsed }).then(r => { setSession(r.data); fetchAnalytics(); }).catch(() => {});
          }
        }
        sessionStartRef.current = null;
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => { setRunning(false); setTimeLeft(TIMER_MODES[timerMode].minutes * 60); };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const tasks = [...(session?.tasks || []), { text: newTask.trim(), done: false, date: today }];
    setNewTask('');
    try {
      const r = await api.put('/focus/tasks', { tasks });
      setSession(r.data);
    } catch {}
  };

  const toggleTask = async (idx) => {
    const tasks = session.tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
    try {
      const r = await api.put('/focus/tasks', { tasks });
      setSession(r.data);
    } catch {}
  };

  const deleteTask = async (idx) => {
    const tasks = session.tasks.filter((_, i) => i !== idx);
    try {
      const r = await api.put('/focus/tasks', { tasks });
      setSession(r.data);
    } catch {}
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const totalSecs = TIMER_MODES[timerMode].minutes * 60;
  const progress = ((totalSecs - timeLeft) / totalSecs) * 100;
  const mode = TIMER_MODES[timerMode];

  const doneTasks = session?.tasks?.filter(t => t.done).length || 0;
  const totalTasks = session?.tasks?.length || 0;
  const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Analytics calculations
  const todayDate = new Date().toISOString().split('T')[0];
  const monthTotal = analytics.reduce((s, d) => s + d.focusMinutes, 0);
  const todaySession = analytics.find(d => d.date === todayDate);

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Focus Corner 🎯</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24, fontSize: 14 }}>Your personal study space — timer, tasks, and analytics</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
        {[['timer', '⏱ Timer'], ['tasks', '✅ Tasks'], ['analytics', '📊 Analytics']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, background: activeTab === key ? 'var(--card)' : 'transparent', color: activeTab === key ? 'var(--primary)' : 'var(--text2)', boxShadow: activeTab === key ? 'var(--shadow)' : 'none', transition: 'all 0.15s', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* TIMER TAB */}
      {activeTab === 'timer' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {TIMER_MODES.map((m, i) => (
              <button key={i} onClick={() => setTimerMode(i)} className={`btn btn-sm ${timerMode === i ? 'btn-primary' : 'btn-ghost'}`}>{m.label}</button>
            ))}
          </div>

          {/* Timer circle */}
          <div style={{ position: 'relative', width: 240, height: 240 }}>
            <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="120" cy="120" r="108" fill="none" stroke="var(--bg3)" strokeWidth="10" />
              <circle cx="120" cy="120" r="108" fill="none" stroke={mode.color} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 108}`}
                strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: mode.color }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{mode.label}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className={`btn ${running ? 'btn-danger' : 'btn-primary'}`} style={{ minWidth: 120, justifyContent: 'center', fontSize: 16 }} onClick={() => setRunning(r => !r)}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="btn btn-ghost" onClick={reset}>↺ Reset</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 400 }}>
            <StatCard label="Today's Focus" value={`${session?.focusMinutes || 0} min`} />
            <StatCard label="Cycles Today" value={cycles} />
            <StatCard label="Tasks Done" value={`${doneTasks}/${totalTasks}`} />
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input className="input" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Add a task for today..." style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addTask}>Add</button>
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
                <span>Daily Progress</span><span>{taskPercent}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${taskPercent}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.4s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(session?.tasks || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div>No tasks yet. Add one above!</div>
              </div>
            )}
            {(session?.tasks || []).map((task, i) => (
              <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: task.done ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                <input type="checkbox" checked={task.done} onChange={() => toggleTask(i)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }} />
                <span style={{ flex: 1, fontSize: 15, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text3)' : 'var(--text)' }}>{task.text}</span>
                <button onClick={() => deleteTask(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <StatCard label="This Month" value={`${monthTotal} min`} sub={`${Math.round(monthTotal / 60 * 10) / 10} hrs`} />
            <StatCard label="Today" value={`${todaySession?.focusMinutes || 0} min`} />
            <StatCard label="Active Days" value={analytics.filter(d => d.focusMinutes > 0).length} sub="this month" />
          </div>

          {/* Bar chart */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Monthly Focus Activity</h3>
            {analytics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>No data yet. Start focusing!</div>
            ) : (
              <BarChart data={analytics} />
            )}
          </div>

          {/* Completion streaks */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Daily Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analytics.filter(d => d.focusMinutes > 0).slice().reverse().slice(0, 10).map(d => (
                <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 80 }}>{d.date}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (d.focusMinutes / 120) * 100)}%`, background: 'var(--primary)', borderRadius: 999 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 50, textAlign: 'right' }}>{d.focusMinutes} min</span>
                </div>
              ))}
              {analytics.filter(d => d.focusMinutes > 0).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>Start a focus session to see your log!</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.focusMinutes), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto', paddingBottom: 24, position: 'relative' }}>
      {data.map(d => {
        const h = Math.max(4, (d.focusMinutes / max) * 100);
        const day = d.date.split('-')[2];
        const isToday = d.date === new Date().toISOString().split('T')[0];
        return (
          <div key={d.date} title={`${d.date}: ${d.focusMinutes} min`} style={{ flex: '0 0 auto', width: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: `${h}%`, background: isToday ? 'var(--accent)' : 'var(--primary)', borderRadius: '3px 3px 0 0', opacity: d.focusMinutes === 0 ? 0.15 : 1, transition: 'height 0.3s' }} />
            <span style={{ fontSize: 8, color: 'var(--text3)', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>{day}</span>
          </div>
        );
      })}
    </div>
  );
}
