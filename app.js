/* MirraFit – Rendering, Ereignisse, Start (entspricht MirraFitApp.kt + MainActivity.kt) */
'use strict';

let deferredPrompt = null;
let wakeLock = null;

/* ---------- Rendering ---------- */
function appHtml() {
  const d = D();
  const live = S.tab === 'workout' && !!d.session;
  let content;
  if (S.tab === 'workout') content = workoutHtml();
  else if (S.tab === 'stats') content = statsHtml();
  else content = homeHtml();
  const showRest = !!d.timer || live;
  return `<div id="main"${live ? ' class="ns"' : ''}>${content}</div>
    <div id="bottom">${showRest ? restBarHtml() : ''}${navHtml()}</div>`;
}

function sheetFrame(content, scrimAction, anim) {
  return `<div class="scrim${anim ? ' anim' : ''}" data-a="${scrimAction}"></div>
    <div class="sheet${anim ? ' anim' : ''}" role="dialog" aria-modal="true"><div class="handle" aria-hidden="true"></div><div class="body">${content}</div></div>`;
}

function overlayHtml() {
  let h = '';
  if (S.sheet) {
    const t = S.sheet.type;
    const views = { plan: planSheet, plans: plansSheet, order: orderSheet, prefs: settingsSheet, form: formSheet, edit: editSheet, body: bodySheet, home: homeSheet, detail: detailSheet };
    const c = (views[t] || detailSheet)();
    h += sheetFrame(c, 'scrim', true);
  }
  if (S.summary) h += sheetFrame(summarySheet(), 'closeSummary', true);
  if (S.bigTimer && D().timer) h += bigTimerHtml();
  const c = S.confirm;
  if (c) {
    h += `<div class="dialog-wrap"><div class="scrim anim" data-a="confirmNo"></div>
      <div class="dialog" role="alertdialog"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>
      <div class="btns"><button class="no" data-a="confirmNo">Abbrechen</button><button class="${c.danger ? 'dng' : ''}" data-a="confirmYes">${esc(c.yes)}</button></div></div></div>`;
  }
  return h;
}

/* ---------- DOM-Abgleich statt Neuaufbau ----------
   Bestehende Elemente bleiben erhalten: Fokus, Scroll-Position und Tastatur bleiben stabil,
   CSS-Übergänge (Häkchen, Balken, Fortschritt) laufen sichtbar, kein Flackern. */
function sameNode(a, b) {
  return a.nodeType === b.nodeType && a.nodeName === b.nodeName && (a.nodeType !== 1 || (a.id || '') === (b.id || ''));
}
function morphNode(a, b) {
  if (a.nodeType !== 1) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  const keepChart = a.hasAttribute('data-chart') && a.getAttribute('data-chart') === b.getAttribute('data-chart') && !!a.querySelector('svg');
  for (const at of b.attributes) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
  if (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') {
    const v = a.tagName === 'TEXTAREA' ? b.value : (b.getAttribute('value') || '');
    if (a.value !== v) a.value = v;
    return;
  }
  if (keepChart) return;
  morphChildren(a, b);
}
function morphChildren(a, b) {
  let ac = a.firstChild;
  let bc = b.firstChild;
  while (bc) {
    const next = bc.nextSibling;
    if (ac && sameNode(ac, bc)) { morphNode(ac, bc); ac = ac.nextSibling; }
    else {
      const m = bc.nodeType === 1 && bc.id ? document.getElementById(bc.id) : null;
      if (m && m.parentNode === a && sameNode(m, bc)) { a.insertBefore(m, ac); morphNode(m, bc); }
      else a.insertBefore(bc, ac);
    }
    bc = next;
  }
  while (ac) { const n = ac.nextSibling; a.removeChild(ac); ac = n; }
}
function morphInto(parent, html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  morphChildren(parent, tpl.content);
}

let prevSheetKey = '';
function sheetKey() {
  if (S.summary) return 'summary';
  if (!S.sheet) return '';
  return S.sheet.type + (S.sheet.exId || '') + (S.sheet.planId || '');
}

function renderAll() {
  const app = $('#app');
  if (!app) return;
  S.now = Date.now();

  // Zustand der Oberfläche merken
  const ae = document.activeElement;
  const focusId = ae && ae.tagName === 'INPUT' && ae.id ? ae.id : null;
  const sel = focusId ? [ae.selectionStart, ae.selectionEnd] : null;
  const keepScroll = !S.resetScroll;
  const sc = {
    main: $('#main') ? $('#main').scrollTop : 0,
    wk: $('#wkList') ? $('#wkList').scrollTop : 0,
    sheet: $('.sheet .body') ? $('.sheet .body').scrollTop : 0,
  };
  const key = sheetKey();
  const sameSheet = key === prevSheetKey;

  morphInto(app, appHtml());
  morphInto($('#overlay'), overlayHtml());
  S.anim = {};
  prevSheetKey = key;

  if (keepScroll) {
    if ($('#main') && $('#main').scrollTop !== sc.main) $('#main').scrollTop = sc.main;
    if ($('#wkList') && $('#wkList').scrollTop !== sc.wk) $('#wkList').scrollTop = sc.wk;
  } else {
    if ($('#main')) $('#main').scrollTop = 0;
    if ($('#wkList')) $('#wkList').scrollTop = 0;
  }
  S.resetScroll = false;
  if ($('.sheet .body')) { if (sameSheet) { if ($('.sheet .body').scrollTop !== sc.sheet) $('.sheet .body').scrollTop = sc.sheet; } else $('.sheet .body').scrollTop = 0; }
  const bottom = $('#bottom');
  if (bottom && bottom.offsetHeight) document.documentElement.style.setProperty('--bottom-h', bottom.offsetHeight + 'px');

  if (focusId && document.activeElement !== document.getElementById(focusId)) {
    const el = document.getElementById(focusId);
    if (el) {
      try { el.focus({ preventScroll: true }); if (sel && sel[0] != null) el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* egal */ }
    }
  }

  // Zur nächsten Übung gleiten, wenn die aktuelle fertig ist
  const s = D().session;
  if (s) {
    const cur = s.exercises.findIndex((e) => e.sets.some((x) => !x.done));
    if (S.tab === 'workout' && cur > S.lastCurrent && cur >= 0) {
      const wk = $('#wkList');
      const card = document.getElementById('exc-' + cur);
      if (wk && card) wk.scrollTo({ top: card.getBoundingClientRect().top - wk.getBoundingClientRect().top + wk.scrollTop - 6, behavior: 'smooth' });
    }
    S.lastCurrent = cur;
  } else S.lastCurrent = -1;

  drawCharts();
  syncWake();
  if (hasBackAction()) ensureSentinel();
}

/* Laufende Anzeigen ohne Neuaufbau aktualisieren (Uhr, Pausen-Timer) */
function updateLive() {
  const s = D().session;
  if (s) document.querySelectorAll('[data-clock]').forEach((el) => { el.textContent = L.fmtClock((S.now - s.start) / 1000); });
  const t = D().timer;
  if (t) {
    const remMs = Math.max(0, t.end - S.now);
    const remSec = Math.floor((remMs + 999) / 1000);
    const tm = $('#rb-time');
    if (tm) { tm.textContent = timeText(remSec); tm.classList.toggle('ending', remSec >= 1 && remSec <= 5); }
    const bt = $('#bt-time');
    if (bt) { bt.textContent = timeText(remSec); bt.classList.toggle('ending', remSec <= 5); }
    const ring = $('#bt-ring');
    if (ring) ring.setAttribute('stroke-dashoffset', String(RING_C * (1 - (t.total > 0 ? Math.min(1, remMs / 1000 / t.total) : 0))));
    const pg = $('#rb-prog');
    if (pg) pg.style.width = (t.total > 0 ? Math.min(100, Math.max(0, (remMs / 1000 / t.total) * 100)) : 0) + '%';
  }
}

/* ---------- Bildschirm anlassen ---------- */
async function syncWake() {
  const want = !!D().session && D().settings.keepAwake && document.visibilityState === 'visible';
  try {
    if (want && !wakeLock && navigator.wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!want && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (e) { wakeLock = null; }
}

/* ---------- Zurück-Taste (System) ---------- */
const hasBackAction = () => !!(S.confirm || S.bigTimer || S.sheet || S.summary || S.tab !== 'home');
function ensureSentinel() {
  if (history.state && history.state.root) history.pushState({ app: 1 }, '');
}
function doBack() {
  if (S.confirm) S.confirm = null;
  else if (S.bigTimer) S.bigTimer = false;
  else if (S.sheet && S.sheet.type === 'plan' && S.sheet.from === 'plans') S.sheet = { type: 'plans' };
  else if (S.sheet && S.sheet.type === 'form') { afterForm(); return; }
  else if (S.summary) S.summary = null;
  else if (S.sheet) { S.sheet = null; S.form = null; }
  else if (S.tab !== 'home') { S.tab = 'home'; S.resetScroll = true; S.menu = null; }
  renderAll();
}
window.addEventListener('popstate', () => { if (hasBackAction()) doBack(); });

/* ---------- Navigation & Sheets ---------- */
function setTab(t) { S.tab = t; S.resetScroll = true; S.menu = null; S.setMenu = null; renderAll(); }
function openSheet(sh) {
  S.sheet = sh;
  renderAll();
}
function closeSheet() { S.sheet = null; S.form = null; S.edit = null; S.body = null; renderAll(); }
function ask(c) { S.confirm = c; renderAll(); }

const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const isoOf = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const emptyBodyForm = () => ({ id: 0, ts: 0, date: todayIso(), weight: '', mode: 'enter', kfa: '', waist: '', neck: '', hip: '' });
function openBody() {
  if (!S.body) S.body = emptyBodyForm();
  openSheet({ type: 'body' });
}

function openPlanEditor(planId, from) {
  openSheet({ type: 'plan', planId, from: from || null });
}

function openForm(mode, idx) {
  const planId = S.sheet && S.sheet.type === 'plan' ? S.sheet.planId : D().planId;
  const from = S.sheet && S.sheet.type === 'plan' ? S.sheet.from : null;
  const plan = planById(planId) || P();
  const init = mode === 'PLAN_EDIT' ? plan.exercises[idx] : null;
  S.form = {
    mode, idx, planId: plan.id, from,
    name: init ? init.name : '', cat: init ? init.cat : '', sets: init ? init.sets : 3, reps: init ? init.reps : '10-12',
    rest: init && init.rest ? init.rest : 0, note: init && init.note ? init.note : '', bwf: init ? L.exBwf(init) : 0,
    alsoPlan: true, reuse: null, reuseSrc: null,
  };
  openSheet({ type: 'form' });
}
function afterForm() {
  const f = S.form;
  S.form = null;
  if (!f || f.mode === 'SESSION_ADD') S.sheet = null; else S.sheet = { type: 'plan', planId: f.planId, from: f.from };
  renderAll();
}

/* ---------- Aktionen (data-a) ---------- */
const num0 = (v) => Number(v);
const blur = () => { const a = document.activeElement; if (a && a.blur && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) a.blur(); };
const sheetPlanId = () => (S.sheet && S.sheet.planId) || D().planId;

const ACT = {
  tab: (el) => setTab(el.dataset.v),
  start: () => { if (startSession()) setTab('workout'); else openPlanEditor(D().planId); },
  startWorkout: () => { if (!startSession()) openPlanEditor(D().planId); },
  continue: () => setTab('workout'),
  editPlan: () => openPlanEditor(D().planId),
  settings: () => openSheet({ type: 'prefs' }),
  openEx: (el) => { S.detailMetric = 0; openSheet({ type: 'detail', exId: el.dataset.id }); },
  closeSheet: () => closeSheet(),
  scrim: () => closeSheet(),
  closeSummary: () => { S.summary = null; renderAll(); },
  togglePlan: () => { S.showAllPlan = !S.showAllPlan; renderAll(); },
  histToggle: (el) => { const id = num0(el.dataset.id); if (S.histOpen.has(id)) S.histOpen.delete(id); else S.histOpen.add(id); renderAll(); },
  histFilter: (el) => { S.histFilter = el.dataset.v; renderAll(); },
  deleteHistory: (el) => { S.histOpen.delete(num0(el.dataset.id)); deleteHistory(num0(el.dataset.id)); },
  snoozeBackup: () => { lsSet('mirrafit.backupSnooze', String(Date.now() + 7 * 86400000)); renderAll(); },
  exportBackup: () => downloadBackup(),
  shareBackup: () => shareBackup(),
  importBackup: () => { const f = $('#file'); if (f) f.click(); },

  /* Pläne */
  pickPlan: (el) => selectPlan(el.dataset.id),
  openPlans: () => openSheet({ type: 'plans' }),
  editPlanId: (el) => openPlanEditor(el.dataset.id, 'plans'),
  newPlan: () => { const id = createPlan(); openPlanEditor(id, 'plans'); setTimeout(() => { const i = $('#plan-name'); if (i) { i.focus(); i.select(); } }, 320); },
  dupPlan: (el) => { duplicatePlan(el.dataset.id); },
  delPlan: (el) => {
    const p = planById(el.dataset.id);
    if (!p) return;
    ask({ title: 'Plan löschen', text: `„${p.name}“ löschen? Dein Verlauf bleibt erhalten.`, yes: 'Löschen', danger: true, onYes: () => deletePlan(p.id) });
  },
  planDone: () => { blur(); if (S.sheet && S.sheet.from === 'plans') openSheet({ type: 'plans' }); else closeSheet(); },

  /* Training */
  toggleSet: (el) => { blur(); toggleSet(num0(el.dataset.ei), num0(el.dataset.si)); },
  step: (el) => stepField(num0(el.dataset.ei), num0(el.dataset.si), el.dataset.kg === '1', num0(el.dataset.d)),
  toggleOpen: (el) => { const id = el.dataset.id; S.expanded[id] = !(S.expanded[id] === true); renderAll(); },
  exMove: (el) => moveSessionEx(num0(el.dataset.ei), num0(el.dataset.dir)),
  menu: (el) => { const ei = num0(el.dataset.ei); S.setMenu = null; S.menu = S.menu === ei ? null : ei; renderAll(); },
  menuAddSet: (el) => { S.menu = null; changeSets(num0(el.dataset.ei), 1); },
  menuDrop: (el) => {
    S.menu = null;
    const ei = num0(el.dataset.ei);
    const ex = D().session && D().session.exercises[ei];
    if (!ex) return;
    let si = ex.sets.findIndex((x) => !x.done);
    if (si < 0) si = ex.sets.length - 1;
    if (si > 0 && !ex.sets[si].kg && !ex.sets[si].reps && ex.sets[si - 1].done) si -= 1; // gerade erledigten Satz erweitern
    addDrop(ei, si);
  },
  setMenu: (el) => { S.menu = null; S.setMenu = S.setMenu === el.dataset.k ? null : el.dataset.k; renderAll(); },
  addDrop: (el) => addDrop(num0(el.dataset.ei), num0(el.dataset.si)),
  removeDrop: (el) => removeDrop(num0(el.dataset.ei), num0(el.dataset.si), num0(el.dataset.di)),
  removeSet: (el) => removeSet(num0(el.dataset.ei), num0(el.dataset.si)),
  skipEx: (el) => { S.menu = null; skipExercise(num0(el.dataset.ei)); },
  addSet: (el) => changeSets(num0(el.dataset.ei), 1),
  delSet: (el) => changeSets(num0(el.dataset.ei), -1),
  addSessionEx: () => openForm('SESSION_ADD', -1),
  openOrder: () => openSheet({ type: 'order' }),
  finish: () => {
    const s = D().session;
    if (!s) return;
    const total = s.exercises.reduce((a, e) => a + e.sets.length, 0);
    const doneN = s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
    const open = total - doneN;
    if (doneN === 0) {
      ask({ title: 'Training verwerfen', text: 'Noch kein Satz abgehakt. Training verwerfen?', yes: 'Verwerfen', danger: true, onYes: () => { discardSession(); setTab('home'); } });
    } else {
      ask({
        title: 'Training beenden',
        text: open > 0 ? `Noch ${open} offene ${open === 1 ? 'Satz' : 'Sätze'}. Trotzdem beenden und speichern?` : 'Alles erledigt. Training beenden und speichern?',
        yes: 'Speichern',
        onYes: () => { S.tab = 'home'; S.resetScroll = true; finishSession(); },
      });
    }
  },
  discard: () => ask({ title: 'Training verwerfen', text: 'Alle Eingaben dieser Einheit gehen verloren.', yes: 'Verwerfen', danger: true, onYes: () => { discardSession(); setTab('home'); } }),

  /* Timer */
  startTimer: (el) => startTimer(num0(el.dataset.v)),
  addTime: (el) => addTime(num0(el.dataset.v)),
  stopTimer: () => { S.bigTimer = false; stopTimer(); },
  bigTimer: () => { S.bigTimer = true; renderAll(); },
  bigTimerClose: () => { S.bigTimer = false; renderAll(); },
  bigTimerBg: (el, e) => { if (e.target === el) { S.bigTimer = false; renderAll(); } },

  /* Übungen im Plan */
  planMove: (el) => movePlan(sheetPlanId(), num0(el.dataset.i), num0(el.dataset.dir)),
  planDel: (el) => removePlanEx(sheetPlanId(), num0(el.dataset.i)),
  planEdit: (el) => openForm('PLAN_EDIT', num0(el.dataset.i)),
  planAdd: () => openForm('PLAN_ADD', -1),
  planReset: () => ask({ title: 'Standard-Übungen', text: 'Die Übungen dieses Plans auf den Standard zurücksetzen? Dein Verlauf bleibt erhalten.', yes: 'Zurücksetzen', onYes: () => resetPlanEx(sheetPlanId()) }),
  sessMove: (el) => moveSessionEx(num0(el.dataset.i), num0(el.dataset.dir)),
  orderLikePlan: () => sessionOrderLikePlan(),

  /* Formular */
  formReuse: (el) => {
    const f = S.form;
    if (f.reuse && f.reuse.id === el.dataset.id) { f.reuse = null; f.reuseSrc = null; renderAll(); return; }
    const src = el.dataset.src;
    const k = src === 'lib' ? L.LIBRARY.find((x) => x.id === el.dataset.id) : L.knownExercises(allPlanExercises(), D().history).find((x) => x.id === el.dataset.id);
    if (k) {
      const p = allPlanExercises().find((x) => x.id === k.id);
      f.reuse = k; f.reuseSrc = src; f.name = k.name; f.cat = k.cat; f.reps = k.reps; f.sets = k.sets;
      f.bwf = typeof k.bwf === 'number' ? k.bwf : L.guessBwf(k.name);
      if (p) { f.rest = p.rest || 0; f.note = p.note || ''; f.bwf = L.exBwf(p); }
    }
    renderAll();
  },
  formCat: (el) => { S.form.cat = el.dataset.v; renderAll(); },
  formPreset: (el) => { S.form.reps = el.dataset.v; renderAll(); },
  formSets: (el) => { S.form.sets = Math.min(10, Math.max(1, S.form.sets + num0(el.dataset.v))); renderAll(); },
  formRestMode: (el) => { S.form.rest = num0(el.dataset.v) ? (S.form.rest || D().settings.rest) : 0; renderAll(); },
  formRest: (el) => { S.form.rest = Math.min(900, Math.max(15, S.form.rest + num0(el.dataset.v))); renderAll(); },
  formBwf: (el) => { S.form.bwf = num0(el.dataset.v); renderAll(); },
  formCancel: () => afterForm(),
  formSave: () => { blur(); if (saveExercise(S.form)) afterForm(); },

  /* Einheit bearbeiten */
  editHistory: (el) => {
    const h = D().history.find((x) => x.id === num0(el.dataset.id));
    if (!h) return;
    const str = (x) => ({ kg: x.kg > 0 ? L.plainNum(x.kg) : '', reps: L.plainNum(x.reps) });
    S.edit = { id: h.id, exercises: h.exercises.map((e) => ({ id: e.id, name: e.name, cat: e.cat, ...(typeof e.bwf === 'number' ? { bwf: e.bwf } : {}), sets: e.sets.map((x) => ({ ...str(x), drops: (x.drops || []).map(str) })) })) };
    openSheet({ type: 'edit' });
  },
  editDelSet: (el) => { const e = S.edit.exercises[num0(el.dataset.ei)]; e.sets.splice(num0(el.dataset.si), 1); if (!e.sets.length) S.edit.exercises.splice(num0(el.dataset.ei), 1); renderAll(); },
  editDelDrop: (el) => { const st = S.edit.exercises[num0(el.dataset.ei)].sets[num0(el.dataset.si)]; st.drops.splice(num0(el.dataset.di), 1); renderAll(); },
  editAddSet: (el) => { const e = S.edit.exercises[num0(el.dataset.ei)]; const last = e.sets[e.sets.length - 1]; e.sets.push(last ? { kg: last.kg, reps: last.reps, drops: [] } : { kg: '', reps: '', drops: [] }); renderAll(); },
  editDelEx: (el) => { S.edit.exercises.splice(num0(el.dataset.ei), 1); renderAll(); },
  editSave: () => { blur(); if (saveHistoryEdit(S.edit)) closeSheet(); },

  /* Körperdaten */
  openBody: () => openBody(),
  bodySex: (el) => { setBodyProfile('sex', el.dataset.v); renderAll(); },
  bodyMode: (el) => { S.body.mode = el.dataset.v; renderAll(); },
  bodyMetric: (el) => { S.bodyMetric = num0(el.dataset.v); renderAll(); },
  bodySave: () => { blur(); if (saveBodyEntry(S.body)) { S.body = emptyBodyForm(); renderAll(); } },
  bodyNew: () => { S.body = emptyBodyForm(); renderAll(); },
  bodyEdit: (el) => {
    const e = D().body.entries.find((x) => x.id === num0(el.dataset.id));
    if (!e) return;
    const s2 = (v) => (v > 0 ? L.plainNum(v) : '');
    S.body = { id: e.id, ts: e.ts, date: isoOf(e.ts), weight: s2(e.weight), mode: e.waist ? 'calc' : 'enter', kfa: s2(e.kfa), waist: s2(e.waist), neck: s2(e.neck), hip: s2(e.hip) };
    renderAll();
    const sb = $('.sheet .body'); const tgt = $('#b-weight');
    if (sb && tgt) sb.scrollTo({ top: tgt.getBoundingClientRect().top - sb.getBoundingClientRect().top + sb.scrollTop - 120, behavior: 'smooth' });
  },
  bodyDel: (el) => { deleteBodyEntry(num0(el.dataset.id)); },

  /* Startseite */
  openHome: () => openSheet({ type: 'home' }),
  homeToggle: (el) => toggleHome(el.dataset.id),
  homeMove: (el) => moveHome(num0(el.dataset.i), num0(el.dataset.dir)),
  homeReset: () => { D().settings.home = L.defaultHome(); commit(); },

  /* Einstellungen */
  setRest: (el) => setSetting('rest', num0(el.dataset.v)),
  restStep: (el) => setSetting('rest', Math.min(900, Math.max(15, D().settings.rest + num0(el.dataset.v)))),
  setGoal: (el) => setSetting('weeklyGoal', num0(el.dataset.v)),
  trainDay: (el) => toggleTrainDay(num0(el.dataset.v)),
  clearTrainTime: () => setSetting('trainTime', ''),
  toggleSetting: (el) => {
    const k = el.dataset.k;
    if (k === '_alsoPlan') { S.form.alsoPlan = !S.form.alsoPlan; renderAll(); return; }
    const cur = D().settings[k];
    if (k === 'notifyEnd' && !cur) {
      if (!('Notification' in window)) { showToast('Benachrichtigungen werden hier nicht unterstützt'); return; }
      Notification.requestPermission().then((p) => {
        if (p === 'granted') setSetting('notifyEnd', true);
        else { showToast('Benachrichtigungen sind nicht erlaubt'); renderAll(); }
      });
      return;
    }
    setSetting(k, !cur);
  },
  testFeedback: () => { Feedback.unlock(); testFeedback(); },
  wipe: () => ask({
    title: 'Alle Daten löschen',
    text: 'Wirklich alle Daten löschen (Pläne, Verlauf, Körperdaten)? Sichere vorher ein Backup.',
    yes: 'Löschen', danger: true,
    onYes: () => { S.sheet = null; S.form = null; wipeAll(); setTab('home'); },
  }),
  install: async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) { /* egal */ }
    deferredPrompt = null;
    renderAll();
  },

  /* Auswertung */
  statsMode: (el) => { S.statsMode = num0(el.dataset.v); renderAll(); },
  statsPlan: (el) => { S.statsPlan = el.dataset.v; renderAll(); },
  detailMetric: (el) => { S.detailMetric = num0(el.dataset.v); renderAll(); },

  /* Dialog & Toast */
  confirmYes: () => { const c = S.confirm; S.confirm = null; renderAll(); if (c) c.onYes(); },
  confirmNo: () => { S.confirm = null; renderAll(); },
  toastAction: () => { const t = S.toast; if (!t) return; clearToast(t.id); if (t.action) t.action(); },
};

/* ---------- Ereignisse ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  if ((S.menu !== null || S.setMenu !== null) && !t.closest('.menu-wrap')) { S.menu = null; S.setMenu = null; renderAll(); }
  const el = t.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = ACT[el.dataset.a];
  if (f) f(el, e);
});

/** Vorschläge (Platzhalter) der Dropsätze nachziehen, während getippt wird – ohne Neuaufbau. */
function refreshDropHints(ei, si) {
  const ex = D().session && D().session.exercises[ei];
  const set = ex && ex.sets[si];
  if (!set || !set.drops) return;
  set.drops.forEach((_, di) => {
    const ds = dropSug(ex, si, di);
    const k = document.getElementById(`d-${ei}-${si}-${di}-kg`);
    const r = document.getElementById(`d-${ei}-${si}-${di}-reps`);
    if (k) k.placeholder = ds[0] || 'kg';
    if (r) r.placeholder = ds[1] || '–';
  });
}

document.addEventListener('input', (e) => {
  const el = e.target;
  const kind = el.dataset && el.dataset.in;
  if (kind === 'field') {
    let v = el.value;
    const clean = v.replace(/[^0-9.,]/g, '');
    if (clean !== v) { el.value = clean; v = clean; }
    setField(num0(el.dataset.ei), num0(el.dataset.si), el.dataset.kg === '1', v);
    refreshDropHints(num0(el.dataset.ei), num0(el.dataset.si));
  } else if (kind === 'drop') {
    const clean = el.value.replace(/[^0-9.,]/g, '');
    if (clean !== el.value) el.value = clean;
    setDropField(num0(el.dataset.ei), num0(el.dataset.si), num0(el.dataset.di), el.dataset.kg === '1', clean);
    refreshDropHints(num0(el.dataset.ei), num0(el.dataset.si));
  } else if (kind === 'editDrop' && S.edit) {
    const clean = el.value.replace(/[^0-9.,]/g, '');
    if (clean !== el.value) el.value = clean;
    const dr = S.edit.exercises[num0(el.dataset.ei)].sets[num0(el.dataset.si)].drops[num0(el.dataset.di)];
    if (el.dataset.kg === '1') dr.kg = clean; else dr.reps = clean;
  } else if (kind === 'planName') {
    renamePlan(sheetPlanId(), el.value);
  } else if (kind === 'body' && S.body) {
    S.body[el.dataset.k] = el.dataset.k === 'date' ? el.value : el.value.replace(/[^0-9.,]/g, '');
    if (el.dataset.k !== 'date' && el.value !== S.body[el.dataset.k]) el.value = S.body[el.dataset.k];
    const live = $('#bf-live');
    if (live) live.innerHTML = bodyLive();
  } else if (kind === 'bodyProfile') {
    const clean = el.value.replace(/[^0-9.,]/g, '');
    if (clean !== el.value) el.value = clean;
    setBodyProfile('height', clean);
    const live = $('#bf-live');
    if (live) live.innerHTML = bodyLive();
  } else if (kind === 'trainTime') {
    D().settings.trainTime = /^\d\d:\d\d$/.test(el.value) ? el.value : '';
    commit(false);
  } else if (kind === 'edit' && S.edit) {
    const clean = el.value.replace(/[^0-9.,]/g, '');
    if (clean !== el.value) el.value = clean;
    const st = S.edit.exercises[num0(el.dataset.ei)].sets[num0(el.dataset.si)];
    if (el.dataset.kg === '1') st.kg = clean; else st.reps = clean;
  } else if (kind === 'form' && S.form) {
    const k = el.dataset.k;
    S.form[k] = el.value;
    if (k === 'name') {
      if (S.form.reuse && el.value.trim() !== S.form.reuse.name) S.form.reuse = null;
      $('#f-known').innerHTML = formKnownHtml();
      $('#f-reuse').innerHTML = formReuseHtml();
    } else if (k === 'cat') $('#f-cats').innerHTML = formCatsHtml();
    else if (k === 'reps') $('#f-presets').innerHTML = formPresetsHtml();
    // note: nur speichern, kein Neuaufbau nötig
  }
});

document.addEventListener('change', (e) => {
  const k = e.target.dataset && e.target.dataset.in;
  if (k === 'planName' || k === 'bodyProfile' || k === 'trainTime') renderAll();
});

document.addEventListener('keydown', (e) => {
  const el = e.target;
  if (e.key !== 'Enter' || !el.dataset || el.dataset.in !== 'field') return;
  e.preventDefault();
  const ei = num0(el.dataset.ei);
  const si = num0(el.dataset.si);
  if (el.dataset.enter === '1') {
    blur();
    const set = D().session && D().session.exercises[ei] && D().session.exercises[ei].sets[si];
    if (set && !set.done) toggleSet(ei, si);
  } else {
    const next = document.getElementById(`f-${ei}-${si}-reps`);
    if (next) next.focus();
  }
});

/* Sortieren per Ziehen (Plan & Reihenfolge) und Sheet nach unten wischen */
let drag = null;
let sheetDrag = null;

function refreshRows(list) {
  const rows = [...list.children];
  rows.forEach((r, i) => {
    const rn = r.querySelector('.rn');
    if (rn) rn.textContent = i + 1;
    r.querySelectorAll('[data-i]').forEach((x) => { x.dataset.i = i; });
    r.querySelectorAll('[data-dir]').forEach((b) => { const dir = num0(b.dataset.dir); b.disabled = dir < 0 ? i === 0 : i === rows.length - 1; });
  });
}

document.addEventListener('pointerdown', (e) => {
  Feedback.unlock();
  const grip = e.target.closest('[data-grip]');
  if (grip) {
    e.preventDefault();
    const row = grip.closest('.rrow');
    const list = row.parentElement;
    drag = { row, list, name: list.dataset.list, last: e.clientY, offset: 0, rowH: row.offsetHeight || 64 };
    row.classList.add('drag');
    try { grip.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    if (D().settings.vibrate) Feedback.buzz(12);
    return;
  }
  const hd = e.target.closest('.sheet .handle');
  if (hd) {
    const sheet = hd.closest('.sheet');
    sheet.style.animation = 'none';
    sheetDrag = { sheet, y0: e.clientY, dy: 0 };
    try { hd.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
  }
});

document.addEventListener('pointermove', (e) => {
  if (drag) {
    e.preventDefault();
    drag.offset += e.clientY - drag.last;
    drag.last = e.clientY;
    const rows = [...drag.list.children];
    const from = rows.indexOf(drag.row);
    const to = Math.min(rows.length - 1, Math.max(0, from + Math.round(drag.offset / drag.rowH)));
    if (to !== from) {
      if (drag.name === 'plan') movePlanTo(drag.list.dataset.plan, from, to, false); else moveSessionExTo(from, to, false);
      drag.list.insertBefore(drag.row, to > from ? rows[to].nextSibling : rows[to]);
      refreshRows(drag.list);
      drag.offset -= (to - from) * drag.rowH;
      if (D().settings.vibrate) Feedback.buzz(6);
    }
    drag.row.style.transform = `translateY(${drag.offset}px)`;
  } else if (sheetDrag) {
    sheetDrag.dy = Math.max(0, e.clientY - sheetDrag.y0);
    sheetDrag.sheet.style.transform = `translateY(${sheetDrag.dy}px)`;
  }
});

function endDrag() {
  if (drag) {
    drag.row.style.transform = '';
    drag.row.classList.remove('drag');
    drag = null;
    renderAll();
  } else if (sheetDrag) {
    const { sheet, dy } = sheetDrag;
    sheetDrag = null;
    if (dy > 110) { if (S.summary) { S.summary = null; renderAll(); } else closeSheet(); } else { sheet.style.transition = 'transform .2s'; sheet.style.transform = ''; }
  }
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

/* Tastatur offen? Dann untere Leisten ausblenden */
let maxH = window.innerHeight;
let lastW = window.innerWidth;
function kbCheck() {
  if (window.innerWidth !== lastW) { lastW = window.innerWidth; maxH = window.innerHeight; }
  maxH = Math.max(maxH, window.innerHeight);
  const a = document.activeElement;
  const typing = !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
  const vv = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.body.classList.toggle('kb', typing && maxH - vv > 150);
}
document.addEventListener('focusin', kbCheck);
document.addEventListener('focusout', () => setTimeout(kbCheck, 60));
window.addEventListener('resize', kbCheck);
if (window.visualViewport) window.visualViewport.addEventListener('resize', kbCheck);

/* Backup laden */
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'file') return;
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  let text = '';
  try { text = await file.text(); } catch (err) { showToast('Ungültige Backup-Datei'); return; }
  const backup = L.parseBackup(text);
  if (!backup) { showToast('Ungültige Backup-Datei'); return; }
  ask({
    title: 'Backup importieren',
    text: `Backup mit ${backup.history.length} Einheiten und ${backup.plans.length === 1 ? backup.plans[0].exercises.length + ' Plan-Übungen' : backup.plans.length + ' Plänen'} importieren? Aktuelle Daten werden ersetzt${backup.body ? '' : ' (deine Körperdaten bleiben erhalten)'}.`,
    yes: 'Importieren',
    onYes: () => applyBackup(backup),
  });
});

/* ---------- Timer-Schleife ---------- */
function onTimerEnd(t) {
  const late = S.now - t.end;
  const st = D().settings;
  if (late < 5000) {
    if (st.vibrate) Feedback.buzz([400, 150, 400]);
    if (st.sound) Feedback.beep();
  }
  if (document.hidden && late < 120000 && st.notifyEnd) Feedback.notify('Pause vorbei', 'Nächster Satz!');
  lastTick = -1;
  D().timer = null;
  S.bigTimer = false;
  commit();
  showToast('Pause vorbei – nächster Satz!');
}

function tickLoop() {
  S.now = Date.now();
  updateLive();
  const t = D().timer;
  if (t) {
    // Countdown-Ticks in den letzten drei Sekunden
    const remaining = Math.floor((t.end - S.now + 999) / 1000);
    if (remaining >= 1 && remaining <= 3 && remaining !== lastTick) {
      lastTick = remaining;
      if (D().settings.tickBuzz) buzz(18);
    }
    if (S.now >= t.end) onTimerEnd(t);
  }
  setTimeout(tickLoop, D().timer ? 250 : 1000);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    S.now = Date.now();
    syncWake();
    updateLive();
  } else saveData();
});

window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY || !e.newValue) return;
  try { S.data = L.normalizeData(JSON.parse(e.newValue)); renderAll(); } catch (err) { /* egal */ }
});

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (S.sheet && S.sheet.type === 'prefs') renderAll(); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; showToast('MirraFit ist installiert ✓'); if (S.sheet && S.sheet.type === 'prefs') renderAll(); });

/* ---------- Erinnerung beim Öffnen (einmal pro Tag) ---------- */
function remindToday() {
  const st = D().settings;
  const today = L.dayStart(Date.now());
  if (!st.trainDays.includes(L.weekdayIdx(today)) || D().session) return;
  if (D().history.some((h) => L.dayStart(h.start) === today)) return;
  if (Number(lsGet('mirrafit.remindedDay') || 0) === today) return;
  lsSet('mirrafit.remindedDay', String(today));
  setTimeout(() => showToast(`Heute ist Trainingstag${st.trainTime ? ' · ' + st.trainTime + ' Uhr' : ''} – ${P().name} ist dran 💪`, { actionLabel: 'Starten', action: () => { if (startSession()) setTab('workout'); } }), 700);
}

/* ---------- Start ---------- */
function init() {
  S.data = initialData();
  S.spruch = pick(SPRUECHE);
  S.tab = S.data.session ? 'workout' : 'home';
  history.replaceState({ root: 1 }, '');

  // Verknüpfung "Training starten" (Home-Bildschirm-Shortcut)
  try {
    const p = new URLSearchParams(location.search);
    if (p.get('start') === '1') {
      if (!S.data.session && P().exercises.length) startSession();
      if (S.data.session) S.tab = 'workout';
      history.replaceState({ root: 1 }, '', location.pathname);
    }
  } catch (e) { /* egal */ }

  renderAll();
  tickLoop();
  remindToday();

  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      showToast('Neue Version von MirraFit ist da', { actionLabel: 'Neu laden', action: () => { reloading = true; location.reload(); } });
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then((r) => r.update()).catch(() => { /* egal */ }));
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then((p) => { if (!p && S.data.history.length) navigator.storage.persist(); }); } catch (e) { /* egal */ }
}
init();
