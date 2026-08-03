export const FAMILY = [
  { id: 'mama',  name: 'María',  role: 'Mamá', age: 42, initial: 'M', color: 'var(--m-mama)',  status: 'En casa',           loc: 'Cocina',    online: true, battery: 78 },
  { id: 'papa',  name: 'Carlos', role: 'Papá', age: 44, initial: 'C', color: 'var(--m-papa)',  status: 'En el trabajo',     loc: 'Oficina',   online: true, battery: 42 },
  { id: 'sofia', name: 'Sofía',  role: 'Hija', age: 15, initial: 'S', color: 'var(--m-sofia)', status: 'En la escuela',     loc: 'Colegio',   online: true, battery: 64 },
  { id: 'diego', name: 'Diego',  role: 'Hijo', age: 12, initial: 'D', color: 'var(--m-diego)', status: 'Regresando a casa', loc: 'En camino', online: true, battery: 51 },
  { id: 'lucia', name: 'Lucía',  role: 'Hija', age: 8,  initial: 'L', color: 'var(--m-lucia)', status: 'En casa',           loc: 'Sala',      online: true, battery: 86 },
];

export const byId = (id) => FAMILY.find(m => m.id === id);

export const CAMERAS = [
  { id: 'sala',    name: 'Sala',    loc: 'Planta baja', tone: '#3D4A5C', activity: 'Sofía leyendo',  live: true, hasMotion: true,  rtsp: 'rtsp://192.168.1.21:554/live' },
  { id: 'cocina',  name: 'Cocina',  loc: 'Planta baja', tone: '#5C4A3D', activity: 'María cocinando', live: true, hasMotion: false, rtsp: 'rtsp://192.168.1.22:554/live' },
  { id: 'entrada', name: 'Entrada', loc: 'Exterior',    tone: '#4A5C3D', activity: 'Sin actividad',  live: true, hasMotion: false, rtsp: 'rtsp://192.168.1.23:554/live' },
  { id: 'patio',   name: 'Patio',   loc: 'Exterior',    tone: '#5C3D4A', activity: 'Sin actividad',  live: true, hasMotion: false, rtsp: 'rtsp://192.168.1.24:554/live' },
];

export const MERCADO_ITEMS = [
  { id: 1,  name: 'Leche',          who: 'mama',  color: '#FFF4B8', icon: 'milk',   note: '2 L · deslactosada', rot: -3, done: false },
  { id: 2,  name: 'Pan integral',   who: 'diego', color: '#FFD6B8', icon: 'bread',  note: 'el de avena',         rot:  2, done: false },
  { id: 3,  name: 'Huevos',         who: 'mama',  color: '#FFF4B8', icon: 'egg',    note: '18 piezas',           rot: -1, done: true },
  { id: 4,  name: 'Tomate',         who: 'papa',  color: '#FFB8B8', icon: 'tomato', note: 'para la pasta',       rot:  3, done: false },
  { id: 5,  name: 'Fresas',         who: 'sofia', color: '#FFD0E4', icon: 'heart',  note: '¡no se les olvide!',  rot: -2, done: false },
  { id: 6,  name: 'Chocolate',      who: 'lucia', color: '#D8E8C8', icon: 'star',   note: 'el del oso 🐻',       rot:  4, done: false },
  { id: 7,  name: 'Café',           who: 'papa',  color: '#FFD6B8', icon: 'box',    note: 'molido fino',         rot: -2, done: false },
  { id: 8,  name: 'Aguacates',      who: 'mama',  color: '#D8E8C8', icon: 'leaf',   note: '3-4 maduros',         rot:  1, done: false },
  { id: 9,  name: 'Croquetas',      who: 'diego', color: '#FFD6B8', icon: 'paw',    note: 'para Lola',           rot: -3, done: false },
  { id: 10, name: 'Galletas María', who: 'lucia', color: '#FFF4B8', icon: 'star',   note: null,                  rot:  2, done: false },
];

export const CHAT_CHANNELS = [
  {
    id: 'familia', name: 'Familia Hernández', tag: 'Grupo principal',
    last: 'Diego: Ya casi llego, paso por pan 🥖', time: '4m',
    unread: 3, members: ['mama','papa','sofia','diego','lucia'], pinned: true,
  },
  {
    id: 'padres', name: 'Carlos & María', tag: 'Solo papás',
    last: 'Te quiero ❤️', time: '1h',
    unread: 0, members: ['mama','papa'],
  },
  {
    id: 'recados', name: 'Recados del hogar', tag: 'Asistente',
    last: '🔔 Recordatorio: pagar luz mañana', time: '2h',
    unread: 1, members: ['mama'],
  },
  {
    id: 'hermanos', name: 'Sofí, Diego y Lu', tag: 'Hermanos',
    last: 'Sofía: ¿Quién se llevó mis audífonos?', time: 'ayer',
    unread: 0, members: ['sofia','diego','lucia'],
  },
];

export const CHAT_MESSAGES = [
  { from: 'papa',  text: 'Buenos días equipo ☀️ ¿Quién va por las cosas del super?', time: '8:14 AM', day: 'Hoy' },
  { from: 'mama',  text: 'Yo voy saliendo. Diego me ayudas?', time: '8:16 AM' },
  { from: 'diego', text: 'Voy con ella 👍', time: '8:18 AM' },
  { from: 'sofia', text: '¿Pueden traer fresas porfa?', time: '8:22 AM' },
  { from: 'lucia', text: 'Y chocolate!! 🍫🍫', time: '8:22 AM', sticker: true },
  { from: 'mama',  text: 'Anotado. Pongan más cosas en el Mercado si necesitan algo más', time: '8:25 AM', system: 'shared-list' },
  { from: 'papa',  text: 'Yo recojo a Lucía a las 5.', time: '4:38 PM' },
  { from: 'diego', text: 'Ya casi llego, paso por pan 🥖', time: '6:58 PM' },
];

export const CAL_EVENTS = [
  { id: 1, title: 'Cita médica de Lucía',  time: '9:00', end: '10:00', who: 'lucia', cat: 'salud',    note: 'Pediatra · Dr. Mendoza', color: 'var(--m-lucia)' },
  { id: 2, title: 'Clase de fútbol',        time: '10:30', end: '12:00', who: 'diego', cat: 'deporte',  note: 'Campo norte · llevar agua', color: 'var(--m-diego)' },
  { id: 3, title: 'Junta de trabajo',       time: '11:00', end: '12:30', who: 'papa',  cat: 'trabajo',  note: 'Zoom · enlace en el correo', color: 'var(--m-papa)' },
  { id: 4, title: 'Comida en familia',      time: '14:00', end: '15:00', who: null,    cat: 'familia',  note: 'Casa de los abuelos', color: 'var(--d-sage)' },
  { id: 5, title: 'Examen de matemáticas',  time: '16:00', end: '17:00', who: 'sofia', cat: 'escuela',  note: 'Álgebra · último parcial', color: 'var(--m-sofia)' },
  { id: 6, title: 'Yoga',                   time: '18:30', end: '19:30', who: 'mama',  cat: 'bienestar', note: 'Parque central', color: 'var(--m-mama)' },
  { id: 7, title: 'Noche de películas',     time: '20:00', end: '22:00', who: null,    cat: 'familia',  note: 'Le toca elegir a Lucía 🎬', color: 'var(--d-terra)' },
];

export const CAL_WEEK = [
  { d: 'L', n: 25, today: false },
  { d: 'M', n: 26, today: true  },
  { d: 'X', n: 27, today: false },
  { d: 'J', n: 28, today: false },
  { d: 'V', n: 29, today: false },
  { d: 'S', n: 30, today: false },
  { d: 'D', n: 31, today: false },
];

export const CAT_ICONS = {
  salud: 'heart',
  deporte: 'flame',
  trabajo: 'box',
  familia: 'home',
  escuela: 'star',
  bienestar: 'leaf',
};
