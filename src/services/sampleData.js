export const sampleOperators = [
  { name: 'Martín', post: 'Puesto 2', online: true, xp: 392, level: 9, reputation: 98 },
  { name: 'Lucía', post: 'Puesto 3', online: true, xp: 344, level: 8, reputation: 96 },
  { name: 'Alfonso', post: 'Puesto 1', online: true, xp: 318, level: 7, reputation: 94 },
  { name: 'Camila', post: 'Puesto 4', online: true, xp: 286, level: 7, reputation: 93 },
  { name: 'Sofía', post: 'Puesto 5', online: true, xp: 251, level: 6, reputation: 91 },
  { name: 'Bruno', post: 'Puesto 6', online: false, xp: 229, level: 6, reputation: 90 },
  { name: 'Valentina', post: 'Puesto 7', online: true, xp: 212, level: 5, reputation: 89 },
  { name: 'Mateo', post: 'Puesto 8', online: true, xp: 198, level: 5, reputation: 88 },
  { name: 'Paula', post: 'Puesto 9', online: true, xp: 177, level: 5, reputation: 87 },
  { name: 'Diego', post: 'Puesto 10', online: false, xp: 149, level: 4, reputation: 84 },
  { name: 'Renata', post: 'Puesto 11', online: true, xp: 130, level: 4, reputation: 82 }
];

export const sampleMessages = [
  { id: 'm1', operator: 'Alfonso', post: 'Puesto 1', text: 'Incidente controlado en Zona Norte. Queda observación preventiva por 20 minutos.', createdAt: new Date(Date.now() - 540000).toISOString(), important: true },
  { id: 'm2', operator: 'Lucía', post: 'Puesto 3', text: 'Derivé el pendiente al técnico de guardia y registré novedad con evidencia.', createdAt: new Date(Date.now() - 420000).toISOString(), replyTo: 'Incidente CCTV Edificio Central' },
  { id: 'm3', operator: 'Martín', post: 'Puesto 2', text: 'Cámaras 04 y 05 recuperaron señal. Mantengo monitoreo de latencia.', createdAt: new Date(Date.now() - 260000).toISOString() },
  { id: 'm4', operator: 'Camila', post: 'Puesto 4', text: 'Cliente notificado. SLA dentro de margen, próximo update a las 11:15.', createdAt: new Date(Date.now() - 120000).toISOString() }
];

export const sampleTasks = [
  { id: 't1', title: 'Incidente CCTV', description: 'Verificar cámaras offline en Edificio Central.', priority: 'Crítica', operator: 'Martín', status: 'Escalada', time: '10:32', tags: ['CCTV', 'SLA', 'Zona Norte'] },
  { id: 't2', title: 'Derivación técnica', description: 'Coordinar visita técnica urgente con proveedor.', priority: 'Alta', operator: 'Lucía', status: 'Derivada', time: '10:41', tags: ['Proveedor', 'Guardia'] },
  { id: 't3', title: 'Reporte cliente', description: 'Enviar actualización operativa con evidencias.', priority: 'Baja', operator: 'Alfonso', status: 'Finalizada', time: '10:47', tags: ['Cliente', 'Reporte'] },
  { id: 't4', title: 'Chequeo perimetral', description: 'Validar sensores con oscilación de señal.', priority: 'Media', operator: 'Camila', status: 'En proceso', time: '10:52', tags: ['Sensores', 'Perímetro'] },
  { id: 't5', title: 'Auditoría de turno', description: 'Cerrar bitácora parcial antes de relevo.', priority: 'Media', operator: 'Sofía', status: 'Pendiente', time: '11:00', tags: ['Historial', 'Turno'] }
];

export const sampleNews = [
  { id: 'nw1', day: '10', month: 'MAY', service: 'Servicio Norte', priority: 'Crítica', description: 'Intermitencia CCTV resuelta con seguimiento técnico y adjuntos de evidencia.' },
  { id: 'nw2', day: '10', month: 'MAY', service: 'Servicio Central', priority: 'Media', description: 'Se registra derivación a proveedor externo con ETA confirmado.' },
  { id: 'nw3', day: '10', month: 'MAY', service: 'Servicio Sur', priority: 'Baja', description: 'Control preventivo sin desvíos. Operación estable.' }
];

export const sampleActivity = [
  { id: 'a1', time: '10:58', text: 'Nueva tarea crítica escalada a guardia técnica.' },
  { id: 'a2', time: '10:51', text: 'Novedad exportada para Servicio Norte.' },
  { id: 'a3', time: '10:43', text: 'Lucía recibió medalla Calidad por registro completo.' },
  { id: 'a4', time: '10:35', text: 'Ranking semanal actualizado con foco colaborativo.' }
];
