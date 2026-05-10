import React from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Award, Bell, BookOpen, Bot, CheckCircle2, ChevronRight,
  Clock3, Command, Gauge, History, Home, LockKeyhole, LogOut, Menu, MessageCircle,
  Mic2, MoreHorizontal, Paperclip, Pin, Plus, Radio, Search, Send, Settings,
  Shield, ShieldCheck, Sparkles, Star, Target, Trophy, Users, X, Zap
} from 'lucide-react';
import './styles/app.css';
import { useClock } from './hooks/useClock.js';
import { useRealtimeOps } from './hooks/useRealtimeOps.js';
import { cn, formatTime } from './utils/format.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'tasks', label: 'Tareas', icon: CheckCircle2 },
  { id: 'news', label: 'Novedades', icon: BookOpen },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'stats', label: 'Estadísticas', icon: Gauge },
  { id: 'settings', label: 'Configuración', icon: Settings }
];

const shiftOperators = ['Alfonso', 'Lucía', 'Martín', 'Camila', 'Sofía', 'Bruno', 'Valentina', 'Mateo', 'Paula', 'Diego', 'Renata'];
const posts = Array.from({ length: 11 }, (_, index) => `Puesto ${index + 1}`);

function App() {
  const [session, setSession] = React.useState(() => JSON.parse(localStorage.getItem('sentinel-session') || 'null'));
  const [active, setActive] = React.useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const ops = useRealtimeOps(session);

  React.useEffect(() => {
    if (session) localStorage.setItem('sentinel-session', JSON.stringify(session));
  }, [session]);

  const logout = () => {
    localStorage.removeItem('sentinel-session');
    ops.releaseSession?.();
    setSession(null);
  };

  if (!session) {
    return <LoginScreen operators={shiftOperators} posts={posts} occupiedPosts={ops.occupiedPosts} onLogin={setSession} />;
  }

  return (
    <div className="app-shell">
      <AmbientGrid />
      <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} session={session} logout={logout} />
      <main className="workspace">
        <Topbar session={session} onlineCount={ops.operators.filter((op) => op.online).length} setSidebarOpen={setSidebarOpen} />
        <AnimatePresence mode="wait">
          <motion.section key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="page-content">
            {active === 'dashboard' && <Dashboard ops={ops} session={session} setActive={setActive} />}
            {active === 'chat' && <ChatOps ops={ops} session={session} />}
            {active === 'tasks' && <TasksPage ops={ops} />}
            {active === 'news' && <NewsPage ops={ops} />}
            {active === 'ranking' && <RankingPage ops={ops} />}
            {active === 'stats' && <StatsPage ops={ops} />}
            {active === 'settings' && <SettingsPage session={session} />}
          </motion.section>
        </AnimatePresence>
      </main>
      <NotificationDock notifications={ops.notifications} />
    </div>
  );
}

function LoginScreen({ operators, posts, occupiedPosts, onLogin }) {
  const [shiftKey, setShiftKey] = React.useState('CENTRAL-OPS');
  const [operator, setOperator] = React.useState(operators[0]);
  const [post, setPost] = React.useState(posts[0]);
  const locked = occupiedPosts.includes(post);

  const submit = (event) => {
    event.preventDefault();
    if (locked || !shiftKey.trim()) return;
    onLogin({ operator, post, shiftKey, avatar: operator.slice(0, 1), sessionId: crypto.randomUUID(), startedAt: new Date().toISOString() });
  };

  return (
    <main className="login-screen">
      <AmbientGrid />
      <motion.form className="login-card glass-card" onSubmit={submit} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="login-logo"><ShieldCheck size={34} /></div>
        <p className="eyebrow">Central de monitoreo en tiempo real</p>
        <h1>Sentinel Ops</h1>
        <p className="muted">Login operativo de turno, recuperación automática de sesión y bloqueo de puestos duplicados para 11 operadores simultáneos.</p>
        <label>Clave general del turno<input value={shiftKey} onChange={(event) => setShiftKey(event.target.value)} placeholder="Clave compartida del turno" /></label>
        <div className="login-grid">
          <label>Operador<select value={operator} onChange={(event) => setOperator(event.target.value)}>{operators.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label>Puesto<select value={post} onChange={(event) => setPost(event.target.value)}>{posts.map((item) => <option key={item} disabled={occupiedPosts.includes(item)}>{item}{occupiedPosts.includes(item) ? ' · ocupado' : ''}</option>)}</select></label>
        </div>
        <div className={cn('seat-status', locked && 'danger')}><Radio size={16} />{locked ? 'Puesto ocupado en vivo. Seleccioná otro.' : 'Puesto disponible y listo para tomar guardia.'}</div>
        <button className="primary-action" disabled={locked}><LockKeyhole size={18} /> Ingresar a la central <ChevronRight size={18} /></button>
      </motion.form>
    </main>
  );
}

function Sidebar({ active, setActive, open, setOpen, session, logout }) {
  return (
    <aside className={cn('sidebar glass-panel', open && 'open')}>
      <div className="brand"><div className="brand-mark"><Shield /></div><div><strong>Sentinel Ops</strong><span>NOC / SOC Command</span></div><button className="icon-button mobile-only" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={cn(active === id && 'active')} onClick={() => { setActive(id); setOpen(false); }}><Icon size={19} /><span>{label}</span><i /></button>)}</nav>
      <div className="operator-chip"><div className="avatar pulse">{session.avatar}</div><div><strong>{session.operator}</strong><span>{session.post} · online</span></div></div>
      <button className="logout" onClick={logout}><LogOut size={18} /> Liberar puesto</button>
    </aside>
  );
}

function Topbar({ session, onlineCount, setSidebarOpen }) {
  const clock = useClock();
  return <header className="topbar glass-panel"><button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)}><Menu /></button><div className="search"><Search size={18} /><span>Buscar mensajes, tareas, operadores, CCTV...</span><kbd>⌘K</kbd></div><div className="top-actions"><div className="activity-pill"><span /> LIVE</div><div className="clock"><Clock3 size={18} />{clock}</div><div className="online-pill"><Users size={17} />{onlineCount}/11</div><button className="icon-button"><Bell size={19} /><em /></button><div className="mini-user"><b>{session.avatar}</b><span>{session.post}</span></div></div></header>;
}

function Dashboard({ ops, session, setActive }) {
  const cards = [
    ['Operadores online', ops.operators.filter((op) => op.online).length, Users, 'success'],
    ['Incidentes críticos', ops.tasks.filter((task) => task.priority === 'Crítica').length, AlertTriangle, 'danger'],
    ['Tareas pendientes', ops.tasks.filter((task) => task.status !== 'Finalizada').length, CheckCircle2, 'warning'],
    ['Novedades activas', ops.news.length, BookOpen, 'accent']
  ];
  return <div className="dashboard-grid"><section className="hero glass-card"><div><p className="eyebrow">Turno operativo activo</p><h2>Centro Sentinel estabilizado, {session.operator}.</h2><p className="muted">Vista táctica con chat rápido, incidentes, actividad de turno y ranking colaborativo en vivo.</p></div><div className="radar"><span /><ShieldCheck size={52} /></div></section><section className="metrics-row">{cards.map(([label, value, Icon, tone]) => <MetricCard key={label} label={label} value={value} Icon={Icon} tone={tone} />)}</section><section className="panel-xl glass-card"><PanelHeader title="Chat rápido operativo" action="Abrir chat" onClick={() => setActive('chat')} /><ChatList messages={ops.messages.slice(-4)} compact /></section><section className="panel-md glass-card"><PanelHeader title="Incidentes activos" /><TaskStack tasks={ops.tasks.slice(0, 4)} /></section><section className="panel-side glass-card"><PanelHeader title="Ranking colaborativo" /><RankingList operators={ops.operators.slice(0, 5)} /></section><section className="panel-wide glass-card"><PanelHeader title="Actividad del turno" /><Timeline events={ops.activity} /></section></div>;
}

function MetricCard({ label, value, Icon, tone }) { return <motion.article className={cn('metric-card glass-card', tone)} whileHover={{ y: -4 }}><Icon size={22} /><strong>{value}</strong><span>{label}</span><div className="metric-line" /></motion.article>; }
function PanelHeader({ title, action, onClick }) { return <div className="panel-header"><h3>{title}</h3>{action && <button onClick={onClick}>{action}<ChevronRight size={15} /></button>}</div>; }

function ChatOps({ ops, session }) {
  const [text, setText] = React.useState('');
  const send = () => { if (!text.trim()) return; ops.sendMessage(text); setText(''); };
  return <div className="chat-layout"><section className="channels glass-card"><PanelHeader title="Canales" /><Channel active icon={Radio} title="# general-turno" meta="11 online" /><Channel icon={AlertTriangle} title="# incidentes" meta="3 críticos" /><Channel icon={Mic2} title="# coordinación" meta="voz standby" /><PanelHeader title="Privados" />{ops.operators.slice(0, 6).map((op) => <Channel key={op.name} icon={Users} title={op.name} meta={op.post} online={op.online} />)}</section><section className="chat-main glass-card"><div className="chat-title"><div><h2># general-turno</h2><span>Mensajes, respuestas, fijados, adjuntos e importantes</span></div><div className="chat-tools"><button><Pin size={16} /> 3 fijados</button><button><MoreHorizontal size={16} /></button></div></div><div className="messages"><ChatList messages={ops.messages} current={session.operator} /></div><div className="composer"><button><Plus size={19} /></button><button><Paperclip size={19} /></button><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Escribir mensaje operativo, @mencionar o /crear tarea..." /><button className="send" onClick={send}><Send size={19} /></button></div></section><aside className="context-panel glass-card"><PanelHeader title="Contexto vivo" /><PinnedNote /><TaskStack tasks={ops.tasks.slice(0, 3)} /></aside></div>;
}

function ChatList({ messages, compact, current }) { return messages.map((message) => <motion.article className={cn('message-row', current === message.operator && 'own', compact && 'compact')} key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="avatar">{message.operator[0]}</div><div className="bubble"><div className="message-meta"><strong>{message.operator}</strong><span>{message.post}</span><time>{formatTime(message.createdAt)}</time>{message.important && <Star size={13} />}</div>{message.replyTo && <blockquote>{message.replyTo}</blockquote>}<p>{message.text}</p><div className="message-actions"><span>✓✓ leído</span><button>Responder</button><button>Crear tarea</button><button>😊</button></div></div></motion.article>); }
function Channel({ icon: Icon, title, meta, active, online }) { return <button className={cn('channel', active && 'active')}><Icon size={17} /><span>{title}<small>{meta}</small></span>{online !== undefined && <i className={cn(online && 'on')} />}</button>; }
function PinnedNote() { return <div className="pinned"><Pin size={17} /><strong>Protocolo fijado</strong><p>Priorizar eventos críticos CCTV, derivar a técnico y registrar novedad con seguimiento.</p></div>; }

function TasksPage({ ops }) { return <div className="module-page"><ModuleHero icon={CheckCircle2} title="Sistema de tareas" subtitle="Kanban operativo sin tablas, con historial, prioridades, etiquetas y creación desde mensajes o novedades." /><div className="kanban">{['Pendiente','En proceso','Derivada','Escalada','Finalizada','Cancelada'].map((status) => <section className="kanban-col glass-card" key={status}><PanelHeader title={status} /><TaskStack tasks={ops.tasks.filter((task) => task.status === status)} /></section>)}</div></div>; }
function TaskStack({ tasks }) { return <div className="task-stack">{tasks.map((task) => <motion.article className={cn('task-card', task.priority.toLowerCase())} key={task.id} whileHover={{ x: 4 }}><div className="task-top"><strong>{task.title}</strong><span>{task.priority}</span></div><p>{task.description}</p><div className="tags">{task.tags.map((tag) => <em key={tag}>{tag}</em>)}</div><footer><span>{task.operator}</span><small>{task.time}</small></footer></motion.article>)}</div>; }

function NewsPage({ ops }) { return <div className="module-page"><ModuleHero icon={BookOpen} title="Libro digital de novedades" subtitle="Registro premium con búsqueda, filtros, seguimiento, comentarios, adjuntos, escalamiento y exportación." /><div className="news-grid">{ops.news.map((item) => <article className="news-card glass-card" key={item.id}><div className="news-date"><b>{item.day}</b><span>{item.month}</span></div><div><div className="task-top"><strong>{item.service}</strong><span>{item.priority}</span></div><p>{item.description}</p><div className="news-actions"><button>Resolver</button><button>Escalar</button><button>Exportar</button></div></div></article>)}</div></div>; }

function RankingPage({ ops }) { return <div className="module-page ranking-page"><ModuleHero icon={Trophy} title="Ranking colaborativo" subtitle="Premia calidad, constancia, liderazgo y trabajo en equipo sin competitividad tóxica." /><div className="ranking-board glass-card"><RankingList operators={ops.operators} expanded /></div><Gamification operators={ops.operators} /></div>; }
function RankingList({ operators, expanded }) { return <div className="ranking-list">{operators.map((op, index) => <div className="rank-row" key={op.name}><b>#{index + 1}</b><div className="avatar">{op.name[0]}</div><span><strong>{op.name}</strong><small>{op.post} · Nivel {op.level}</small></span><div className="xp-bar"><i style={{ width: `${Math.min(100, op.xp / 4)}%` }} /></div><em>{op.xp} XP</em>{expanded && <small>{op.reputation}% reputación</small>}</div>)}</div>; }
function Gamification({ operators }) { return <div className="badges-grid">{['Rapidez','Calidad','Liderazgo','Resolución','Disciplina','Equipo'].map((badge, index) => <article className="badge-card glass-card" key={badge}><Award /><strong>{badge}</strong><span>{operators[index % operators.length].name}</span></article>)}</div>; }

function StatsPage({ ops }) { return <div className="module-page"><ModuleHero icon={Gauge} title="Estadísticas operativas" subtitle="KPIs en vivo para continuidad del turno, resolución, SLA, carga de tareas y desempeño colaborativo." /><div className="stats-grid"><ChartCard title="Resolución por hora" /><ChartCard title="Tendencia semanal" wave /><ChartCard title="Carga por puesto" bars /><Timeline events={ops.activity} /></div></div>; }
function ChartCard({ title, wave, bars }) { return <article className="chart-card glass-card"><PanelHeader title={title} /><div className={cn('fake-chart', wave && 'wave', bars && 'bars')}>{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ '--h': `${30 + ((i * 17) % 65)}%` }} />)}</div></article>; }

function SettingsPage({ session }) { return <div className="module-page"><ModuleHero icon={Settings} title="Configuración" subtitle="Firebase ready, sonidos suaves, preferencias visuales, sesión, privacidad operativa y health checks." /><div className="settings-grid"><article className="glass-card setting-card"><ShieldCheck /><strong>Sesión activa</strong><p>{session.operator} · {session.post}</p></article><article className="glass-card setting-card"><Bot /><strong>Realtime</strong><p>Firestore listeners con fallback local para demo.</p></article><article className="glass-card setting-card"><Sparkles /><strong>UI premium</strong><p>Glassmorphism, blur, microanimaciones y skeleton loaders.</p></article><article className="glass-card setting-card"><History /><strong>Historial</strong><p>Auditoría de mensajes, tareas, derivaciones y novedades.</p></article></div></div>; }
function ModuleHero({ icon: Icon, title, subtitle }) { return <section className="module-hero glass-card"><Icon size={32} /><div><p className="eyebrow">Sentinel Ops</p><h2>{title}</h2><p className="muted">{subtitle}</p></div></section>; }
function Timeline({ events }) { return <div className="timeline">{events.map((event) => <div key={event.id}><i /><span>{event.time}</span><p>{event.text}</p></div>)}</div>; }
function NotificationDock({ notifications }) { return <div className="toast-dock">{notifications.slice(0, 3).map((item) => <motion.div className="toast glass-card" key={item.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }}><Zap size={16} /><span>{item.text}</span></motion.div>)}</div>; }
function AmbientGrid() { return <div className="ambient"><span /><span /><span /></div>; }

createRoot(document.getElementById('root')).render(<App />);
