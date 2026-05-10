import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4100;

app.use(cors());
app.use(express.json());

const health = {
  service: 'Sentinel Ops API',
  status: 'operational',
  realtime: 'firebase-firestore-ready',
  version: '1.0.0'
};

app.get('/api/health', (_req, res) => res.json({ ...health, checkedAt: new Date().toISOString() }));

app.post('/api/shift/login', (req, res) => {
  const { operator, post, shiftKey } = req.body;
  if (!operator || !post || !shiftKey) return res.status(400).json({ error: 'operator, post and shiftKey are required' });
  return res.status(201).json({ operator, post, sessionId: crypto.randomUUID(), online: true, startedAt: new Date().toISOString() });
});

app.post('/api/events', (req, res) => {
  const event = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
  return res.status(201).json(event);
});

app.listen(port, () => console.log(`Sentinel Ops API listening on http://localhost:${port}`));
