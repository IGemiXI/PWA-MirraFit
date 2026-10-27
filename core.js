/* MirraFit – Zustand, Speicher, Feedback und Aktionen (entspricht AppViewModel.kt, Store.kt, Feedback.kt) */
'use strict';

/* ---------- Icons (Material, gefüllt) ---------- */
const ICONS = {
  check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  remove: 'M19 13H5v-2h14v2z',
  up: 'M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z',
  down: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z',
  expand: 'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z',
  chevronRight: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  play: 'M8 5v14l11-7z',
  more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5-1-1h-5l-1 1H5v2h14V4z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  dumbbell: 'M20.57 14.86 22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z',
  insights: 'M21 8c-1.1 0-2 .9-2 2 0 .24.04.47.12.68l-3.6 3.6c-.21-.08-.44-.12-.68-.12-.24 0-.47.04-.68.12l-2.04-2.04c.08-.21.12-.44.12-.68 0-1.1-.9-2-2-2s-2 .9-2 2c0 .24.04.47.12.68l-4.44 4.44c-.21-.08-.44-.12-.68-.12-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.24-.04-.47-.12-.68l4.44-4.44c.21.08.44.12.68.12.24 0 .47-.04.68-.12l2.04 2.04c-.08.21-.12.44-.12.68 0 1.1.9 2 2 2s2-.9 2-2c0-.24-.04-.47-.12-.68l3.6-3.6c.21.08.44.12.68.12 1.1 0 2-.9 2-2s-.9-2-2-2zM15 9l.94-2.07L18 6l-2.06-.93L15 3l-.92 2.07L12 6l2.08.93zM3.5 11 4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9z',
  timer: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  flag: 'M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z',
  fire: 'M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.71 6.68 8 8.87 13.62c.18.46-.36.89-.75.59-1.81-1.37-2-3.34-1.84-4.75.06-.52-.62-.77-.91-.34C4.69 10.16 4 11.84 4 14.37c.38 5.6 5.11 7.32 6.81 7.54 2.43.31 5.06-.14 6.95-1.87 2.08-1.93 2.84-5.01 1.72-7.69zm-9.28 5.03c1.44-.35 2.18-1.39 2.38-2.31.33-1.43-.96-2.83-.09-5.09.33 1.87 3.27 3.04 3.27 5.08.08 2.53-2.66 4.7-5.56 2.32z',
  schedule: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  swap: 'M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3 5 6.99h3V14h2V6.99h3L9 3z',
  trendUp: 'm16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  trendDown: 'm16 18 2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
  trendFlat: 'm22 12-4-4v3H3v2h15v3z',
  grip: 'M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  skip: 'm6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  upload: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
  list: 'M19 5v14H5V5h14m1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2z',
  restore: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  sort: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
  vibration: 'M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  note: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  fullscreen: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
  scale: 'M12 3a9 9 0 0 0-9 9h2a7 7 0 0 1 14 0h2a9 9 0 0 0-9-9zm0 4a5 5 0 0 0-5 5h2.2l2.3-3.3 1.6 1.1L11.6 12H17a5 5 0 0 0-5-5zM3 14v7h18v-7H3zm2 2h14v3H5v-3z',
  bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  layers: 'm11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  drop: 'M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM6 4v12h2V6h4V4H6z',
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z',
};
const ic = (name, size = 24, cls = '') =>
  `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const $ = (sel, root = document) => root.querySelector(sel);

/* ---------- Zustand ---------- */
const STORE_KEY = 'mirrafit.data.v1';
const S = {
  data: null,
  now: Date.now(),
  tab: 'home',            // home | workout | stats
  sheet: null,            // {type:'plan'|'prefs'|'order'|'form'|'detail', ...}
  summary: null,
  confirm: null,
  toast: null,
  menu: null,             // Index der Übung mit offenem Menü
  expanded: {},           // Übungs-ID -> aufgeklappt
  histOpen: new Set(),
  showAllPlan: false,
  statsMode: null,
  form: null,
  detailMetric: 0,
  anim: {},
  spruch: '',
  lastCurrent: -1,
  resetScroll: false,
  storageError: false,
  edit: null,
  bigTimer: false,
  setMenu: null,          // "ei-si" des Satzes mit offenem Menü
  histFilter: 'all',      // Plan-Filter im Verlauf
  statsPlan: 'all',       // Plan-Filter in der Auswertung
  body: null,             // Formular Körperdaten
  bodyMetric: 0,
  planEditName: null,
};

const SPRUECHE = [
  "Heute wird's stark. Los geht's!",
  'Jeder Satz zählt.',
  'Disziplin schlägt Motivation.',
  'Du musst nicht perfekt sein, nur dranbleiben.',
  "Einmal starten, dann läuft's.",
  'Besser als gestern reicht völlig.',
  'Der schwerste Satz ist der erste.',
];
const SUMMARY_LINES = ['Starke Einheit!', 'Wieder ein Stück gewachsen.', 'Dranbleiben zahlt sich aus.', 'Sauber durchgezogen.', 'Das war ordentlich Arbeit.'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* ---------- Speicher ---------- */
function loadData() {
  let text = null;
  try { text = localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {
    // Defekte Daten nicht überschreiben, Kopie behalten.
    try { localStorage.setItem(STORE_KEY + '.defekt', text); } catch (e2) { /* egal */ }
    return null;
  }
}
function saveData() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(S.data));
    S.storageError = false;
  } catch (e) {
    if (!S.storageError) { S.storageError = true; showToast('⚠️ Speichern fehlgeschlagen – Speicher voll?'); }
  }
}
function initialData() {
  const raw = loadData();
  const d = raw ? L.normalizeData(raw) : L.emptyData();
  if (d.timer && d.timer.end <= Date.now()) d.timer = null;
  return d;
}

/* Backup-Erinnerung (liegt separat, ist nicht Teil des Backups) */
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) { /* egal */ } };
function backupDue() {
  const hist = S.data.history.length;
  if (hist < 3) return false;
  const snooze = Number(lsGet('mirrafit.backupSnooze') || 0);
  if (Date.now() < snooze) return false;
  const last = Number(lsGet('mirrafit.lastBackup') || 0);
  return !last || Date.now() - last > 30 * 86400000;
}

/* ---------- Vibration & Ton ---------- */
const Feedback = {
  actx: null,
  unlock() {
    try {
      if (!this.actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.actx = new C(); }
      if (this.actx && this.actx.state === 'suspended') this.actx.resume();
    } catch (e) { /* egal */ }
  },
  /** Muster wie in der Android-App: vibrieren, Pause, vibrieren … (ms). false = nicht unterstützt. */
  buzz(pattern) {
    try {
      if (typeof navigator.vibrate !== 'function') return false;
      return navigator.vibrate(pattern);
    } catch (e) { return false; }
  },
  /** Drei kurze Pieptöne, der letzte höher. */
  beep() {
    this.unlock();
    const c = this.actx;
    if (!c) return;
    try {
      const t0 = c.currentTime + 0.02;
      [[880, 0], [880, 0.4], [1175, 0.8]].forEach(([f, d]) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + d);
        g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.3);
        o.connect(g); g.connect(c.destination);
        o.start(t0 + d); o.stop(t0 + d + 0.32);
      });
    } catch (e) { /* egal */ }
  },
  /** Benachrichtigung (nur wenn die App im Hintergrund ist). */
  notify(title, body) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((r) => r.showNotification(title, {
          body, tag: 'mirrafit-rest', icon: 'icons/icon-192.png', badge: 'icons/favicon.png', vibrate: [400, 150, 400], renotify: true,
        }));
      } else {
        new Notification(title, { body, tag: 'mirrafit-rest', icon: 'icons/icon-192.png' });
      }
    } catch (e) { /* egal */ }
  },
};
function buzz(...p) { if (S.data.settings.vibrate) Feedback.buzz(p); }

/* ---------- Toast ---------- */
let toastSeq = 0;
let toastTimer = null;
function showToast(text, opts = {}) {
  const t = { id: ++toastSeq, text, gold: !!opts.gold, actionLabel: opts.actionLabel || null, action: opts.action || null };
  S.toast = t;
  renderToast();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => clearToast(t.id), t.action ? 4200 : 2400);
}
function clearToast(id) {
  if (!S.toast || S.toast.id !== id) return;
  S.toast = null;
  const el = $('#toast .toast');
  if (el) {
    el.classList.add('out');
    setTimeout(() => { if (!S.toast) $('#toast').innerHTML = ''; }, 200);
  }
}
function renderToast() {
  const t = S.toast;
  const host = $('#toast');
  if (!host) return;
  if (!t) { host.innerHTML = ''; return; }
  host.innerHTML = `<div class="toast${t.gold ? ' gold' : ''}${t.actionLabel ? ' act' : ''}" role="status">
    ${ic(t.gold ? 'trophy' : 'info', 20)}
    <div class="tx">${esc(t.text)}</div>
    ${t.actionLabel ? `<button class="ta" data-a="toastAction">${esc(t.actionLabel)}</button>` : ''}
  </div>`;
}

/* ---------- Änderungen ---------- */
/** Speichert und zeichnet neu (render=false für reine Eingaben, damit das Eingabefeld den Fokus behält). */
function commit(render = true) {
  saveData();
  if (render) renderAll();
}
const D = () => S.data;

/* ---------- Pläne ---------- */
const planById = (id) => D().plans.find((p) => p.id === id) || null;
/** Der als Nächstes gewählte Plan. */
const P = () => planById(D().planId) || D().plans[0];
const allPlanExercises = () => D().plans.flatMap((p) => p.exercises);
const currentBw = () => { const e = L.latestBody(D().body); return e ? e.weight : 0; };

function selectPlan(id) {
  if (!planById(id)) return;
  D().planId = id;
  commit();
}

function createPlan() {
  const d = D();
  const id = L.newPlanId();
  let n = d.plans.length + 1;
  while (d.plans.some((p) => p.name === `Plan ${n}`)) n++;
  d.plans.push({ id, name: `Plan ${n}`, exercises: [] });
  commit(false);
  return id;
}

function renamePlan(id, name) {
  const p = planById(id);
  if (!p) return;
  p.name = String(name).slice(0, 40);
  commit(false);
}

function duplicatePlan(id) {
  const p = planById(id);
  if (!p) return null;
  const copy = { id: L.newPlanId(), name: `${p.name} (Kopie)`.slice(0, 40), exercises: L.clone(p.exercises) };
  D().plans.splice(D().plans.indexOf(p) + 1, 0, copy);
  commit();
  showToast(`„${p.name}“ kopiert – die Übungen behalten ihre Statistik`);
  return copy.id;
}

function deletePlan(id) {
  const d = D();
  if (d.plans.length <= 1) { showToast('Mindestens ein Plan muss bleiben'); return; }
  const i = d.plans.findIndex((p) => p.id === id);
  if (i < 0) return;
  const removed = d.plans[i];
  const wasActive = d.planId === id;
  d.plans.splice(i, 1);
  if (wasActive) d.planId = d.plans[Math.min(i, d.plans.length - 1)].id;
  commit();
  showToast(`Plan „${removed.name}“ gelöscht`, {
    actionLabel: 'Rückgängig',
    action: () => {
      if (planById(removed.id)) return;
      D().plans.splice(Math.min(i, D().plans.length), 0, removed);
      if (wasActive) D().planId = removed.id;
      commit();
    },
  });
}

/* ---------- Training ---------- */
const newSet = () => ({ kg: '', reps: '', done: false, pr: false, drops: [] });

function startSession(planId) {
  const d = D();
  const plan = planById(planId || d.planId) || P();
  if (!plan.exercises.length) { showToast(`„${plan.name}“ ist leer – füge erst Übungen hinzu`); return false; }
  d.planId = plan.id;
  d.session = {
    start: Date.now(),
    planId: plan.id,
    planName: plan.name,
    exercises: plan.exercises.map((e) => ({
      id: e.id, name: e.name, cat: e.cat, reps: e.reps,
      ...(e.rest ? { rest: e.rest } : {}), ...(e.note ? { note: e.note } : {}), ...(typeof e.bwf === 'number' ? { bwf: e.bwf } : {}),
      sets: Array.from({ length: e.sets }, newSet),
    })),
  };
  S.expanded = {};
  S.setMenu = null;
  S.lastCurrent = 0;
  buzz(30);
  showToast(`${plan.name} – los geht's!`);
  commit();
  return true;
}

function discardSession() {
  const d = D();
  d.session = null;
  d.timer = null;
  commit();
}

function finishSession() {
  const d = D();
  const s = d.session;
  if (!s) return;
  const exercises = s.exercises
    .map((e) => ({
      id: e.id, name: e.name, cat: e.cat, bwf: L.exBwf(e),
      sets: e.sets.filter((x) => x.done).map((x) => {
        const drops = L.numDrops(x.drops);
        return { kg: L.num(x.kg), reps: L.num(x.reps), pr: x.pr, ...(drops.length ? { drops } : {}) };
      }),
    }))
    .filter((e) => e.sets.length);
  if (!exercises.length) { discardSession(); return; }
  const end = Date.now();
  const bw = currentBw();
  const entry = { id: end, start: s.start, end, ...(s.planId ? { planId: s.planId, planName: s.planName } : {}), ...(bw > 0 ? { bw } : {}), exercises };
  d.history = [...d.history, entry].sort((a, b) => a.start - b.start);
  d.session = null;
  d.timer = null;
  if (d.plans.length > 1 && s.planId && planById(s.planId)) d.planId = L.nextPlanId(d.plans, s.planId);
  S.summary = entry;
  buzz(50, 50, 50, 50, 120);
  commit();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* egal */ }
}

const sessSet = (ei, si) => { const s = D().session; return s && s.exercises[ei] && s.exercises[ei].sets[si]; };

function setField(ei, si, isKg, value) {
  const set = sessSet(ei, si);
  if (!set) return;
  if (isKg) set.kg = value; else set.reps = value;
  commit(false);
}

function setDropField(ei, si, di, isKg, value) {
  const set = sessSet(ei, si);
  const dr = set && set.drops && set.drops[di];
  if (!dr) return;
  if (isKg) dr.kg = value; else dr.reps = value;
  commit(false);
}

function stepField(ei, si, isKg, delta) {
  const s = D().session;
  const ex = s && s.exercises[ei];
  const set = ex && ex.sets[si];
  if (!set) return;
  const sug = L.suggestion(L.lastSets(D().history, ex.id), ex, si);
  const cur = isKg ? (set.kg || sug[0]) : (set.reps || sug[1]);
  const next = Math.max(0, Math.round((L.num(cur) + delta) * 100) / 100);
  if (isKg) set.kg = L.plainNum(next); else set.reps = L.plainNum(next);
  buzz(8);
  commit();
}

/** Vorschlag für Dropsatz di eines Satzes (aus letzter Einheit oder ~20 % leichter). */
function dropSug(ex, si, di) {
  const set = ex.sets[si];
  const prev = L.lastSets(D().history, ex.id)[si];
  const prevDrop = prev && prev.drops ? prev.drops[di] : null;
  const sug = L.suggestion(L.lastSets(D().history, ex.id), ex, si);
  const base = di > 0 ? set.drops[di - 1] : { kg: set.kg || sug[0], reps: set.reps || sug[1] };
  const baseKg = L.num(base.kg || (di > 0 ? dropSug(ex, si, di - 1)[0] : ''));
  const baseReps = L.num(base.reps || (di > 0 ? dropSug(ex, si, di - 1)[1] : ''));
  return L.dropSuggestion(baseKg, baseReps, prevDrop);
}

function addDrop(ei, si) {
  const set = sessSet(ei, si);
  if (!set) return;
  set.drops = set.drops || [];
  if (set.drops.length >= 4) { showToast('Maximal 4 Drops pro Satz'); return; }
  set.drops.push({ kg: '', reps: '' });
  S.setMenu = null;
  buzz(10);
  commit();
}

function removeDrop(ei, si, di) {
  const set = sessSet(ei, si);
  if (!set || !set.drops) return;
  set.drops.splice(di, 1);
  commit();
}

function removeSet(ei, si) {
  const s = D().session;
  const ex = s && s.exercises[ei];
  if (!ex || ex.sets.length <= 1) { showToast('Mindestens ein Satz bleibt – sonst Übung überspringen'); return; }
  ex.sets.splice(si, 1);
  S.setMenu = null;
  commit();
}

function toggleSet(ei, si) {
  const d = D();
  const s = d.session;
  const ex = s && s.exercises[ei];
  const set = ex && ex.sets[si];
  if (!set) return;
  S.setMenu = null;

  if (set.done) {
    set.done = false;
    set.pr = false;
    commit();
    return;
  }

  // Leere Felder aus letzter Einheit / vorherigem Satz / Ziel füllen – ein Tipp genügt.
  const sug = L.suggestion(L.lastSets(d.history, ex.id), ex, si);
  const kg = set.kg || sug[0];
  const reps = set.reps || sug[1];
  const drops = (set.drops || []).map((dr, di) => {
    const ds = dropSug(ex, si, di);
    return { kg: dr.kg || ds[0], reps: dr.reps || ds[1] };
  });
  const best = L.bestFor(d.history, s, ex.id, ei, si);
  const kgN = L.num(kg);
  const rN = L.num(reps);
  const pr = best.seen && ((kgN > 0 && L.e1rm(kgN, rN) > best.e1rm + 0.01) || (kgN === 0 && best.e1rm === 0 && rN > best.bwReps));

  ex.sets[si] = { kg, reps, done: true, pr, drops };
  const nowComplete = ex.sets.every((x) => x.done);
  if (pr) {
    showToast(`Neuer Bestwert: ${ex.name}`, { gold: true });
    buzz(30, 60, 30);
  } else if (nowComplete) buzz(40, 60, 40);
  else buzz(40);
  S.anim.pop = `${ei}-${si}`;
  if (d.settings.autoTimer) startTimer(ex.rest || d.settings.rest, false);
  commit();
}

function changeSets(ei, delta) {
  const s = D().session;
  const e = s && s.exercises[ei];
  if (!e) return;
  if (delta > 0) e.sets.push(newSet());
  else if (e.sets.length > 1) e.sets.pop();
  commit();
}

function moveSessionExTo(from, to, render = true) {
  const s = D().session;
  if (!s || from === to || from < 0 || to < 0 || from >= s.exercises.length || to >= s.exercises.length) return;
  s.exercises.splice(to, 0, s.exercises.splice(from, 1)[0]);
  commit(render);
}
const moveSessionEx = (ei, dir) => moveSessionExTo(ei, ei + dir);

function skipExercise(ei) {
  const s = D().session;
  const ex = s && s.exercises[ei];
  if (!ex) return;
  s.exercises.splice(ei, 1);
  commit();
  showToast(`„${ex.name}“ übersprungen`, {
    actionLabel: 'Rückgängig',
    action: () => {
      const cur = D().session;
      if (cur && !cur.exercises.some((x) => x.id === ex.id)) {
        cur.exercises.splice(Math.min(Math.max(ei, 0), cur.exercises.length), 0, ex);
        commit();
      }
    },
  });
}

function deleteHistory(id) {
  const d = D();
  if (!d.history.some((h) => h.id === id)) return;
  const before = d.history;
  d.history = L.recomputePrs(d.history.filter((h) => h.id !== id));
  commit();
  showToast('Einheit gelöscht', {
    actionLabel: 'Rückgängig',
    action: () => { D().history = before; commit(); },
  });
}

/* ---------- Pausen-Timer ---------- */
let lastTick = -1;
function startTimer(secs, render = true) {
  lastTick = -1;
  D().timer = { end: Date.now() + secs * 1000, total: secs };
  commit(render);
}
function addTime(secs) {
  const t = D().timer;
  if (!t) { startTimer(Math.max(secs, 15)); return; }
  const end = Math.max(Date.now() + 1000, t.end + secs * 1000);
  lastTick = -1;
  D().timer = { end, total: Math.max(t.total + secs, 1) };
  commit();
}
function stopTimer() {
  D().timer = null;
  commit();
}
/** Pause der aktuellen Übung (oder Standard). */
function currentRest() {
  const s = D().session;
  if (s) {
    const cur = s.exercises.find((e) => e.sets.some((x) => !x.done));
    if (cur && cur.rest) return cur.rest;
  }
  return D().settings.rest;
}

/* ---------- Übungen eines Plans ---------- */
function movePlanTo(planId, from, to, render = true) {
  const p = planById(planId);
  if (!p) return;
  const l = p.exercises;
  if (from === to || from < 0 || to < 0 || from >= l.length || to >= l.length) return;
  l.splice(to, 0, l.splice(from, 1)[0]);
  commit(render);
}
const movePlan = (planId, i, dir) => movePlanTo(planId, i, i + dir);

function sessionOrderLikePlan() {
  const s = D().session;
  if (!s) return;
  const plan = planById(s.planId) || P();
  const order = plan.exercises.map((e) => e.id);
  const rank = (e) => { const i = order.indexOf(e.id); return i < 0 ? 1e9 : i; };
  s.exercises = s.exercises.map((e, i) => ({ e, i })).sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i).map((x) => x.e);
  commit();
}

function removePlanEx(planId, i) {
  const p = planById(planId);
  const ex = p && p.exercises[i];
  if (!ex) return;
  p.exercises.splice(i, 1);
  commit();
  showToast(`„${ex.name}“ entfernt`, {
    actionLabel: 'Rückgängig',
    action: () => {
      const q = planById(planId);
      if (q && !q.exercises.some((x) => x.id === ex.id)) {
        q.exercises.splice(Math.min(Math.max(i, 0), q.exercises.length), 0, ex);
        commit();
      }
    },
  });
}

function resetPlanEx(planId) {
  const p = planById(planId);
  if (!p) return;
  p.exercises = L.defaultPlan();
  commit();
}

/** Legt eine Übung an oder ändert sie. reuseId verknüpft mit einer bekannten Übung/Vorlage (Bestwerte bleiben). */
function saveExercise(f) {
  const d = D();
  const n = f.name.trim();
  if (!n) { showToast('Bitte einen Namen eingeben'); return false; }
  const c = f.cat.trim() || 'Allgemein';
  const sets = Math.min(10, Math.max(1, parseInt(f.sets, 10) || 3));
  const r = f.reps.trim() || '10';
  const reuseId = f.reuse ? f.reuse.id : null;
  const extra = { bwf: Math.max(0, Math.min(1.5, Number(f.bwf) || 0)) };
  if (f.rest > 0) extra.rest = f.rest;
  if (f.note && f.note.trim()) extra.note = f.note.trim().slice(0, 300);
  const strip = (o) => { const x = { ...o }; delete x.rest; delete x.note; delete x.bwf; return x; };
  const plan = planById(f.planId) || P();

  if (f.mode === 'PLAN_EDIT') {
    const old = plan.exercises[f.idx];
    if (!old) return false;
    // Name, Gruppe usw. gelten für dieselbe Übung in allen Plänen
    for (const p of d.plans) {
      p.exercises = p.exercises.map((e) => {
        if (e.id !== old.id) return e;
        if (p === plan) return { ...strip(e), name: n, cat: c, sets, reps: r, ...extra };
        // gleiche Übung in anderen Plänen: Name/Gruppe/Eigengewicht/Notiz übernehmen, Sätze/Pause bleiben
        const o = { ...strip(e), name: n, cat: c, bwf: extra.bwf, ...(e.rest ? { rest: e.rest } : {}) };
        if (extra.note) o.note = extra.note;
        return o;
      });
    }
    if (d.session) d.session.exercises = d.session.exercises.map((e) => (e.id === old.id ? { ...strip(e), name: n, cat: c, reps: r, ...extra } : e));
  } else if (f.mode === 'PLAN_ADD') {
    const id = reuseId && !plan.exercises.some((p) => p.id === reuseId) ? reuseId : L.newId();
    plan.exercises.push({ id, name: n, cat: c, reps: r, sets, ...extra });
  } else {
    const s = d.session;
    if (!s) return false;
    const id = reuseId && !s.exercises.some((e) => e.id === reuseId) ? reuseId : L.newId();
    s.exercises.push({ id, name: n, cat: c, reps: r, ...extra, sets: Array.from({ length: sets }, newSet) });
    const sp = planById(s.planId) || plan;
    if (f.alsoPlan && !sp.exercises.some((p) => p.id === id)) sp.exercises.push({ id, name: n, cat: c, reps: r, sets, ...extra });
  }
  commit();
  return true;
}

/* ---------- Körperdaten ---------- */
function setBodyProfile(key, value) {
  const b = D().body;
  if (key === 'sex') b.sex = value === 'w' ? 'w' : 'm';
  if (key === 'height') { const h = L.num(value); b.height = h >= 100 && h <= 250 ? h : 0; }
  commit(false);
}

function saveBodyEntry(f) {
  const b = D().body;
  const weight = L.num(f.weight);
  const waist = L.num(f.waist), neck = L.num(f.neck), hip = L.num(f.hip);
  let kfa = f.mode === 'calc' ? (L.navyBf(b.sex, b.height, waist, neck, hip) || 0) : L.num(f.kfa);
  if (weight && (weight < 20 || weight > 400)) { showToast('Gewicht bitte in kg (20–400)'); return false; }
  if (kfa && (kfa < 2 || kfa > 70)) { showToast('KFA bitte zwischen 2 und 70 %'); return false; }
  if (f.mode === 'calc' && (waist || neck) && !kfa) { showToast(b.height ? 'Maße unvollständig oder unplausibel' : 'Bitte zuerst deine Größe eintragen'); return false; }
  if (!weight && !kfa) { showToast('Bitte Gewicht oder KFA eintragen'); return false; }
  const ts = f.date ? new Date(f.date + 'T' + (f.id ? L.formatTime(f.ts) : L.formatTime(Date.now())) + ':00').getTime() : Date.now();
  const entry = {
    id: f.id || Date.now(), ts: Number.isFinite(ts) ? ts : Date.now(), weight: weight || 0, kfa: kfa || 0,
    waist: f.mode === 'calc' ? waist : 0, neck: f.mode === 'calc' ? neck : 0, hip: f.mode === 'calc' && b.sex === 'w' ? hip : 0,
  };
  b.entries = [...b.entries.filter((e) => e.id !== entry.id), entry].sort((a, c) => a.ts - c.ts);
  commit();
  showToast('Körperdaten gespeichert');
  return true;
}

function deleteBodyEntry(id) {
  const b = D().body;
  const before = b.entries;
  b.entries = b.entries.filter((e) => e.id !== id);
  commit();
  showToast('Eintrag gelöscht', { actionLabel: 'Rückgängig', action: () => { D().body.entries = before; commit(); } });
}

/* ---------- Einstellungen & Daten ---------- */
function setSetting(key, v) {
  D().settings[key] = key === 'weeklyGoal' ? Math.min(7, Math.max(1, v)) : v;
  commit();
}

function toggleTrainDay(day) {
  const st = D().settings;
  st.trainDays = st.trainDays.includes(day) ? st.trainDays.filter((x) => x !== day) : [...st.trainDays, day].sort();
  commit();
}

function toggleHome(id) {
  const h = D().settings.home.find((x) => x.id === id);
  if (h) h.on = !h.on;
  commit();
}
function moveHome(i, dir) {
  const h = D().settings.home;
  const j = i + dir;
  if (j < 0 || j >= h.length) return;
  h.splice(j, 0, h.splice(i, 1)[0]);
  commit();
}

function downloadBackup() {
  const text = JSON.stringify(L.makeBackup(D()), null, 2);
  const day = new Date();
  const name = `mirrafit-backup-${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}.json`;
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    lsSet('mirrafit.lastBackup', String(Date.now()));
    showToast('Backup gespeichert');
    if (S.sheet && S.sheet.type === 'prefs') renderAll();
  } catch (e) { showToast('⚠️ Speichern fehlgeschlagen'); }
}

async function shareBackup() {
  const text = JSON.stringify(L.makeBackup(D()), null, 2);
  const day = new Date().toISOString().slice(0, 10);
  try {
    const file = new File([text], `mirrafit-backup-${day}.json`, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'MirraFit Backup' });
      lsSet('mirrafit.lastBackup', String(Date.now()));
      if (S.sheet && S.sheet.type === 'prefs') renderAll();
    } else showToast('Teilen wird hier nicht unterstützt');
  } catch (e) { /* abgebrochen */ }
}

function snapshotUndo(label) {
  const before = L.clone(S.data);
  return { actionLabel: 'Rückgängig', action: () => { S.data = L.normalizeData(before); commit(); showToast(label); } };
}

function applyBackup(b) {
  const d = D();
  const undo = snapshotUndo('Import rückgängig gemacht');
  d.plans = b.plans;
  d.planId = b.planId;
  d.history = b.history;
  d.settings = b.settings;
  if (b.body) d.body = b.body; // Android-Backups enthalten keine Körperdaten -> vorhandene behalten
  commit();
  showToast('Import erfolgreich ✓', undo);
}

/** Gespeicherte Einheit bearbeiten (Tippfehler korrigieren, Sätze/Übungen/Drops entfernen). */
function saveHistoryEdit(edit) {
  const d = D();
  const idx = d.history.findIndex((h) => h.id === edit.id);
  if (idx < 0) return false;
  const exercises = edit.exercises
    .map((e) => ({
      id: e.id, name: e.name, cat: e.cat, ...(typeof e.bwf === 'number' ? { bwf: e.bwf } : {}),
      sets: e.sets.map((x) => {
        const drops = L.numDrops(x.drops);
        return { kg: Math.max(0, L.num(x.kg)), reps: Math.max(0, L.num(x.reps)), pr: false, ...(drops.length ? { drops } : {}) };
      }).filter((x) => x.kg > 0 || x.reps > 0),
    }))
    .filter((e) => e.sets.length);
  if (!exercises.length) { showToast('Mindestens ein Satz muss bleiben – sonst Einheit löschen'); return false; }
  const before = d.history;
  const next = [...d.history];
  next[idx] = { ...next[idx], exercises };
  d.history = L.recomputePrs(next);
  commit();
  showToast('Einheit gespeichert', { actionLabel: 'Rückgängig', action: () => { D().history = before; commit(); } });
  return true;
}

function wipeAll() {
  const undo = snapshotUndo('Daten wiederhergestellt');
  S.data = L.emptyData();
  S.expanded = {};
  lsDel('mirrafit.lastBackup');
  lsDel('mirrafit.backupSnooze');
  commit();
  showToast('Alles zurückgesetzt', undo);
}

function testFeedback() {
  const ok = Feedback.buzz([300, 150, 300]);
  Feedback.beep();
  showToast(ok ? 'Vibration gesendet – spürst du nichts, prüfe die Handy-Einstellungen'
    : '⚠️ Dieses Gerät/dieser Browser meldet keine Vibration (iPhone: nicht möglich)');
}
