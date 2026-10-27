/* MirraFit – reine Logik (1:1 aus Logic.kt / Model.kt portiert, ohne DOM). */
const L = (function () {
  'use strict';

  const APP_VERSION = '3.2';

  /* ---------- Standarddaten ---------- */

  const DEFAULT_SETTINGS = {
    rest: 90,
    autoTimer: true,
    sound: true,
    vibrate: true,
    weeklyGoal: 3,
    tickBuzz: false,
    // Neu in der PWA (andere Apps ignorieren unbekannte Felder):
    keepAwake: true,
    notifyEnd: false,
    trainDays: [],      // 0 = Montag … 6 = Sonntag
    trainTime: '',      // "HH:MM" oder leer
    home: null,         // Reihenfolge/Sichtbarkeit der Startseiten-Bereiche
  };

  const HOME_SECTIONS = [
    ['next', 'Nächstes Training'],
    ['week', 'Diese Woche'],
    ['body', 'Körperdaten'],
    ['weekstats', 'Wochenbilanz'],
    ['plan', 'Plan'],
    ['history', 'Verlauf'],
  ];
  const defaultHome = () => HOME_SECTIONS.map(([id]) => ({ id, on: id !== 'weekstats' }));

  const DEFAULT_PLAN = [
    { id: 'ex1', name: 'Klimmzüge (Untergriff)', cat: 'Rücken / Bizeps', reps: '6-10', sets: 3, bwf: 1 },
    { id: 'ex2', name: 'Schrägbankdrücken', cat: 'Brust / Schulter', reps: '8-10', sets: 3 },
    { id: 'ex3', name: 'Breites Rudern', cat: 'Rücken', reps: '10-12', sets: 3 },
    { id: 'ex4', name: 'Dips', cat: 'Brust / Trizeps', reps: '8-10', sets: 3, bwf: 0.95 },
    { id: 'ex5', name: 'Seitheben', cat: 'Schulter', reps: '12-15', sets: 3 },
    { id: 'ex6', name: 'SZ- / Hammercurls', cat: 'Bizeps · Supersatz', reps: '10-12', sets: 3 },
    { id: 'ex7', name: 'Trizeps-Drücken Seil', cat: 'Trizeps · Supersatz', reps: '12-15', sets: 3 },
    { id: 'ex8', name: 'Beinheben', cat: 'Bauch', reps: '12-15', sets: 3 },
    { id: 'ex9', name: 'Crunches', cat: 'Bauch', reps: '15-20', sets: 2 },
  ];

  /**
   * Übungsvorlagen. bwf = Anteil des Körpergewichts, der bei der Übung bewegt wird
   * (Richtwerte aus Kraftmessungen: Liegestütz ≈ 64 %, Knie-Liegestütz ≈ 49 %, Klimmzug ≈ 100 %, Dip ≈ 95 %).
   */
  const LIBRARY = [
    ['lib_liegestuetz', 'Liegestütze', 'Brust / Trizeps', '10-15', 0.64],
    ['lib_knieliegestuetz', 'Knie-Liegestütze', 'Brust / Trizeps', '10-15', 0.49],
    ['lib_klimmzug', 'Klimmzüge (Obergriff)', 'Rücken / Bizeps', '6-10', 1],
    ['ex1', 'Klimmzüge (Untergriff)', 'Rücken / Bizeps', '6-10', 1],
    ['ex4', 'Dips', 'Brust / Trizeps', '8-10', 0.95],
    ['lib_ruderkoerper', 'Rudern am Körper (Australian Pull-ups)', 'Rücken', '8-12', 0.55],
    ['lib_bankdruecken', 'Bankdrücken', 'Brust / Trizeps', '6-10', 0],
    ['ex2', 'Schrägbankdrücken', 'Brust / Schulter', '8-10', 0],
    ['lib_khbank', 'Kurzhantel-Bankdrücken', 'Brust', '8-12', 0],
    ['lib_flys', 'Butterfly / Kabel-Flys', 'Brust', '12-15', 0],
    ['lib_schulterdruecken', 'Schulterdrücken', 'Schulter / Trizeps', '8-10', 0],
    ['ex5', 'Seitheben', 'Schulter', '12-15', 0],
    ['lib_latzug', 'Latzug', 'Rücken / Bizeps', '8-12', 0],
    ['ex3', 'Breites Rudern', 'Rücken', '10-12', 0],
    ['lib_lhrudern', 'Langhantelrudern', 'Rücken', '8-10', 0],
    ['lib_kreuzheben', 'Kreuzheben', 'Rücken / Beine', '5-8', 0],
    ['lib_kniebeuge', 'Kniebeugen', 'Beine', '6-10', 0],
    ['lib_beinpresse', 'Beinpresse', 'Beine', '10-12', 0],
    ['lib_ausfall', 'Ausfallschritte', 'Beine', '10-12', 0],
    ['lib_beinstrecker', 'Beinstrecker', 'Beine', '12-15', 0],
    ['lib_beinbeuger', 'Beinbeuger', 'Beine', '12-15', 0],
    ['lib_waden', 'Wadenheben', 'Waden', '12-15', 0],
    ['lib_curls', 'Bizepscurls', 'Bizeps', '10-12', 0],
    ['ex6', 'SZ- / Hammercurls', 'Bizeps', '10-12', 0],
    ['ex7', 'Trizeps-Drücken Seil', 'Trizeps', '12-15', 0],
    ['lib_frenchpress', 'French Press', 'Trizeps', '10-12', 0],
    ['ex8', 'Beinheben', 'Bauch', '12-15', 0],
    ['ex9', 'Crunches', 'Bauch', '15-20', 0],
  ].map(([id, name, cat, reps, bwf]) => ({ id, name, cat, reps, sets: 3, bwf }));

  const BWF_BY_NAME = new Map(LIBRARY.filter((x) => x.bwf > 0).map((x) => [x.name.toLowerCase(), x.bwf]));
  BWF_BY_NAME.set('liegestütz', 0.64);
  BWF_BY_NAME.set('klimmzüge', 1);
  /** Eigengewicht-Anteil anhand des Namens (für Daten ohne Angabe, z. B. aus der Android-App). */
  const guessBwf = (name) => BWF_BY_NAME.get(String(name || '').trim().toLowerCase()) || 0;
  const exBwf = (e) => (e && typeof e.bwf === 'number' ? e.bwf : guessBwf(e && e.name));

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const defaultPlan = () => clone(DEFAULT_PLAN);
  const MAIN_PLAN = 'pl_main';
  const emptyBody = () => ({ height: 0, sex: 'm', entries: [] });
  const emptyData = () => ({
    plans: [{ id: MAIN_PLAN, name: 'Oberkörper', exercises: defaultPlan() }],
    planId: MAIN_PLAN,
    history: [],
    settings: { ...DEFAULT_SETTINGS, home: defaultHome() },
    body: emptyBody(),
    session: null,
    timer: null,
  });

  /* ---------- Zahlen & Formate ---------- */

  /** Komma oder Punkt, ungültig = 0. */
  function num(s) {
    if (s == null) return 0;
    if (typeof s === 'number') return Number.isFinite(s) ? s : 0;
    const t = String(s).trim().replace(',', '.');
    if (t === '') return 0;
    const v = Number(t);
    return Number.isFinite(v) ? v : 0;
  }

  /** Geschätztes 1RM (Epley). */
  const e1rm = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0);

  const nfCache = {};
  function fmt(n, digits = 1) {
    const nf = nfCache[digits] || (nfCache[digits] = new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits, minimumFractionDigits: 0 }));
    return nf.format(n);
  }

  /** 60 -> "60", 62.5 -> "62,5" (für Eingabefelder). */
  function plainNum(d) {
    if (Number.isInteger(d) && Math.abs(d) < 1e12) return String(d);
    return String(Math.round(d * 1000) / 1000).replace('.', ',');
  }

  const fmtVolume = (kg) => (kg >= 1000 ? [fmt(kg / 1000, 1), 't'] : [fmt(kg, 0), 'kg']);

  function fmtDuration(ms) {
    const m = Math.round(ms / 60000);
    return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`;
  }

  function fmtClock(totalSec) {
    const sec = totalSec < 0 ? 0 : Math.floor(totalSec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const pad2 = (n) => String(n).padStart(2, '0');

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${WD[d.getDay()]}, ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
  };
  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };
  const formatWeekLabel = (ts) => {
    const d = new Date(ts);
    return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.`;
  };
  const monthLong = (ts) => new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date(ts));
  const shortMonthName = (ts) => new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(new Date(ts));
  const longDate = (ts) => {
    const d = new Date(ts);
    return `${WD_LONG[d.getDay()]}, ${d.getDate()}. ${new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(d)}`;
  };
  const dayOfMonth = (ts) => String(new Date(ts).getDate());

  const firstNumber = (s) => (String(s).match(/\d+/) || [''])[0];
  const rnd = () => Math.random().toString(16).slice(2, 10).padEnd(8, '0');
  const newId = () => 'ex_' + rnd();
  const newPlanId = () => 'pl_' + rnd();

  /* ---------- Tage & Wochen (Montag = Wochenanfang) ---------- */

  function dayStart(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  function addDays(ts, n) {
    const d = new Date(ts);
    d.setDate(d.getDate() + n);
    return d.getTime();
  }
  function weekStart(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  }
  const prevWeek = (ts) => addDays(ts, -7);

  function streakWeeks(history, nowTs = Date.now()) {
    const weeks = new Set(history.map((h) => weekStart(h.start)));
    let w = weekStart(nowTs);
    let n = 0;
    if (!weeks.has(w)) w = prevWeek(w); // Serie bleibt bis Wochenende am Leben
    while (weeks.has(w)) {
      n++;
      w = prevWeek(w);
    }
    return n;
  }

  function relativeDay(ts, now = Date.now()) {
    const d = dayStart(ts);
    const today = dayStart(now);
    if (d === today) return 'Heute';
    if (d === addDays(today, -1)) return 'Gestern';
    return formatDate(ts);
  }

  function historyGroup(ts, now = Date.now()) {
    const ws = weekStart(ts);
    const cur = weekStart(now);
    if (ws === cur) return 'Diese Woche';
    if (ws === prevWeek(cur)) return 'Letzte Woche';
    return monthLong(ts);
  }

  function fmtPercent(p) {
    const sign = p > 0 ? '+' : p < 0 ? '−' : '±';
    return sign + fmt(Math.abs(p), 0) + ' %';
  }

  /** Kompakte Satz-Schreibweise: "60×10" oder "12" (Körpergewicht), Dropsatz: "60×8 ↘ 50×6". */
  const setLabel = (kg, reps, drops) =>
    (kg > 0 ? fmt(kg) + '×' : '') + plainNum(reps) + (drops && drops.length ? drops.map((d) => ' ↘ ' + (d.kg > 0 ? fmt(d.kg) + '×' : '') + plainNum(d.reps)).join('') : '');

  /* ---------- Körpergewicht & Eigengewicht ---------- */

  /** Bewegte Last pro Wiederholung: Zusatzgewicht + Anteil des Körpergewichts. */
  const load = (kg, bwf, bw) => kg + (bwf > 0 && bw > 0 ? bwf * bw : 0);
  const setVolume = (st, bwf, bw) =>
    load(st.kg, bwf, bw) * st.reps + (st.drops || []).reduce((a, d) => a + load(d.kg, bwf, bw) * d.reps, 0);

  /** Körpergewicht zum Zeitpunkt ts (letzter Eintrag davor, sonst der früheste). */
  function bwAt(body, ts) {
    const list = (body && body.entries) || [];
    let found = 0;
    for (const e of list) if (e.weight > 0) { if (e.ts <= ts) found = e.weight; else if (!found) { found = e.weight; break; } else break; }
    return found;
  }
  const latestBody = (body) => { const l = ((body && body.entries) || []).filter((e) => e.weight > 0); return l.length ? l[l.length - 1] : null; };
  const entryBw = (h, body) => (h.bw > 0 ? h.bw : bwAt(body, h.start));

  /** Körperfett nach US-Navy-Methode (cm). null = Angaben unvollständig/unplausibel. */
  function navyBf(sex, height, waist, neck, hip) {
    if (!(height > 0 && waist > 0 && neck > 0)) return null;
    let v;
    if (sex === 'w') {
      if (!(hip > 0) || waist + hip - neck <= 0) return null;
      v = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;
    } else {
      if (waist - neck <= 0) return null;
      v = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    }
    return v > 2 && v < 70 ? Math.round(v * 10) / 10 : null;
  }
  const bmi = (weight, height) => (weight > 0 && height > 0 ? weight / ((height / 100) * (height / 100)) : 0);

  /* ---------- Trainingstage (0 = Montag) ---------- */
  const weekdayIdx = (ts) => (new Date(ts).getDay() + 6) % 7;
  /** Nächster geplanter Trainingstag ab heute (heute zählt nur, wenn noch nicht trainiert). */
  function nextTrainDay(trainDays, trainedToday, now = Date.now()) {
    if (!trainDays || !trainDays.length) return null;
    for (let k = trainedToday ? 1 : 0; k < 8; k++) {
      const ts = dayStart(addDays(now, k));
      if (trainDays.includes(weekdayIdx(ts))) return { ts, inDays: k };
    }
    return null;
  }

  /** Vorschlag für einen Dropsatz: ~20 % weniger Gewicht (auf 2,5 kg gerundet), gleiche Wiederholungen. */
  function dropSuggestion(baseKg, baseReps, prev) {
    if (prev && prev.reps > 0) return [prev.kg > 0 ? plainNum(prev.kg) : '', plainNum(prev.reps)];
    const kg = baseKg > 0 ? Math.max(0, Math.round((baseKg * 0.8) / 2.5) * 2.5) : 0;
    return [kg > 0 ? plainNum(kg) : '', baseReps > 0 ? plainNum(baseReps) : ''];
  }

  /** Rotation: nach einem Training ist der nächste Plan in der Liste dran. */
  function nextPlanId(plans, trainedId) {
    if (!plans.length) return null;
    const i = plans.findIndex((p) => p.id === trainedId);
    return plans[(i + 1) % plans.length].id;
  }

  /* ---------- Verlauf ---------- */

  function lastSets(history, exId) {
    for (let i = history.length - 1; i >= 0; i--) {
      const ex = history[i].exercises.find((e) => e.id === exId);
      if (ex && ex.sets.length) return ex.sets;
    }
    return [];
  }

  /** Bestwerte einer Übung aus Verlauf + laufendem Training (ohne Satz ignoreEx/ignoreSet). */
  function bestFor(history, session, exId, ignoreEx, ignoreSet) {
    const b = { e1rm: 0, bwReps: 0, seen: false };
    const consider = (kg, r) => {
      b.seen = true;
      b.e1rm = Math.max(b.e1rm, e1rm(kg, r));
      if (kg === 0) b.bwReps = Math.max(b.bwReps, r);
    };
    for (const h of history) for (const e of h.exercises) if (e.id === exId) for (const s of e.sets) consider(s.kg, s.reps);
    if (session) {
      session.exercises.forEach((e, ei) => {
        if (e.id !== exId) return;
        e.sets.forEach((s, si) => {
          if (s.done && !(ei === ignoreEx && si === ignoreSet)) consider(num(s.kg), num(s.reps));
        });
      });
    }
    return b;
  }

  const numDrops = (drops) => (drops || []).map((d) => ({ kg: num(d.kg), reps: num(d.reps) })).filter((d) => d.reps > 0);

  function sessionStats(s, bw = 0) {
    let volume = 0, sets = 0, prs = 0;
    for (const e of s.exercises) {
      const f = exBwf(e);
      for (const st of e.sets) {
        if (st.done) {
          volume += setVolume({ kg: num(st.kg), reps: num(st.reps), drops: numDrops(st.drops) }, f, bw);
          sets++;
          if (st.pr) prs++;
        }
      }
    }
    return { volume, sets, prs };
  }

  function histStats(exercises, bw = 0) {
    let volume = 0, sets = 0, prs = 0, reps = 0;
    for (const e of exercises) {
      const f = exBwf(e);
      for (const st of e.sets) {
        volume += setVolume(st, f, bw);
        reps += st.reps + (st.drops || []).reduce((a, d) => a + d.reps, 0);
        sets++;
        if (st.pr) prs++;
      }
    }
    return { volume, sets, prs, reps };
  }

  /* ---------- Trainingshelfer ---------- */

  const topOfRange = (reps) => {
    const m = String(reps).match(/\d+/g);
    return m ? parseInt(m[m.length - 1], 10) || 0 : 0;
  };

  /**
   * Vorschlag für einen Satz: gleicher Satz der letzten Einheit, sonst vorheriger Satz
   * der aktuellen Einheit, sonst Ziel-Wiederholungen.
   */
  function suggestion(prev, ex, si) {
    const p = prev[si];
    const before = ex.sets[si - 1];
    let kg = '';
    if (p && p.kg > 0) kg = plainNum(p.kg);
    else if (before && before.kg) kg = before.kg;
    let reps;
    if (p && p.reps > 0) reps = plainNum(p.reps);
    else if (before && before.reps) reps = before.reps;
    else reps = firstNumber(ex.reps);
    return [kg, reps];
  }

  function readyToProgress(prev, targetReps) {
    const top = topOfRange(targetReps);
    return top > 0 && prev.length > 0 && prev.every((s) => s.reps >= top);
  }

  /** Jede je gesehene Übung (Plan + Verlauf). Neu hinzugefügte behalten so ihre Statistik. */
  function knownExercises(plan, history) {
    // plan = flache Liste aller Übungen aus allen Plänen
    const map = new Map();
    for (const h of history) for (const e of h.exercises) {
      const old = map.get(e.id);
      map.set(e.id, {
        id: e.id,
        name: e.name,
        cat: (e.cat || '').trim() || (old ? old.cat : ''),
        reps: old ? old.reps : '10',
        sets: Math.min(10, Math.max(1, e.sets.length)),
      });
    }
    for (const p of plan) map.set(p.id, { id: p.id, name: p.name, cat: p.cat, reps: p.reps, sets: p.sets, ...(typeof p.bwf === 'number' ? { bwf: p.bwf } : {}) });
    return [...map.values()].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'de'));
  }

  /* ---------- Auswertung ---------- */

  function exerciseSessions(history, exId, body) {
    const out = [];
    for (const h of history) {
      const bw = entryBw(h, body);
      const ex = h.exercises.find((e) => e.id === exId && e.sets.length);
      if (!ex) continue;
      const sets = ex.sets;
      const topKg = Math.max(0, ...sets.map((s) => s.kg));
      const topReps = Math.max(0, ...sets.map((s) => s.reps));
      out.push({
        start: h.start,
        sets,
        topKg,
        topReps,
        bestE1rm: Math.max(0, ...sets.map((s) => e1rm(s.kg, s.reps))),
        volume: sets.reduce((a, s) => a + setVolume(s, exBwf(ex), bw), 0),
        reps: sets.reduce((a, s) => a + s.reps + (s.drops || []).reduce((b, d) => b + d.reps, 0), 0),
        hasPr: sets.some((s) => s.pr),
        main: topKg > 0 ? topKg : topReps,
      });
    }
    return out;
  }

  /** "Brust / Trizeps" -> ["Brust","Trizeps"]; "Bizeps · Supersatz" -> ["Bizeps"]. */
  function muscleGroups(cat) {
    const main = String(cat || '').split('·')[0].trim();
    const parts = main.split('/').map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts : ['Sonstige'];
  }

  function setsPerMuscle(history, since) {
    const map = new Map();
    for (const h of history) {
      if (h.start < since) continue;
      for (const e of h.exercises) for (const g of muscleGroups(e.cat)) map.set(g, (map.get(g) || 0) + e.sets.length);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  function workoutsPerDay(history) {
    const map = new Map();
    for (const h of history) {
      const d = dayStart(h.start);
      map.set(d, (map.get(d) || 0) + 1);
    }
    return map;
  }

  /** Bestwert-Markierungen chronologisch neu setzen (nach Bearbeiten/Löschen von Einheiten). */
  function recomputePrs(history) {
    const best = new Map();
    return history.map((h) => ({
      ...h,
      exercises: h.exercises.map((e) => {
        const b = best.get(e.id) || { e: 0, bw: 0, seen: false };
        const sets = e.sets.map((st) => {
          const est = e1rm(st.kg, st.reps);
          const pr = b.seen && ((st.kg > 0 && est > b.e + 0.01) || (st.kg === 0 && b.e === 0 && st.reps > b.bw));
          b.seen = true;
          b.e = Math.max(b.e, est);
          if (st.kg === 0) b.bw = Math.max(b.bw, st.reps);
          return { ...st, pr };
        });
        best.set(e.id, b);
        return { ...e, sets };
      }),
    }));
  }

  /** "Heute", "Gestern", "vor 3 Tagen" */
  function daysAgo(ts, now = Date.now()) {
    const d = Math.round((dayStart(now) - dayStart(ts)) / 86400000);
    return d <= 0 ? 'heute' : d === 1 ? 'gestern' : `vor ${d} Tagen`;
  }

  /* ---------- Backup (gleiches JSON wie die Android-App) ---------- */

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);

  const normDrops = (list) => (Array.isArray(list) ? list : []).filter(isObj).map((d) => ({ kg: Math.max(0, num(d.kg)), reps: Math.max(0, num(d.reps)) })).filter((d) => d.reps > 0).slice(0, 6);
  const bwfField = (p) => {
    if (typeof p.bwf === 'number' && Number.isFinite(p.bwf)) return { bwf: clamp(Math.round(p.bwf * 100) / 100, 0, 1.5) };
    const g = guessBwf(p.name);
    return g > 0 ? { bwf: g } : {};
  };

  function normPlan(list) {
    const out = [];
    const seen = new Set();
    for (const p of Array.isArray(list) ? list : []) {
      if (!isObj(p)) continue;
      const name = String(p.name ?? '').trim();
      if (!name) continue;
      let id = String(p.id ?? '') || newId();
      if (seen.has(id)) id = newId();
      seen.add(id);
      out.push({
        id,
        name,
        cat: String(p.cat ?? '').trim() || 'Allgemein',
        reps: String(p.reps ?? '').trim() || '10',
        sets: clamp(Math.round(num(p.sets)) || 3, 1, 10),
        ...extraFields(p),
        ...bwfField(p),
      });
    }
    return out;
  }

  /** Mehrere Pläne; alte Daten/Android-Backups mit nur "plan" werden zu einem Plan. */
  function normPlans(raw) {
    const out = [];
    const seen = new Set();
    if (Array.isArray(raw.plans)) {
      for (const p of raw.plans) {
        if (!isObj(p)) continue;
        let id = String(p.id ?? '') || newPlanId();
        if (seen.has(id)) id = newPlanId();
        seen.add(id);
        out.push({ id, name: String(p.name ?? '').trim().slice(0, 40) || 'Plan', exercises: normPlan(p.exercises) });
      }
    }
    if (!out.length) out.push({ id: MAIN_PLAN, name: 'Oberkörper', exercises: Array.isArray(raw.plan) ? normPlan(raw.plan) : defaultPlan() });
    return out;
  }

  function normBody(b) {
    const d = emptyBody();
    if (!isObj(b)) return d;
    const h = num(b.height);
    d.height = h >= 100 && h <= 250 ? Math.round(h * 10) / 10 : 0;
    d.sex = b.sex === 'w' ? 'w' : 'm';
    const pos = (v, lo, hi) => { const x = num(v); return x >= lo && x <= hi ? Math.round(x * 10) / 10 : 0; };
    d.entries = (Array.isArray(b.entries) ? b.entries : []).filter(isObj).map((e) => ({
      id: num(e.id) || num(e.ts),
      ts: num(e.ts),
      weight: pos(e.weight, 20, 400),
      kfa: pos(e.kfa, 2, 70),
      waist: pos(e.waist, 30, 250),
      neck: pos(e.neck, 15, 80),
      hip: pos(e.hip, 30, 250),
    })).filter((e) => e.ts > 0 && (e.weight > 0 || e.kfa > 0)).sort((a, b2) => a.ts - b2.ts);
    return d;
  }

  /** Neu in der PWA: eigene Pause (Sekunden, 0 = Standard) und Notiz je Übung. Android ignoriert sie. */
  function extraFields(p) {
    const out = {};
    const rest = Math.round(num(p.rest));
    if (rest > 0) out.rest = clamp(rest, 10, 900);
    const note = String(p.note ?? '').trim().slice(0, 300);
    if (note) out.note = note;
    return out;
  }

  function normHistory(list) {
    const out = [];
    for (const h of Array.isArray(list) ? list : []) {
      if (!isObj(h)) continue;
      const start = num(h.start);
      if (!start) continue;
      const exercises = [];
      for (const e of Array.isArray(h.exercises) ? h.exercises : []) {
        if (!isObj(e)) continue;
        const sets = [];
        for (const s of Array.isArray(e.sets) ? e.sets : []) {
          if (!isObj(s)) continue;
          const drops = normDrops(s.drops);
          sets.push({ kg: Math.max(0, num(s.kg)), reps: Math.max(0, num(s.reps)), pr: s.pr === true, ...(drops.length ? { drops } : {}) });
        }
        exercises.push({ id: String(e.id ?? '') || newId(), name: String(e.name ?? 'Übung'), cat: String(e.cat ?? ''), ...bwfField(e), sets });
      }
      const extra = {};
      if (h.planId) extra.planId = String(h.planId);
      if (h.planName) extra.planName = String(h.planName).slice(0, 40);
      if (num(h.bw) > 0) extra.bw = num(h.bw);
      out.push({ id: num(h.id) || start, start, end: num(h.end), ...extra, exercises });
    }
    return out.sort((a, b) => a.start - b.start);
  }

  function normSettings(s) {
    const d = { ...DEFAULT_SETTINGS };
    if (!isObj(s)) return d;
    const bool = (v, def) => (typeof v === 'boolean' ? v : def);
    d.rest = clamp(Math.round(num(s.rest)) || d.rest, 5, 3600);
    d.autoTimer = bool(s.autoTimer, d.autoTimer);
    d.sound = bool(s.sound, d.sound);
    d.vibrate = bool(s.vibrate, d.vibrate);
    d.tickBuzz = bool(s.tickBuzz, d.tickBuzz);
    d.keepAwake = bool(s.keepAwake, d.keepAwake);
    d.notifyEnd = bool(s.notifyEnd, d.notifyEnd);
    d.weeklyGoal = clamp(Math.round(num(s.weeklyGoal)) || d.weeklyGoal, 1, 7);
    d.trainDays = [...new Set((Array.isArray(s.trainDays) ? s.trainDays : []).map((x) => Math.round(num(x))).filter((x) => x >= 0 && x <= 6))].sort();
    d.trainTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s.trainTime || '')) ? s.trainTime : '';
    const known = new Map(HOME_SECTIONS);
    const home = (Array.isArray(s.home) ? s.home : []).filter((x) => isObj(x) && known.has(x.id));
    const ids = new Set(home.map((x) => x.id));
    d.home = [...home.map((x) => ({ id: x.id, on: x.on !== false })), ...defaultHome().filter((x) => !ids.has(x.id))];
    return d;
  }

  /** null = ungültig. */
  function parseBackup(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return null; }
    if (!isObj(obj)) return null;
    if (!Array.isArray(obj.plan) && !Array.isArray(obj.plans) && !Array.isArray(obj.history)) return null;
    const plans = normPlans(obj);
    return {
      plans,
      planId: plans.some((p) => p.id === obj.planId) ? obj.planId : plans[0].id,
      history: normHistory(obj.history),
      settings: normSettings(obj.settings),
      body: isObj(obj.body) ? normBody(obj.body) : null, // null = Backup ohne Körperdaten (z. B. Android)
    };
  }

  /** "plan" = gewählter Plan, damit die Android-App das Backup weiter lesen kann. */
  function makeBackup(data) {
    const active = data.plans.find((p) => p.id === data.planId) || data.plans[0];
    return {
      app: 'mirrafit', version: 2, exported: new Date().toISOString(),
      plan: active ? active.exercises : [], plans: data.plans, planId: data.planId,
      history: data.history, settings: data.settings, body: data.body,
    };
  }

  /** Gespeicherte Daten laden/reparieren (z. B. nach Update mit neuen Feldern). */
  function normalizeData(raw) {
    if (!isObj(raw)) return emptyData();
    const plans = normPlans(raw);
    const d = {
      plans,
      planId: plans.some((p) => p.id === raw.planId) ? raw.planId : plans[0].id,
      history: normHistory(raw.history),
      settings: normSettings(raw.settings),
      body: normBody(raw.body),
      session: null,
      timer: null,
    };
    if (isObj(raw.session) && num(raw.session.start) > 0 && Array.isArray(raw.session.exercises)) {
      d.session = {
        start: num(raw.session.start),
        ...(raw.session.planId ? { planId: String(raw.session.planId) } : {}),
        ...(raw.session.planName ? { planName: String(raw.session.planName) } : {}),
        exercises: raw.session.exercises.filter(isObj).map((e) => ({
          id: String(e.id ?? '') || newId(),
          name: String(e.name ?? 'Übung'),
          cat: String(e.cat ?? ''),
          reps: String(e.reps ?? ''),
          ...extraFields(e),
          ...bwfField(e),
          sets: (Array.isArray(e.sets) ? e.sets : []).filter(isObj).map((s) => ({
            kg: String(s.kg ?? ''), reps: String(s.reps ?? ''), done: s.done === true, pr: s.pr === true,
            drops: (Array.isArray(s.drops) ? s.drops : []).filter(isObj).map((x) => ({ kg: String(x.kg ?? ''), reps: String(x.reps ?? '') })),
          })),
        })),
      };
    }
    if (isObj(raw.timer) && num(raw.timer.end) > 0) d.timer = { end: num(raw.timer.end), total: Math.max(1, num(raw.timer.total) || 90) };
    return d;
  }

  return {
    APP_VERSION, DEFAULT_SETTINGS, DEFAULT_PLAN, defaultPlan, emptyData, clone,
    num, e1rm, fmt, plainNum, fmtVolume, fmtDuration, fmtClock, formatDate, formatTime, formatWeekLabel,
    monthLong, shortMonthName, longDate, dayOfMonth, firstNumber, newId,
    dayStart, addDays, weekStart, prevWeek, streakWeeks, relativeDay, historyGroup, fmtPercent, setLabel,
    lastSets, bestFor, sessionStats, histStats, topOfRange, suggestion, readyToProgress, knownExercises,
    exerciseSessions, muscleGroups, setsPerMuscle, workoutsPerDay,
    parseBackup, makeBackup, normalizeData, WD, recomputePrs, daysAgo,
    HOME_SECTIONS, defaultHome, LIBRARY, guessBwf, exBwf, load, setVolume, bwAt, latestBody, entryBw, navyBf, bmi,
    weekdayIdx, nextTrainDay, dropSuggestion, nextPlanId, newPlanId, numDrops, MAIN_PLAN, emptyBody,
  };
})();

if (typeof module !== 'undefined') module.exports = L;
