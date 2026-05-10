import React from 'react';
import { sampleActivity, sampleMessages, sampleNews, sampleOperators, sampleTasks } from '../services/sampleData.js';

export function useRealtimeOps(session) {
  const [operators, setOperators] = React.useState(sampleOperators);
  const [messages, setMessages] = React.useState(sampleMessages);
  const [tasks, setTasks] = React.useState(sampleTasks);
  const [news, setNews] = React.useState(sampleNews);
  const [activity, setActivity] = React.useState(sampleActivity);
  const [notifications, setNotifications] = React.useState([{ id: 'n1', text: 'Realtime operativo conectado' }]);

  React.useEffect(() => {
    if (!session) return undefined;
    setOperators((current) => current.map((op) => op.name === session.operator ? { ...op, post: session.post, online: true } : op));
    const heartbeat = setInterval(() => {
      setActivity((current) => [{ id: crypto.randomUUID(), time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), text: 'Heartbeat de continuidad operativa recibido.' }, ...current.slice(0, 7)]);
    }, 15000);
    return () => clearInterval(heartbeat);
  }, [session]);

  const sendMessage = (text) => {
    if (!session) return;
    const next = {
      id: crypto.randomUUID(),
      operator: session.operator,
      post: session.post,
      text,
      createdAt: new Date().toISOString(),
      important: text.includes('!') || text.toLowerCase().includes('crítico')
    };
    setMessages((current) => [...current, next]);
    setNotifications((current) => [{ id: crypto.randomUUID(), text: `Mensaje enviado por ${session.operator}` }, ...current]);
  };

  const releaseSession = () => {
    if (!session) return;
    setOperators((current) => current.map((op) => op.name === session.operator ? { ...op, online: false } : op));
  };

  return {
    operators,
    messages,
    tasks,
    news,
    activity,
    notifications,
    occupiedPosts: operators.filter((op) => op.online).map((op) => op.post),
    sendMessage,
    releaseSession,
    setTasks,
    setNews
  };
}
