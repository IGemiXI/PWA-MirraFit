/* MirraFit – Oberflächen als HTML-Strings */
'use strict';

/* =========================================================
   Bausteine
   ========================================================= */
function stat(value, label, o = {}) {
  const size = o.size || 30;
  return `<div class="stat${o.cls ? ' ' + o.cls : ''}"><div class="v" style="font-size:${size}px${o.color ? ';color:' + o.color : ''}">${value}${o.unit ? `<span class="u">${o.unit}</span>` : ''}</div><div class="l">${label}</div></div>`;
}
const iconLabel = (icon, text, tint, textColor) =>
  `<div class="icon-label"${textColor ? ` style="color:${textColor}"` : ''}>${ic(icon, 17, '')}<span>${text}</span></div>`.replace('<svg', `<svg style="${tint ? 'color:' + tint : ''}"`);
const iconBtn = (icon, label, action, o = {}) =>
  `<button class="icon-btn${o.cls ? ' ' + o.cls : ''}" aria-label="${esc(label)}" data-a="${action}"${o.attrs || ''}${o.disabled ? ' disabled' : ''}>${ic(icon, o.iconSize || 21)}</button>`;
const primaryBtn = (text, action, icon, attrs = '') => `<button class="btn-primary" data-a="${action}"${attrs}>${icon ? ic(icon, 22) : ''}<span>${text}</span></button>`;
const secBtn = (text, action, icon, o = {}) =>
  `<button class="btn-secondary${o.danger ? ' danger' : ''}${o.cls ? ' ' + o.cls : ''}" data-a="${action}"${o.attrs || ''}>${icon ? ic(icon, 19) : ''}<span>${text}</span></button>`;
const sectionHeader = (title, o = {}) =>
  `<div class="section-header"><div class="t">${title}</div>${o.trailing || ''}${o.action ? `<button class="link-btn" data-a="${o.action}"${o.attrs || ''}>${o.actionLabel}</button>` : ''}</div>`;
const screenTitle = (title, sub, trailing) =>
  `<div class="screen-title"><div class="t"><h1>${esc(title)}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>${trailing || ''}</div>`;
const seg = (options, selected, action, attrs = '') =>
  `<div class="seg">${options.map(([label, v]) => `<button class="${v === selected ? 'on' : ''}" data-a="${action}" data-v="${v}"${attrs}>${esc(label)}</button>`).join('')}</div>`;
const toggleRow = (label, on, key, hint) =>
  `<div class="toggle" data-a="toggleSetting" data-k="${key}" role="switch" aria-checked="${on}"><div class="tx">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</div><div class="sw${on ? ' on' : ''}"></div></div>`;
const sheetTitle = (t, sub) => `<div class="sheet-title"><h2>${esc(t)}</h2>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
const progress = (frac, cls = '', id = '') => `<div class="progress ${cls}"><i${id ? ` id="${id}"` : ''} style="width:${Math.round(Math.min(1, Math.max(0, frac)) * 1000) / 10}%"></i></div>`;
/** −/Wert/+ Regler. */
const stepper = (label, action, step, attrs = '', o = {}) =>
  `<div class="stepper${o.cls ? ' ' + o.cls : ''}"><button class="k" data-a="${action}" data-v="${-step}"${attrs}${o.minDisabled ? ' disabled' : ''} aria-label="Weniger">−</button><div class="v">${label}</div><button class="k" data-a="${action}" data-v="${step}"${attrs}${o.maxDisabled ? ' disabled' : ''} aria-label="Mehr">+</button></div>`;

function setChip(s) {
  return `<span class="setchip${s.pr ? ' pr' : ''}${s.drops && s.drops.length ? ' dropchip' : ''}">${s.pr ? ic('trophy', 13) : ''}${esc(L.setLabel(s.kg, s.reps, s.drops))}</span>`;
}
const prBadge = (n) => `<span class="prbadge">${ic('trophy', 14)}${n > 1 ? n : ''}</span>`;
const timeText = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const pct = (f) => `${Math.round(f * 100)} %`;
const WD_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WD_FULL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
}
const trainedToday = () => D().history.some((h) => L.dayStart(h.start) === L.dayStart(Date.now()));
const histVolume = (h) => L.histStats(h.exercises, L.entryBw(h, D().body)).volume;

/** Pausen-Schnellwahl: 4 Zeiten, die aktuelle Pause ist immer dabei. */
function restPresets(target) {
  const base = [60, 90, 120, 180];
  if (!base.includes(target)) {
    let k = 0;
    base.forEach((v, i) => { if (Math.abs(v - target) < Math.abs(base[k] - target)) k = i; });
    base[k] = target;
  }
  return base.sort((a, b) => a - b);
}

/* =========================================================
   START
   ========================================================= */
function homeHtml() {
  const d = D();
  const parts = {
    next: heroHtml,
    week: weekSection,
    body: () => `${sectionHeader('Körperdaten', { action: 'openBody', actionLabel: 'Öffnen' })}${bodyCard()}`,
    weekstats: weekStatsSection,
    plan: planSection,
    history: historySection,
  };
  const visible = d.settings.home.filter((x) => x.on && parts[x.id]);
  return `<div class="col">
    ${screenTitle(greeting(), L.longDate(Date.now()), `<img src="icons/logo.png" alt="MirraFit">${iconBtn('tune', 'Einstellungen', 'settings')}`)}
    ${backupHintHtml()}
    ${visible.map((x, i) => `<div class="home-sec${i === 0 ? ' first' : ''}">${parts[x.id]()}</div>`).join('')}
    ${visible.length ? '' : '<div class="panel p20 muted" style="font-size:14.5px">Alle Bereiche sind ausgeblendet.</div>'}
    <button class="customize" data-a="openHome">${ic('dashboard', 18)}<span>Startseite anpassen</span></button>
  </div>`;
}

function backupHintHtml() {
  if (!backupDue()) return '';
  return `<div class="panel mt12 backup-hint" style="margin-bottom:12px">
      <div class="grow"><div style="font-size:14.5px;font-weight:600">Backup sichern</div>
      <div class="muted" style="font-size:13px;line-height:18px;margin-top:2px">Deine Daten liegen nur in diesem Browser. Eine Sicherung schützt sie vor Verlust.</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn-secondary" style="padding:9px 12px;font-size:13.5px" data-a="exportBackup">Jetzt sichern</button>
        <button class="link-btn muted" style="text-align:center" data-a="snoozeBackup">Später</button>
      </div></div>`;
}

/** Erinnerung in der App: Trainingstag heute / nächster Trainingstag. */
function reminderLine() {
  const st = D().settings;
  if (!st.trainDays.length) return '';
  const done = trainedToday();
  const time = st.trainTime ? ` · ${st.trainTime} Uhr` : '';
  if (done && st.trainDays.includes(L.weekdayIdx(Date.now()))) return `<div class="reminder done">${ic('check', 16)}<span>Heute schon trainiert – stark!</span></div>`;
  const nx = L.nextTrainDay(st.trainDays, done);
  if (!nx) return '';
  if (nx.inDays === 0) return `<div class="reminder now">${ic('bell', 16)}<span>Heute ist Trainingstag${time}</span></div>`;
  const when = nx.inDays === 1 ? 'morgen' : `${WD_FULL[L.weekdayIdx(nx.ts)]} (in ${nx.inDays} Tagen)`;
  return `<div class="reminder">${ic('bell', 16)}<span>Nächstes Training ${when}${time}</span></div>`;
}

function planChips(action = 'pickPlan') {
  const d = D();
  if (d.plans.length < 2) return '';
  return `<div class="plan-pick">${d.plans.map((p) => `<button class="chip${p.id === d.planId ? ' sel' : ''}" data-a="${action}" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join('')}</div>`;
}

function heroHtml() {
  const d = D();
  const s = d.session;
  if (s) {
    const st = L.sessionStats(s, currentBw());
    const total = s.exercises.reduce((a, e) => a + e.sets.length, 0);
    const vol = L.fmtVolume(st.volume);
    return `<div class="panel active p18">
      <div class="orange" style="font-size:15px;font-weight:600">${esc(s.planName || 'Training')} läuft</div>
      <div class="disp" data-clock style="font-size:60px;font-weight:800;margin-top:6px">${L.fmtClock((S.now - s.start) / 1000)}</div>
      <div class="row" style="gap:28px;margin:10px 0 12px">
        ${stat(`${st.sets}/${total}`, 'Sätze', { size: 24 })}
        ${stat(vol[0], 'Volumen', { size: 24, unit: vol[1] })}
        ${st.prs > 0 ? stat(st.prs, 'Bestwerte', { size: 24, color: 'var(--gold)' }) : ''}
      </div>
      ${progress(total > 0 ? st.sets / total : 0)}
      <div style="height:16px"></div>
      ${primaryBtn('Weitermachen', 'continue', 'play')}
    </div>`;
  }
  const plan = P();
  const hist = d.history;
  const totalSets = plan.exercises.reduce((a, e) => a + e.sets, 0);
  const lastOfPlan = [...hist].reverse().find((h) => h.planId === plan.id);
  return `<div class="panel p18">
    <div class="hero-label">Nächstes Training</div>
    <div class="hero-plan">${esc(plan.name)}</div>
    <div class="hero-quote">${esc(S.spruch)}</div>
    ${reminderLine()}
    ${hist.length ? `<div class="last-seen">${ic('schedule', 16)}<span>Zuletzt trainiert ${L.daysAgo(hist[hist.length - 1].start)}${lastOfPlan && d.plans.length > 1 && lastOfPlan !== hist[hist.length - 1] ? ` · ${esc(plan.name)} ${L.daysAgo(lastOfPlan.start)}` : ''}</span></div>` : ''}
    ${planChips()}
    <div class="hero-stats">
      ${stat(plan.exercises.length, 'Übungen', { size: 40 })}
      ${stat(totalSets, 'Sätze', { size: 40 })}
      ${stat(Math.round(totalSets * 2.2), 'Minuten ca.', { size: 40 })}
    </div>
    ${primaryBtn('Training starten', 'start', 'play')}
  </div>`;
}

function weekSection() {
  const hist = D().history;
  const streak = L.streakWeeks(hist);
  const thisWeek = hist.filter((h) => L.weekStart(h.start) === L.weekStart(Date.now())).length;
  return `${sectionHeader('Diese Woche', { trailing: streak > 0 ? iconLabel('fire', `${streak} ${streak === 1 ? 'Woche' : 'Wochen'} in Folge`, 'var(--accent)') : '' })}
    ${weekPanel(hist, thisWeek, D().settings.weeklyGoal)}`;
}

function weekPanel(history, thisWeek, goal) {
  const ws = L.weekStart(Date.now());
  const today = L.dayStart(Date.now());
  const perDay = L.workoutsPerDay(history);
  const planned = D().settings.trainDays;
  let days = '';
  for (let k = 0; k < 7; k++) {
    const day = L.dayStart(L.addDays(ws, k));
    const trained = (perDay.get(day) || 0) > 0;
    const isToday = day === today;
    const future = day > today;
    const plan = planned.includes(k) && !trained && day >= today;
    days += `<div class="d${isToday ? ' today' : ''}"><span>${WD_SHORT[k]}</span>
      <div class="dot${trained ? ' trained' : ''}${future ? ' future' : ''}${isToday ? ' today' : ''}${plan ? ' planned' : ''}">${trained ? ic('check', 20) : L.dayOfMonth(day)}</div></div>`;
  }
  const reached = thisWeek >= goal;
  return `<div class="panel"><div class="week">${days}</div>
    <div class="goal"><div class="l">${iconLabel('flag', reached ? 'Wochenziel erreicht' : 'Wochenziel', reached ? 'var(--green)' : 'var(--muted)', reached ? 'var(--green)' : 'var(--muted)')}</div>
    <span class="disp" style="font-size:18px;font-weight:600">${thisWeek} von ${goal}</span></div>
    ${progress(thisWeek / goal)}
    ${planned.length ? '<div class="faint" style="font-size:12px;margin-top:10px">Gestrichelte Kreise = geplante Trainingstage</div>' : ''}</div>`;
}

function weekStatsSection() {
  const hist = D().history;
  const ws = L.weekStart(Date.now());
  const pw = L.prevWeek(ws);
  const sum = (from) => {
    const hs = hist.filter((h) => L.weekStart(h.start) === from);
    return { n: hs.length, v: hs.reduce((a, h) => a + histVolume(h), 0), sets: hs.reduce((a, h) => a + L.histStats(h.exercises).sets, 0) };
  };
  const a = sum(ws);
  const b = sum(pw);
  const vol = L.fmtVolume(a.v);
  const diff = b.v > 0 ? ((a.v - b.v) / b.v) * 100 : null;
  return `${sectionHeader('Wochenbilanz')}
    <div class="panel p18"><div class="row" style="gap:26px">
      ${stat(vol[0], 'Volumen', { size: 30, unit: vol[1] })}${stat(a.sets, 'Sätze', { size: 30 })}${stat(a.n, 'Einheiten', { size: 30 })}</div>
      <div class="muted" style="font-size:13.5px;margin-top:12px">${diff === null ? 'Letzte Woche: noch keine Daten zum Vergleich' : `<span style="color:${diff >= 0 ? 'var(--green)' : 'var(--muted)'}">${L.fmtPercent(diff)}</span> Volumen gegenüber letzter Woche (bis jetzt)`}</div></div>`;
}

function planSection() {
  const d = D();
  const plan = P();
  const hist = d.history;
  const shown = S.showAllPlan ? plan.exercises : plan.exercises.slice(0, 5);
  const rows = shown.map((e, i) => `${i > 0 ? '<div class="divider in50"></div>' : ''}${planRow(i, e, L.lastSets(hist, e.id))}`).join('');
  return `${sectionHeader(`Plan · ${esc(plan.name)}`, { action: 'editPlan', actionLabel: 'Bearbeiten', trailing: `<button class="link-btn" data-a="openPlans">${d.plans.length > 1 ? `Alle ${d.plans.length}` : 'Pläne'}</button>` })}
    <div class="panel flush">
      ${plan.exercises.length ? '' : '<div class="empty-text">Noch keine Übungen. Tippe auf „Bearbeiten“, um den Plan zu füllen.</div>'}
      ${rows}
      ${plan.exercises.length > 5 ? `<div class="divider"></div><button class="more" data-a="togglePlan">${S.showAllPlan ? 'Weniger anzeigen' : `Alle ${plan.exercises.length} Übungen anzeigen`}</button>` : ''}
    </div>`;
}

function planRow(i, e, last) {
  let top = null;
  for (const x of last) if (!top || L.e1rm(x.kg, x.reps) + x.reps * 0.001 > L.e1rm(top.kg, top.reps) + top.reps * 0.001) top = x;
  const extras = [e.rest ? `${timeText(e.rest)} Pause` : '', L.exBwf(e) > 0 ? `Eigengew. ${pct(L.exBwf(e))}` : ''].filter(Boolean).join(' · ');
  return `<div class="plan-row" data-a="openEx" data-id="${esc(e.id)}">
    <div class="n disp">${i + 1}</div>
    <div class="grow"><div class="nm">${esc(e.name)}</div><div class="sb">${e.sets} × ${esc(e.reps)} Wdh. – ${esc(e.cat)}${extras ? ' · ' + extras : ''}</div></div>
    ${top ? `<div class="last"><div class="z">${esc(L.setLabel(top.kg, top.reps))}</div><small>zuletzt</small></div>` : ''}
  </div>`;
}

function historySection() {
  const hist = D().history;
  const names = [...new Set(hist.map((h) => h.planName).filter(Boolean))];
  if (S.histFilter !== 'all' && !names.includes(S.histFilter)) S.histFilter = 'all';
  const list = S.histFilter === 'all' ? hist : hist.filter((h) => h.planName === S.histFilter);
  const filter = names.length > 1 || (names.length === 1 && hist.some((h) => !h.planName))
    ? `<div class="plan-pick" style="margin:0 0 12px">${[['Alle', 'all'], ...names.map((n) => [n, n])].map(([l, v]) => `<button class="chip${S.histFilter === v ? ' sel' : ''}" data-a="histFilter" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>` : '';
  const numOf = new Map(hist.map((h, i) => [h.id, i + 1]));
  const groups = new Map();
  [...list].reverse().forEach((h) => {
    const g = L.historyGroup(h.start, Date.now());
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(h);
  });
  let body;
  if (!hist.length) {
    body = `<div class="panel p22">${ic('dumbbell', 30, 'faint')}<div class="muted" style="font-size:14.5px;line-height:20px;margin-top:10px">Hier landet jede Einheit, die du speicherst. Starte dein erstes Training.</div></div>`;
  } else if (!list.length) {
    body = '<div class="panel p20 muted" style="font-size:14px">Keine Einheiten für diesen Plan.</div>';
  } else {
    body = [...groups].map(([label, entries]) => `<div class="hist-group">${esc(label)}</div>
      <div class="panel flush">${entries.map((h, k) => `${k > 0 ? '<div class="divider in72"></div>' : ''}${historyRow(h, numOf.get(h.id))}`).join('')}</div><div style="height:12px"></div>`).join('');
  }
  return `${sectionHeader('Verlauf', { trailing: hist.length ? `<span class="muted" style="font-size:13.5px">${list.length} Einheiten</span>` : '' })}${filter}${body}`;
}

function historyRow(entry, n) {
  const bw = L.entryBw(entry, D().body);
  const st = L.histStats(entry.exercises, bw);
  const vol = L.fmtVolume(st.volume);
  const open = S.histOpen.has(entry.id);
  let detail = '';
  if (open) {
    const usesBw = entry.exercises.some((e) => L.exBwf(e) > 0);
    detail = `<div class="hist-detail"><div class="when">${L.relativeDay(entry.start)}, ${L.formatTime(entry.start)} Uhr${usesBw && bw > 0 ? ` · Körpergewicht ${L.fmt(bw)} kg eingerechnet` : ''}</div>
      ${entry.exercises.map((e) => `<div class="exn">${esc(e.name)}</div><div class="chips">${e.sets.map(setChip).join('')}</div>`).join('')}
      <div class="row gap10 mt16">${secBtn('Bearbeiten', 'editHistory', 'edit', { cls: 'grow', attrs: ` data-id="${entry.id}"` })}${secBtn('Löschen', 'deleteHistory', 'trash', { danger: true, cls: 'grow', attrs: ` data-id="${entry.id}"` })}</div></div>`;
  }
  return `<div class="hist-row" data-a="histToggle" data-id="${entry.id}">
    <div class="top">
      <div class="dt"><div class="dd disp">${L.dayOfMonth(entry.start)}</div><div class="mm">${esc(L.shortMonthName(entry.start))}</div></div>
      <div class="grow"><div class="nm">${entry.planName ? `${esc(entry.planName)}<span class="hn">#${n}</span>` : `Einheit ${n}`}${st.prs > 0 ? prBadge(st.prs) : ''}</div>
        <div class="meta">${entry.end > entry.start ? iconLabel('schedule', L.fmtDuration(entry.end - entry.start)) : ''}${iconLabel('dumbbell', `${vol[0]} ${vol[1]}`)}<span>${st.sets} Sätze</span></div></div>
      ${ic('expand', 24, 'chev' + (open ? ' open' : ''))}
    </div>${detail}</div>`;
}

/* ---------- Körperdaten-Karte ---------- */
function bodyCard() {
  const b = D().body;
  const last = L.latestBody(b);
  const lastKfa = [...b.entries].reverse().find((e) => e.kfa > 0);
  if (!last && !lastKfa) {
    return `<div class="panel p18 link-row" data-a="openBody"><div class="row gap10">${ic('scale', 26, 'orange')}
      <div class="grow"><div style="font-size:15px;font-weight:600">Gewicht und KFA eintragen</div>
      <div class="muted" style="font-size:13px;line-height:18px;margin-top:2px">Damit siehst du deinen Verlauf und MirraFit rechnet Eigengewicht-Übungen wie Liegestütze in kg.</div></div>
      ${ic('chevronRight', 24, 'faint')}</div></div>`;
  }
  const monthAgo = L.addDays(Date.now(), -30);
  const older = b.entries.filter((e) => e.weight > 0 && e.ts <= monthAgo).pop() || b.entries.find((e) => e.weight > 0);
  const diff = last && older && older !== last ? last.weight - older.weight : null;
  const lean = last && lastKfa ? last.weight * (1 - lastKfa.kfa / 100) : 0;
  const bm = last ? L.bmi(last.weight, b.height) : 0;
  const pts = b.entries.filter((e) => e.weight > 0).slice(-12).map((e) => e.weight);
  return `<div class="panel p18 link-row" data-a="openBody">
    <div class="row">
      <div class="grow body-stats">
        ${last ? stat(L.fmt(last.weight), diff !== null ? `Gewicht · ${diff > 0 ? '+' : diff < 0 ? '−' : '±'}${L.fmt(Math.abs(diff))} kg` : 'Gewicht', { size: 30, unit: 'kg' }) : ''}
        ${lastKfa ? stat(L.fmt(lastKfa.kfa), 'KFA', { size: 30, unit: '%' }) : ''}
        ${lean > 0 ? stat(L.fmt(lean, 0), 'fettfrei', { size: 30, unit: 'kg' }) : bm > 0 ? stat(L.fmt(bm), 'BMI', { size: 30 }) : ''}
      </div>
      ${pts.length > 1 ? spark(pts) : ''}
    </div>
    <div class="faint" style="font-size:12px;margin-top:8px">Zuletzt eingetragen ${L.daysAgo((last || lastKfa).ts)}</div>
  </div>`;
}

/* =========================================================
   TRAINING
   ========================================================= */
function workoutHtml() {
  const d = D();
  const s = d.session;
  if (!s) {
    const plan = P();
    return `<div class="col">${screenTitle('Training')}
      <div class="panel p20">${ic('dumbbell', 32, 'orange')}
        <div style="font-size:17px;font-weight:600;margin-top:12px">Gerade läuft kein Training.</div>
        <div class="muted" style="font-size:14px;line-height:20px;margin:4px 0 14px">${plan.exercises.length
          ? `${esc(plan.name)}: ${esc(plan.exercises.slice(0, 3).map((e) => e.name).join(', '))}${plan.exercises.length > 3 ? ' …' : ''}`
          : `„${esc(plan.name)}“ hat noch keine Übungen.`}</div>
        ${planChips()}
        <div style="height:6px"></div>
        ${primaryBtn(`${esc(plan.name)} starten`, 'startWorkout', 'play')}
      </div></div>`;
  }
  const bw = currentBw();
  const total = s.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneN = s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
  const stats = L.sessionStats(s, bw);
  const vol = L.fmtVolume(stats.volume);
  const currentIdx = s.exercises.findIndex((e) => e.sets.some((x) => !x.done));
  const cards = s.exercises.map((e, ei) => {
    const complete = e.sets.length > 0 && e.sets.every((x) => x.done);
    const open = S.expanded[e.id] !== undefined ? S.expanded[e.id] : !complete;
    return exerciseCard(e, ei, s.exercises.length, complete, ei === currentIdx, open, L.lastSets(d.history, e.id), bw);
  }).join('');

  return `<div class="wk-head">
      <div class="row">
        <div class="grow">${s.planName ? `<div class="wk-plan">${esc(s.planName)}</div>` : ''}<div class="clock" data-clock>${L.fmtClock((S.now - s.start) / 1000)}</div>
        <div class="sum">${doneN} von ${total} Sätzen, ${vol[0]} ${vol[1]}${stats.prs > 0 ? `, ${stats.prs} Bestwert${stats.prs === 1 ? '' : 'e'}` : ''}</div></div>
        ${iconBtn('swap', 'Reihenfolge ändern', 'openOrder', { cls: 'light', attrs: ' style="width:42px;height:42px"' })}
      </div>
      <div style="margin-top:12px">${progress(total > 0 ? doneN / total : 0)}</div>
    </div>
    <div class="wk-list" id="wkList"><div class="inner">
      ${cards}
      ${secBtn('Übung hinzufügen', 'addSessionEx', 'add', { cls: 'w100' })}
      ${primaryBtn('Training beenden', 'finish', 'check')}
      <button class="discard" data-a="discard">Training verwerfen</button>
    </div></div>`;
}

function exerciseCard(e, ei, count, complete, current, open, prev, bw) {
  const activeSet = current ? e.sets.findIndex((x) => !x.done) : -1;
  const bwf = L.exBwf(e);
  const sub = complete && !open
    ? e.sets.map((x) => L.setLabel(L.num(x.kg), L.num(x.reps), L.numDrops(x.drops))).join('  ')
    : `Ziel ${e.reps} Wdh. – ${e.cat}${e.rest ? ` · Pause ${timeText(e.rest)}` : ''}`;

  let hint = '';
  if (!complete && L.readyToProgress(prev, e.reps)) {
    const bwOnly = prev.every((x) => x.kg <= 0);
    hint = `<div class="hint-gold">${ic('trendUp', 18)}<span>${bwOnly ? 'Ziel zuletzt erreicht: Zeit für Zusatzgewicht?' : 'Ziel zuletzt erreicht: heute +2,5 kg?'}</span></div>`;
  }
  const bwInfo = bwf > 0
    ? `<div class="bw-info">${ic('scale', 16)}<span>${bw > 0
      ? `Eigengewicht ${pct(bwf)} ≈ <b>${L.fmt(bwf * bw)} kg</b> je Wdh. – kg-Feld = Zusatzgewicht`
      : `Eigengewicht ${pct(bwf)} – <button class="inline-link" data-a="openBody">Gewicht eintragen</button>, dann zählt es ins Volumen`}</span></div>` : '';

  const rows = e.sets.map((st, si) => {
    const sug = L.suggestion(prev, e, si);
    const p = prev[si];
    const key = `${ei}-${si}`;
    const nudges = si === activeSet ? `<div class="nudges">
        <div><button class="nudge" data-a="step" data-ei="${ei}" data-si="${si}" data-kg="1" data-d="-2.5">−2,5</button><button class="nudge" data-a="step" data-ei="${ei}" data-si="${si}" data-kg="1" data-d="2.5">+2,5</button></div>
        <div><button class="nudge" data-a="step" data-ei="${ei}" data-si="${si}" data-kg="0" data-d="-1">−1</button><button class="nudge" data-a="step" data-ei="${ei}" data-si="${si}" data-kg="0" data-d="1">+1</button></div>
      </div>` : '';
    const menu = S.setMenu === key ? `<div class="menu setmenu">
        <button data-a="addDrop" data-ei="${ei}" data-si="${si}">${ic('drop', 22)}<span>Dropsatz anhängen</span></button>
        <button class="dng" data-a="removeSet" data-ei="${ei}" data-si="${si}">${ic('remove', 22)}<span>Satz entfernen</span></button></div>` : '';
    const drops = (st.drops || []).map((dr, di) => {
      const ds = dropSug(e, si, di);
      return `<div class="droprow${st.done ? ' done' : ''}">
        <span class="dl">${ic('drop', 16)}</span><span class="dn">Drop ${di + 1}</span>
        <input class="numf sm${st.done ? ' done' : ''}" id="d-${ei}-${si}-${di}-kg" data-in="drop" data-ei="${ei}" data-si="${si}" data-di="${di}" data-kg="1" inputmode="decimal" autocomplete="off" placeholder="${esc(ds[0] || 'kg')}" value="${esc(dr.kg)}" aria-label="Gewicht Drop ${di + 1}">
        <input class="numf sm${st.done ? ' done' : ''}" id="d-${ei}-${si}-${di}-reps" data-in="drop" data-ei="${ei}" data-si="${si}" data-di="${di}" data-kg="0" inputmode="numeric" autocomplete="off" placeholder="${esc(ds[1] || '–')}" value="${esc(dr.reps)}" aria-label="Wiederholungen Drop ${di + 1}">
        <button class="icon-btn ghost xs" data-a="removeDrop" data-ei="${ei}" data-si="${si}" data-di="${di}" aria-label="Drop entfernen">${ic('close', 18)}</button></div>`;
    }).join('');
    return `<div class="setrow${st.pr ? ' pr' : st.done ? ' done' : ''}${st.drops && st.drops.length ? ' hasdrops' : ''}">
        <div class="menu-wrap sn-wrap"><button class="sn${si === activeSet ? ' act' : ''}" data-a="setMenu" data-k="${key}" aria-label="Satz ${si + 1}: Optionen">${si + 1}</button>${menu}</div>
        <span class="prev">${p ? esc(L.setLabel(p.kg, p.reps)) + (p.drops && p.drops.length ? '<i class="pd">↘</i>' : '') : '–'}</span>
        <input class="numf${st.done ? ' done' : ''}" id="f-${ei}-${si}-kg" data-in="field" data-ei="${ei}" data-si="${si}" data-kg="1" inputmode="decimal" autocomplete="off" enterkeyhint="next" aria-label="${bwf > 0 ? 'Zusatzgewicht' : 'Gewicht'} Satz ${si + 1}" placeholder="${esc(sug[0] || (bwf > 0 ? '+0' : 'kg'))}" value="${esc(st.kg)}">
        <input class="numf${st.done ? ' done' : ''}" id="f-${ei}-${si}-reps" data-in="field" data-ei="${ei}" data-si="${si}" data-kg="0" data-enter="1" inputmode="numeric" autocomplete="off" enterkeyhint="done" aria-label="Wiederholungen Satz ${si + 1}" placeholder="${esc(sug[1] || '–')}" value="${esc(st.reps)}">
        <button class="setcheck${st.done ? ' done' : ''}${st.pr ? ' pr' : ''}${S.anim.pop === key ? ' pop' : ''}" data-a="toggleSet" data-ei="${ei}" data-si="${si}" aria-label="${st.done ? 'Satz erledigt' : 'Satz abhaken'}">${ic(st.pr ? 'trophy' : 'check', 22)}</button>
      </div>${drops}${nudges}`;
  }).join('');

  const menu = S.menu === ei ? `<div class="menu">
      <button data-a="menuAddSet" data-ei="${ei}">${ic('add', 22)}<span>Satz hinzufügen</span></button>
      <button data-a="menuDrop" data-ei="${ei}">${ic('drop', 22)}<span>Dropsatz zum aktuellen Satz</span></button>
      <button class="dng" data-a="skipEx" data-ei="${ei}">${ic('skip', 22)}<span>Für heute überspringen</span></button></div>` : '';

  return `<div class="panel flush${current ? ' active' : ''}" id="exc-${ei}">
    <div class="ex-head${open ? ' open' : ''}${complete ? ' click' : ''}"${complete ? ` data-a="toggleOpen" data-id="${esc(e.id)}"` : ''}>
      ${complete ? `<div class="ex-check">${ic('check', 18)}</div>` : `<div class="ex-num${current ? ' cur' : ''}">${ei + 1}</div>`}
      <div class="ex-title"><div class="nm">${esc(e.name)}</div><div class="sb">${esc(sub)}</div></div>
      ${complete ? ic('expand', 24, 'chev' + (open ? ' open' : '')) : ''}
      ${iconBtn('up', 'Nach oben', 'exMove', { cls: 'ghost sm', disabled: ei === 0, attrs: ` data-ei="${ei}" data-dir="-1"` })}
      ${iconBtn('down', 'Nach unten', 'exMove', { cls: 'ghost sm', disabled: ei >= count - 1, attrs: ` data-ei="${ei}" data-dir="1"` })}
      <div class="menu-wrap">${iconBtn('more', 'Optionen', 'menu', { cls: 'ghost sm', attrs: ` data-ei="${ei}"` })}${menu}</div>
    </div>
    ${open ? `<div class="ex-body">${e.note ? `<div class="ex-note">${ic('note', 16)}<span>${esc(e.note)}</span></div>` : ''}${bwInfo}${hint}
      <div class="cols"><span>Satz</span><span>Vorher</span><span>${bwf > 0 ? '+kg' : 'kg'}</span><span>Wdh.</span><span></span></div>
      ${rows}
      <div class="settools">
        <button class="settool" data-a="addSet" data-ei="${ei}">${ic('add', 18)}Satz</button>
        ${e.sets.length > 1 ? `<button class="settool" data-a="delSet" data-ei="${ei}">${ic('remove', 18)}Satz</button>` : ''}
        <span class="settool-hint">Satznummer antippen für Dropsatz</span>
      </div></div>` : ''}
  </div>`;
}

/* ---------- Pausen-Leiste & Navigation ---------- */
function restBarHtml() {
  const t = D().timer;
  const target = currentRest();
  const remMs = t ? Math.max(0, t.end - S.now) : 0;
  const remSec = Math.floor((remMs + 999) / 1000);
  const frac = t && t.total > 0 ? Math.min(1, Math.max(0, remMs / 1000 / t.total)) : 0;
  const ending = !!t && remSec >= 1 && remSec <= 5;
  const keys = t
    ? `<div class="keys"><button class="tkey" data-a="addTime" data-v="-15">−15</button><button class="tkey" data-a="addTime" data-v="15">+15</button><button class="tkey" data-a="addTime" data-v="30">+30</button></div>
       ${iconBtn('close', 'Pause beenden', 'stopTimer', { cls: 'light', attrs: ' style="margin-left:8px"' })}`
    : `<span class="lbl">Pause</span><div class="keys">${restPresets(target).map((secs) => `<button class="tkey${secs === target ? ' acc' : ''}" data-a="startTimer" data-v="${secs}">${timeText(secs)}</button>`).join('')}</div>`;
  return `<div class="restbar">${progress(frac, 'thin', 'rb-prog')}<div class="in">
    ${ic('timer', 22, t ? 'orange' : 'muted')}
    ${t ? `<button class="time${ending ? ' ending' : ''}" id="rb-time" data-a="bigTimer" aria-label="Großer Timer">${timeText(remSec)}</button>` : ''}
    ${keys}</div></div>`;
}

function navHtml() {
  const live = !!D().session;
  const item = (tab, icon, label, dot) => `<button class="navi${S.tab === tab ? ' on' : ''}" data-a="tab" data-v="${tab}" aria-label="${label}"><div class="pill">${ic(icon, 24)}${dot ? '<span class="live"></span>' : ''}</div><span>${label}</span></button>`;
  return `<div class="nav"><div class="in">${item('home', 'home', 'Start', false)}${item('workout', 'dumbbell', 'Training', live)}${item('stats', 'insights', 'Auswertung', false)}</div></div>`;
}

/* =========================================================
   AUSWERTUNG
   ========================================================= */
function statsHtml() {
  const all = D().history;
  const body = D().body;
  const head = (sub) => screenTitle('Auswertung', sub, iconBtn('tune', 'Einstellungen', 'settings'));
  if (!all.length) {
    return `<div class="col">${head(null)}
      <div class="panel p20">${ic('insights', 32, 'orange')}
      <div style="font-size:17px;font-weight:600;margin-top:12px">Noch nichts auszuwerten.</div>
      <div class="muted" style="font-size:14px;line-height:20px;margin-top:4px">Sobald du deine erste Einheit speicherst, siehst du hier Volumen, Bestwerte, Konstanz und deinen Fortschritt je Übung.</div></div>
      ${body.entries.length ? `${sectionHeader('Körperdaten', { action: 'openBody', actionLabel: 'Öffnen' })}${bodyCard()}` : ''}</div>`;
  }
  const names = [...new Set(all.map((h) => h.planName).filter(Boolean))];
  if (S.statsPlan !== 'all' && !names.includes(S.statsPlan)) S.statsPlan = 'all';
  const hist = S.statsPlan === 'all' ? all : all.filter((h) => h.planName === S.statsPlan);
  const filter = names.length > 1 ? `<div class="plan-pick" style="margin:0 0 14px">${[['Alle Pläne', 'all'], ...names.map((n) => [n, n])].map(([l, v]) => `<button class="chip${S.statsPlan === v ? ' sel' : ''}" data-a="statsPlan" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>` : '';

  let totalVol = 0, totalSets = 0, totalPrs = 0, totalTime = 0, timed = 0;
  for (const h of hist) {
    const s = L.histStats(h.exercises, L.entryBw(h, body));
    totalVol += s.volume; totalSets += s.sets; totalPrs += s.prs;
    if (h.end > h.start) { totalTime += h.end - h.start; timed++; }
  }
  const vol = L.fmtVolume(totalVol);
  const streak = L.streakWeeks(all);

  const weeks = [];
  let w = L.weekStart(Date.now());
  for (let i = 0; i < 8; i++) { weeks.unshift(w); w = L.prevWeek(w); }
  const weekData = weeks.map((ws) => {
    const hs = hist.filter((h) => L.weekStart(h.start) === ws);
    return { ws, n: hs.length, v: hs.reduce((a, h) => a + histVolume(h), 0) };
  });

  const map = new Map();
  for (const h of hist) for (const ex of h.exercises) {
    if (!ex.sets.length) continue;
    let m = map.get(ex.id);
    if (!m) { m = { id: ex.id, name: ex.name, points: [], bestSet: null, bestE: 0, bestReps: 0, last: 0 }; map.set(ex.id, m); }
    m.name = ex.name;
    m.last = Math.max(m.last, h.start);
    let top = 0, topReps = 0;
    for (const st of ex.sets) {
      const est = L.e1rm(st.kg, st.reps);
      top = Math.max(top, st.kg);
      topReps = Math.max(topReps, st.reps);
      if (est > m.bestE) { m.bestE = est; m.bestSet = st; }
      m.bestReps = Math.max(m.bestReps, st.reps);
    }
    m.points.push(top > 0 ? top : topReps);
  }
  const exList = [...map.values()].sort((a, b) => b.points.length - a.points.length || b.last - a.last);
  const muscles = L.setsPerMuscle(hist, L.addDays(L.dayStart(Date.now()), -29));

  return `<div class="col">
    ${head(`Seit ${L.formatDate(hist.length ? hist[0].start : all[0].start)}`)}
    ${filter}
    ${!hist.length ? '<div class="panel p20 muted">Keine Einheiten für diesen Plan.</div>' : `
    <div class="panel p18">
      <div class="stats2">
        ${stat(vol[0], 'Volumen gesamt', { size: 40, unit: vol[1] })}${stat(hist.length, 'Einheiten', { size: 40 })}
        ${stat(totalPrs, 'Bestwerte', { size: 40, color: 'var(--gold)' })}${stat(timed > 0 ? L.fmt(totalTime / timed / 60000, 0) : '–', 'Dauer im Schnitt', { size: 40, unit: 'min' })}
      </div>
      <div class="divider" style="margin:16px 0 12px"></div>
      <div class="row">
        <div class="grow">${iconLabel('fire', streak > 0 ? `${streak} ${streak === 1 ? 'Woche' : 'Wochen'} in Folge trainiert` : 'Diese Woche noch kein Training', streak > 0 ? 'var(--accent)' : 'var(--faint)')}</div>
        <span class="muted" style="font-size:13.5px">${totalSets} Sätze</span>
      </div>
    </div>
    ${sectionHeader('Letzte 8 Wochen')}
    ${weeklyChart(weekData)}
    ${sectionHeader('Konstanz')}
    ${consistencyPanel(hist)}
    ${muscles.length ? `${sectionHeader('Muskelgruppen, letzte 30 Tage')}${musclePanel(muscles)}` : ''}
    ${sectionHeader('Körperdaten', { action: 'openBody', actionLabel: 'Öffnen' })}${bodyCard()}
    ${sectionHeader('Übungen')}
    <div class="panel flush">${exList.map((m, i) => `${i > 0 ? '<div class="divider in16"></div>' : ''}${exStatRow(m)}`).join('')}</div>`}
  </div>`;
}

function weeklyChart(weekData) {
  const hasVolume = weekData.some((x) => x.v > 0);
  if (S.statsMode === null) S.statsMode = hasVolume ? 0 : 1;
  const useVol = S.statsMode === 0;
  const maxVal = Math.max(1, ...weekData.map((x) => (useVol ? x.v : x.n)));
  const bars = weekData.map((wp, i) => {
    const v = useVol ? wp.v : wp.n;
    const label = v > 0 ? (useVol ? L.fmtVolume(wp.v)[0] : String(wp.n)) : '';
    const h = v > 0 ? Math.max(6, (v / maxVal) * 104) : 4;
    const isNow = i === weekData.length - 1;
    return `<div class="w${isNow ? ' now' : ''}"><div class="val disp">${label}</div>
      <div class="bar${v <= 0 ? ' empty' : ''}${isNow && v > 0 ? ' now' : ''}" style="height:${h}px"></div>
      <div class="lab">${isNow ? 'Jetzt' : L.formatWeekLabel(wp.ws)}</div></div>`;
  }).join('');
  return `<div class="panel"><div class="row"><div class="grow muted" style="font-size:13.5px">${useVol ? 'Bewegtes Gewicht pro Woche' : 'Einheiten pro Woche'}</div>
    ${seg([['Volumen', 0], ['Anzahl', 1]], S.statsMode, 'statsMode')}</div>
    <div class="weeks">${bars}</div></div>`;
}

function consistencyPanel(hist) {
  const weeksBack = 16;
  const perDay = L.workoutsPerDay(hist);
  const today = L.dayStart(Date.now());
  let start = L.weekStart(today);
  for (let i = 0; i < weeksBack - 1; i++) start = L.prevWeek(start);
  let trained = 0;
  for (let k = 0; k < weeksBack * 7; k++) {
    const d = L.dayStart(L.addDays(start, k));
    if (d <= today && (perDay.get(d) || 0) > 0) trained++;
  }
  let cells = ['Mo', '', 'Mi', '', 'Fr', '', 'So'].map((l) => `<div class="lb">${l}</div>`).join('');
  for (let c = 0; c < weeksBack; c++) for (let r = 0; r < 7; r++) {
    const d = L.dayStart(L.addDays(start, c * 7 + r));
    const n = perDay.get(d) || 0;
    const cls = d > today ? 'f' : n > 1 ? 'g' : n === 1 ? 'o' : '';
    cells += `<div class="c"><i class="${cls}${d === today ? ' today' : ''}"></i></div>`;
  }
  return `<div class="panel"><div class="row" style="align-items:flex-end"><span class="disp" style="font-size:34px;font-weight:800">${trained}</span>
    <span class="muted" style="font-size:13.5px;margin:0 0 4px 8px">Trainingstage in ${weeksBack} Wochen</span></div>
    <div class="heat">${cells}</div>
    <div class="legend"><span><i style="background:var(--field)"></i>Pause</span><span><i style="background:var(--accent)"></i>1 Einheit</span><span><i style="background:var(--magenta)"></i>2 oder mehr</span></div></div>`;
}

function musclePanel(muscles) {
  const top = muscles.slice(0, 7);
  const max = Math.max(1, ...top.map((x) => x[1]));
  return `<div class="panel">${top.map(([name, n]) => `<div class="muscle"><div class="nm">${esc(name)}</div><div class="bar"><i style="width:${(n / max) * 100}%"></i></div><div class="n disp">${n}</div></div>`).join('')}
    <div class="faint" style="font-size:12px;margin-top:8px">Gezählt werden erledigte Sätze; Übungen mit zwei Gruppen zählen für beide.</div></div>`;
}

function exStatRow(m) {
  const pts = m.points.slice(-12);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const diff = pts.length > 1 && first !== 0 ? ((last - first) / first) * 100 : 0;
  const bs = m.bestSet;
  const best = bs ? `Bester Satz ${L.fmt(bs.kg)} kg × ${L.plainNum(bs.reps)}` : `Beste Serie ${L.plainNum(m.bestReps)} Wdh.`;
  let trend = '';
  if (pts.length >= 2) {
    const [icon, color] = diff > 0.5 ? ['trendUp', 'var(--green)'] : diff < -0.5 ? ['trendDown', 'var(--danger)'] : ['trendFlat', 'var(--muted)'];
    trend = `<span style="color:${color};display:flex">${ic(icon, 16)}</span><b style="color:${color}">${Math.abs(diff) > 0.5 ? L.fmtPercent(diff) : 'stabil'}</b>`;
  }
  return `<div class="exstat" data-a="openEx" data-id="${esc(m.id)}">
    <div class="grow"><div class="nm">${esc(m.name)}</div><div class="sb">${esc(best)}</div>
    <div class="tr">${trend}<small>${m.points.length}× trainiert</small></div></div>
    ${spark(pts)}${ic('chevronRight', 24, 'faint')}</div>`;
}

let sparkSeq = 0;
function spark(pts) {
  const W = 80, H = 34, sx = W / 96, sy = H / 36;
  const id = 'sp' + (++sparkSeq % 1000);
  let inner;
  if (pts.length < 2) {
    inner = `<line x1="${4 * sx}" y1="${18 * sy}" x2="${92 * sx}" y2="${18 * sy}" stroke="#20256A" stroke-width="${2 * sx}" stroke-dasharray="${4 * sx} ${4 * sx}"/>`;
  } else {
    const mn = Math.min(...pts), mx = Math.max(...pts);
    const range = mx - mn === 0 ? 1 : mx - mn;
    const xy = pts.map((p, i) => [(4 + i * (88 / (pts.length - 1))) * sx, (32 - ((p - mn) / range) * 26) * sy]);
    const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const area = `M${4 * sx},${34 * sy} ` + xy.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` L${92 * sx},${34 * sy} Z`;
    const lp = xy[xy.length - 1];
    inner = `<defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A3CFF" stop-opacity=".35"/><stop offset="1" stop-color="#8A3CFF" stop-opacity="0"/></linearGradient><linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1FD1FF"/><stop offset=".6" stop-color="#8A3CFF"/><stop offset="1" stop-color="#FF2FC8"/></linearGradient></defs>
      <path d="${area}" fill="url(#${id}a)"/><path d="${line}" fill="none" stroke="url(#${id}l)" stroke-width="${2.2 * sx}" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${lp[0]}" cy="${lp[1]}" r="${3 * sx}" fill="#FF2FC8"/>`;
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="flex:none;margin-right:2px" aria-hidden="true">${inner}</svg>`;
}

/* =========================================================
   SHEETS
   ========================================================= */
function reorderList(name, items, attrs = '') {
  return `<div class="rlist" data-list="${name}"${attrs}>${items.map((it, i) => `<div class="rrow" data-row>
      <div class="grip" data-grip aria-label="Ziehen zum Verschieben">${ic('grip', 24)}</div>
      <div class="rn">${i + 1}</div>
      <div class="rt"${it.click ? ` data-a="${it.click}" data-i="${i}" style="cursor:pointer"` : ''}><div class="a">${esc(it.title)}</div>${it.sub ? `<div class="b">${esc(it.sub)}</div>` : ''}</div>
      <div class="tools">${it.tools}</div></div>`).join('')}</div>`;
}
const toolBtn = (icon, label, action, i, extra = '', cls = '') =>
  `<button class="icon-btn ghost xs ${cls}" aria-label="${label}" data-a="${action}" data-i="${i}"${extra}>${ic(icon, 19)}</button>`;

/* ---------- Pläne ---------- */
function plansSheet() {
  const d = D();
  const stats = new Map();
  for (const h of d.history) if (h.planId) { const x = stats.get(h.planId) || { n: 0, last: 0 }; x.n++; x.last = Math.max(x.last, h.start); stats.set(h.planId, x); }
  return `${sheetTitle('Meine Pläne', 'Der markierte Plan ist als Nächstes dran. Nach jedem Training rückt automatisch der nächste Plan nach.')}
    <div class="panel flush">${d.plans.map((p, i) => {
      const st = stats.get(p.id);
      const sub = [`${p.exercises.length} Übungen`, st ? `${st.n}× trainiert, zuletzt ${L.daysAgo(st.last)}` : 'noch nicht trainiert'].join(' · ');
      return `${i > 0 ? '<div class="divider in16"></div>' : ''}<div class="plan-item">
        <button class="radio${p.id === d.planId ? ' on' : ''}" data-a="pickPlan" data-id="${esc(p.id)}" aria-label="Als Nächstes"></button>
        <div class="grow link-row" data-a="editPlanId" data-id="${esc(p.id)}"><div class="nm">${esc(p.name)}</div><div class="sb">${esc(sub)}</div></div>
        ${iconBtn('copy', 'Plan kopieren', 'dupPlan', { cls: 'ghost xs', iconSize: 19, attrs: ` data-id="${esc(p.id)}"` })}
        ${d.plans.length > 1 ? iconBtn('trash', 'Plan löschen', 'delPlan', { cls: 'ghost xs dng', iconSize: 19, attrs: ` data-id="${esc(p.id)}"` }) : ''}
        ${ic('chevronRight', 22, 'faint')}</div>`;
    }).join('')}</div>
    <div style="height:16px"></div>
    ${primaryBtn('Neuer Plan', 'newPlan', 'add')}
    <div class="mt10">${secBtn('Fertig', 'closeSheet', 'check', { cls: 'w100' })}</div>`;
}

function planSheet() {
  const plan = planById(S.sheet.planId) || P();
  const ex = plan.exercises;
  const totalSets = ex.reduce((a, e) => a + e.sets, 0);
  const items = ex.map((e, i) => ({
    title: e.name, sub: `${e.sets} × ${e.reps} Wdh. – ${e.cat}${e.rest ? ` · ${timeText(e.rest)} Pause` : ''}${L.exBwf(e) > 0 ? ` · Eigengew. ${pct(L.exBwf(e))}` : ''}`, click: 'planEdit',
    tools: toolBtn('up', 'Nach oben', 'planMove', i, ' data-dir="-1"') + toolBtn('down', 'Nach unten', 'planMove', i, ' data-dir="1"') + toolBtn('trash', 'Entfernen', 'planDel', i, '', 'dng'),
  }));
  return `<div class="field" style="margin-bottom:8px"><div class="flabel">Name des Plans</div>
      <input class="tf plan-name" id="plan-name" data-in="planName" maxlength="40" autocomplete="off" value="${esc(plan.name)}" placeholder="z. B. Push, Pull, Beine"></div>
    <div class="muted" style="font-size:13.5px;margin:0 2px 12px">${ex.length} Übungen, ${totalSets} Sätze. Griff links halten und ziehen zum Sortieren, Übung antippen zum Bearbeiten.</div>
    <div class="panel flush">${ex.length ? '' : '<div class="empty-text">Noch keine Übungen. Füge unten deine erste hinzu.</div>'}${reorderList('plan', items, ` data-plan="${esc(plan.id)}"`)}</div>
    <div style="height:16px"></div>
    ${primaryBtn('Übung hinzufügen', 'planAdd', 'add')}
    <div class="row gap10 mt10">${D().plans.length > 1 ? secBtn('Alle Pläne', 'openPlans', 'layers', { cls: 'grow' }) : secBtn('Standard-Übungen', 'planReset', 'restore', { cls: 'grow' })}${secBtn('Fertig', 'planDone', 'check', { cls: 'grow' })}</div>
    ${D().plans.length < 2 ? `<button class="link-btn" style="display:block;margin:14px auto 0" data-a="newPlan">+ Weiteren Plan anlegen (z. B. Push / Pull / Beine)</button>` : ''}`;
}

function orderSheet() {
  const s = D().session;
  let h = sheetTitle('Reihenfolge', 'Griff links gedrückt halten und ziehen, oder die Pfeile nutzen. Gilt nur für dieses Training.');
  if (!s) return h + '<div class="muted" style="font-size:14.5px">Kein laufendes Training.</div>';
  const items = s.exercises.map((e, i) => {
    const done = e.sets.filter((x) => x.done).length;
    return {
      title: e.name, sub: done === e.sets.length && done > 0 ? 'Erledigt' : `${done} von ${e.sets.length} Sätzen`,
      tools: toolBtn('up', 'Nach oben', 'sessMove', i, ' data-dir="-1"') + toolBtn('down', 'Nach unten', 'sessMove', i, ' data-dir="1"'),
    };
  });
  return h + `<div class="panel flush">${reorderList('session', items)}</div>
    <div class="row gap10 mt16">${secBtn('Wie im Plan', 'orderLikePlan', 'sort', { cls: 'grow' })}${secBtn('Fertig', 'closeSheet', 'check', { cls: 'grow' })}</div>`;
}

/* ---------- Übung anlegen / bearbeiten ---------- */
const REP_PRESETS = ['5', '6-8', '8-10', '10-12', '12-15', '15-20'];
const BWF_PRESETS = [['Aus', 0], ['50 %', 0.5], ['64 %', 0.64], ['70 %', 0.7], ['95 %', 0.95], ['100 %', 1]];

function formTaken() {
  const f = S.form;
  if (f.mode === 'SESSION_ADD') return new Set(((D().session && D().session.exercises) || []).map((e) => e.id));
  const plan = planById(f.planId) || P();
  return new Set(plan.exercises.map((p) => p.id));
}
function formKnown() {
  const f = S.form;
  if (f.mode === 'PLAN_EDIT') return [];
  const q = f.name.trim().toLowerCase();
  const taken = formTaken();
  return L.knownExercises(allPlanExercises(), D().history).filter((k) => !taken.has(k.id)).filter((k) => !q || f.reuse || k.name.toLowerCase().includes(q)).slice(0, 10);
}
function formLibrary() {
  const f = S.form;
  if (f.mode === 'PLAN_EDIT') return [];
  const q = f.name.trim().toLowerCase();
  const taken = formTaken();
  const known = new Set(L.knownExercises(allPlanExercises(), D().history).map((k) => k.id));
  return L.LIBRARY.filter((x) => !taken.has(x.id) && !known.has(x.id)).filter((x) => !q || f.reuse || x.name.toLowerCase().includes(q)).slice(0, q ? 12 : 30);
}
function formKnownHtml() {
  const f = S.form;
  const known = formKnown();
  const lib = formLibrary();
  const chip = (k, src) => `<button class="chip${f.reuse && f.reuse.id === k.id ? ' sel' : ''}" data-a="formReuse" data-id="${esc(k.id)}" data-src="${src}">${esc(k.name)}${k.bwf > 0 ? ' <i class="bw-tag">EG</i>' : ''}</button>`;
  return `${known.length ? `<div class="flabel">Schon mal gemacht</div><div class="chips" style="margin-bottom:14px;gap:6px">${known.map((k) => chip(k, 'known')).join('')}</div>` : ''}
    ${lib.length ? `<div class="flabel">Vorlagen <span class="faint" style="font-weight:400">· EG = Eigengewicht wird eingerechnet</span></div><div class="chips lib" style="margin-bottom:16px;gap:6px">${lib.map((k) => chip(k, 'lib')).join('')}</div>` : ''}`;
}
function formCatsHtml() {
  const f = S.form;
  const counts = new Map();
  for (const c of [...allPlanExercises().map((p) => p.cat), ...D().history.flatMap((h) => h.exercises.map((e) => e.cat))]) {
    const t = String(c || '').trim();
    if (t) counts.set(t, (counts.get(t) || 0) + 1);
  }
  const cats = [...counts.entries()].sort((a, b) => b[1] - a[1]).map((x) => x[0]).filter((c) => c !== f.cat.trim()).slice(0, 8);
  return cats.length ? `<div class="chips" style="margin-bottom:16px;gap:6px">${cats.map((c) => `<button class="chip" data-a="formCat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : '<div style="height:14px"></div>';
}
const formPresetsHtml = () => `<div class="chips" style="margin:4px 0 8px;gap:6px">${REP_PRESETS.map((p) => `<button class="chip${S.form.reps.trim() === p ? ' sel' : ''}" data-a="formPreset" data-v="${p}">${p}</button>`).join('')}</div>`;
const formReuseHtml = () => (S.form.reuse ? `<div class="gold" style="font-size:13px;margin-top:8px">${S.form.reuseSrc === 'lib' ? `Vorlage „${esc(S.form.reuse.name)}“ übernommen.` : `Verlauf und Bestwerte von „${esc(S.form.reuse.name)}“ werden weitergeführt.`}</div>` : '');

function formSheet() {
  const f = S.form;
  const bw = currentBw();
  const bwfOpts = BWF_PRESETS.some(([, v]) => v === f.bwf) ? BWF_PRESETS : [...BWF_PRESETS, [pct(f.bwf), f.bwf]];
  return `${sheetTitle(f.mode === 'PLAN_EDIT' ? 'Übung bearbeiten' : 'Neue Übung', f.mode === 'SESSION_ADD' ? 'Wird zum laufenden Training hinzugefügt.' : `Plan: ${(planById(f.planId) || P()).name}`)}
    <div class="field"><div class="flabel">Name</div><input class="tf" id="f-name" data-in="form" data-k="name" autocomplete="off" placeholder="Suchen oder eigenen Namen eingeben" value="${esc(f.name)}"></div>
    <div id="f-known">${formKnownHtml()}</div>
    <div class="field" style="margin-bottom:0"><div class="flabel">Muskelgruppe</div><input class="tf" id="f-cat" data-in="form" data-k="cat" autocomplete="off" placeholder="z. B. Brust / Trizeps" value="${esc(f.cat)}"></div>
    <div id="f-cats" style="margin-top:6px">${formCatsHtml()}</div>
    <div class="two">
      <div><div class="flabel">Sätze</div>${stepper(String(f.sets), 'formSets', 1, '', { minDisabled: f.sets <= 1, maxDisabled: f.sets >= 10 })}</div>
      <div><div class="flabel">Wiederholungen</div><input class="tf" id="f-reps" data-in="form" data-k="reps" autocomplete="off" value="${esc(f.reps)}"></div>
    </div>
    <div id="f-presets">${formPresetsHtml()}</div>
    <div class="field mt12"><div class="flabel">Pause nach jedem Satz</div>
      ${seg([['Standard (' + timeText(D().settings.rest) + ')', 0], ['Eigene', 1]], f.rest > 0 ? 1 : 0, 'formRestMode')}
      ${f.rest > 0 ? `<div class="mt10">${stepper(timeText(f.rest), 'formRest', 15, '', { minDisabled: f.rest <= 15, maxDisabled: f.rest >= 900 })}</div>` : ''}</div>
    <div class="field"><div class="flabel">Eigengewicht einrechnen</div>
      <div class="chips" style="gap:6px">${bwfOpts.map(([l, val]) => `<button class="chip${val === f.bwf ? ' sel' : ''}" data-a="formBwf" data-v="${val}">${esc(l)}</button>`).join('')}</div>
      <div class="muted" style="font-size:12.5px;line-height:17px;margin-top:6px">${f.bwf > 0
        ? `${pct(f.bwf)} deines Körpergewichts werden je Wiederholung mitgezählt${bw > 0 ? ` (≈ ${L.fmt(f.bwf * bw)} kg bei ${L.fmt(bw)} kg)` : ' – trag dein Gewicht unter Körperdaten ein'}. Das kg-Feld im Training ist dann Zusatzgewicht.`
        : 'Für Übungen mit dem eigenen Körper (Liegestütze 64 %, Klimmzüge 100 %, Dips 95 %).'}</div></div>
    <div class="field"><div class="flabel">Notiz (optional)</div><textarea class="tf area" id="f-note" data-in="form" data-k="note" maxlength="300" placeholder="z. B. Sitz Stufe 4, enger Griff">${esc(f.note || '')}</textarea></div>
    ${f.mode === 'SESSION_ADD' ? toggleRow('Auch dauerhaft in den Plan', f.alsoPlan, '_alsoPlan') : ''}
    <div id="f-reuse">${formReuseHtml()}</div>
    <div class="row gap10" style="margin-top:18px">${secBtn('Abbrechen', 'formCancel', null, { cls: 'grow' })}<div class="grow">${primaryBtn('Speichern', 'formSave')}</div></div>`;
}

/* ---------- Einstellungen ---------- */
function installBlock() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return '<div class="muted" style="font-size:13.5px;padding:12px 0">App ist installiert ✓</div>';
  if (deferredPrompt) return `<div class="blk">${secBtn('Als App installieren', 'install', 'download', { cls: 'w100' })}</div>`;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<div class="muted" style="font-size:13.5px;line-height:19px;padding:12px 0">${ios
    ? 'Zum Installieren: Teilen-Symbol antippen, dann „Zum Home-Bildschirm“.'
    : 'Zum Installieren: Browser-Menü (⋮) öffnen und „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.'}</div>`;
}

function settingsSheet() {
  const st = D().settings;
  const last = Number(lsGet('mirrafit.lastBackup') || 0);
  const canShare = typeof navigator.canShare === 'function' && typeof File === 'function';
  const notifBlocked = 'Notification' in window && Notification.permission === 'denied';
  return `${sheetTitle('Einstellungen')}
    <div class="group-title">Pause</div>
    <div class="group">
      <div class="blk"><div style="font-size:15.5px">Standard-Pause</div>
        <div class="mt10">${stepper(timeText(st.rest), 'restStep', 15, '', { minDisabled: st.rest <= 15, maxDisabled: st.rest >= 900 })}</div>
        <div class="mt10 seg-scroll">${seg([['0:45', 45], ['1:00', 60], ['1:30', 90], ['2:00', 120], ['3:00', 180], ['5:00', 300]], st.rest, 'setRest')}</div>
        <div class="faint" style="font-size:12.5px;margin-top:8px">Jede Übung kann zusätzlich eine eigene Pause haben (Übung bearbeiten).</div></div>
      <div class="divider"></div>${toggleRow('Timer automatisch starten', st.autoTimer, 'autoTimer', 'Nach jedem abgehakten Satz')}
      <div class="divider"></div>${toggleRow('Ton am Ende', st.sound, 'sound')}
      <div class="divider"></div>${toggleRow('Vibration', st.vibrate, 'vibrate')}
      <div class="divider"></div>${toggleRow('Countdown spüren', st.tickBuzz, 'tickBuzz', 'Kurzes Vibrieren in den letzten 3 Sekunden')}
      <div class="divider"></div>${toggleRow('Bildschirm anlassen im Training', st.keepAwake, 'keepAwake', 'Damit Timer und Ton zuverlässig laufen')}
      <div class="divider"></div>${toggleRow('Benachrichtigung am Pausenende', st.notifyEnd, 'notifyEnd', notifBlocked ? 'Im Browser blockiert – bitte in den Website-Einstellungen erlauben' : 'Nur wenn die App im Hintergrund ist')}
      <div style="padding:4px 0 12px">${secBtn('Vibration und Ton testen', 'testFeedback', 'vibration', { cls: 'w100' })}</div>
    </div>
    <div class="group-title">Trainingstage & Erinnerung</div>
    <div class="group"><div class="blk">
      <div class="daypick">${WD_SHORT.map((l, i) => `<button class="day${st.trainDays.includes(i) ? ' on' : ''}" data-a="trainDay" data-v="${i}">${l}</button>`).join('')}</div>
      <div class="row gap10 mt12"><div class="grow" style="font-size:15px">Uhrzeit (optional)</div>
        <input type="time" class="tf time-in" id="train-time" data-in="trainTime" value="${esc(st.trainTime)}">
        ${st.trainTime ? iconBtn('close', 'Uhrzeit entfernen', 'clearTrainTime', { cls: 'ghost xs' }) : ''}</div>
      <div class="faint" style="font-size:12.5px;line-height:17px;margin-top:10px">Die App erinnert dich beim Öffnen an Trainingstage und zeigt sie in der Wochenübersicht. Bei geschlossener App kommt keine Meldung.</div>
    </div></div>
    <div class="group-title">Wochenziel</div>
    <div class="group"><div class="blk"><div style="font-size:15.5px">Trainings pro Woche</div><div class="mt10">${seg([1, 2, 3, 4, 5, 6].map((n) => [String(n), n]), st.weeklyGoal, 'setGoal')}</div></div></div>
    <div class="group-title">Persönlich</div>
    <div class="group" style="padding-top:12px;padding-bottom:12px">
      ${secBtn('Pläne verwalten', 'openPlans', 'layers', { cls: 'w100' })}
      <div class="mt10">${secBtn('Körperdaten', 'openBody', 'scale', { cls: 'w100' })}</div>
      <div class="mt10">${secBtn('Startseite anpassen', 'openHome', 'dashboard', { cls: 'w100' })}</div>
    </div>
    <div class="group-title">Daten</div>
    <div class="group">
      <div class="row gap10" style="padding-top:12px">${secBtn('Backup sichern', 'exportBackup', 'download', { cls: 'grow' })}${secBtn('Backup laden', 'importBackup', 'upload', { cls: 'grow' })}</div>
      ${canShare ? `<div class="mt10">${secBtn('Backup teilen (z. B. Drive)', 'shareBackup', 'share', { cls: 'w100' })}</div>` : ''}
      <div class="faint" style="font-size:12.5px;margin-top:10px">${last ? `Letztes Backup: ${L.formatDate(last)}, ${L.formatTime(last)} Uhr` : 'Noch kein Backup gespeichert.'}</div>
      <div class="mt10" style="padding-bottom:12px">${secBtn('Alle Daten löschen', 'wipe', 'trash', { cls: 'w100', danger: true })}</div>
    </div>
    <div class="group-title">App</div>
    <div class="group" style="padding-top:0;padding-bottom:0">${installBlock()}</div>
    <div class="footnote">MirraFit ${L.APP_VERSION}. Deine Daten liegen nur auf diesem Gerät (im Browser-Speicher). Backups aus der Android- und der HTML-App lassen sich laden.</div>`;
}

/* ---------- Startseite anpassen ---------- */
function homeSheet() {
  const h = D().settings.home;
  const names = new Map(L.HOME_SECTIONS);
  const hints = { next: 'Plan-Auswahl, Erinnerung, Start-Knopf', week: 'Wochentage, Serie, Wochenziel', body: 'Gewicht, KFA, Verlauf', weekstats: 'Volumen und Sätze dieser Woche', plan: 'Übungen des nächsten Plans', history: 'Gespeicherte Einheiten' };
  return `${sheetTitle('Startseite anpassen', 'Bereiche ein- oder ausschalten und mit den Pfeilen sortieren.')}
    <div class="panel flush">${h.map((x, i) => `${i > 0 ? '<div class="divider in16"></div>' : ''}
      <div class="home-item">
        <div class="grow link-row" data-a="homeToggle" data-id="${x.id}"><div class="nm">${esc(names.get(x.id))}</div><div class="sb">${esc(hints[x.id] || '')}</div></div>
        ${iconBtn('up', 'Nach oben', 'homeMove', { cls: 'ghost xs', disabled: i === 0, attrs: ` data-i="${i}" data-dir="-1"` })}
        ${iconBtn('down', 'Nach unten', 'homeMove', { cls: 'ghost xs', disabled: i === h.length - 1, attrs: ` data-i="${i}" data-dir="1"` })}
        <div class="sw${x.on ? ' on' : ''}" data-a="homeToggle" data-id="${x.id}" role="switch" aria-checked="${x.on}" aria-label="${esc(names.get(x.id))}"></div>
      </div>`).join('')}</div>
    <div class="row gap10 mt16">${secBtn('Standard', 'homeReset', 'restore', { cls: 'grow' })}${secBtn('Fertig', 'closeSheet', 'check', { cls: 'grow' })}</div>`;
}

/* ---------- Körperdaten ---------- */
function bodyLive() {
  const f = S.body;
  const b = D().body;
  if (f.mode !== 'calc') return '';
  const v = L.navyBf(b.sex, b.height, L.num(f.waist), L.num(f.neck), L.num(f.hip));
  if (!b.height) return '<span class="warn">Erst oben deine Größe eintragen.</span>';
  return v ? `Berechneter KFA: <b>${L.fmt(v)} %</b>` : '<span class="faint">Bauch- und Halsumfang eintragen' + (b.sex === 'w' ? ', dazu Hüfte' : '') + '.</span>';
}

function bodySheet() {
  const b = D().body;
  const f = S.body;
  const entries = b.entries;
  const last = L.latestBody(b);
  const lastKfa = [...entries].reverse().find((e) => e.kfa > 0);
  const lean = last && lastKfa ? last.weight * (1 - lastKfa.kfa / 100) : 0;
  const bm = last ? L.bmi(last.weight, b.height) : 0;
  const metric = S.bodyMetric;
  const series = entries.filter((e) => (metric === 1 ? e.kfa > 0 : e.weight > 0)).slice(-30);
  const values = series.map((e) => (metric === 1 ? e.kfa : e.weight));
  const mn = values.length ? Math.min(...values) : 0, mx = values.length ? Math.max(...values) : 0;
  return `${sheetTitle('Körperdaten', 'Gewicht, Körperfettanteil (KFA) und Größe')}
    <div class="panel p18"><div class="two">
      <div><div class="flabel">Größe (cm)</div><input class="tf" id="b-height" data-in="bodyProfile" data-k="height" inputmode="decimal" autocomplete="off" placeholder="z. B. 180" value="${b.height ? esc(L.plainNum(b.height)) : ''}"></div>
      <div><div class="flabel">Geschlecht (für KFA)</div>${seg([['Mann', 'm'], ['Frau', 'w']], b.sex, 'bodySex')}</div>
    </div></div>
    ${last || lastKfa ? `<div class="panel p18 mt12"><div class="row" style="gap:22px;flex-wrap:wrap">
      ${last ? stat(L.fmt(last.weight), 'Gewicht', { size: 30, unit: 'kg' }) : ''}
      ${lastKfa ? stat(L.fmt(lastKfa.kfa), 'KFA', { size: 30, unit: '%' }) : ''}
      ${lean > 0 ? stat(L.fmt(lean, 1), 'Fettfreie Masse', { size: 30, unit: 'kg' }) : ''}
      ${bm > 0 ? stat(L.fmt(bm), 'BMI', { size: 30 }) : ''}</div></div>` : ''}
    ${series.length ? `<div class="panel mt12"><div class="row"><div class="grow" style="font-size:16px;font-weight:600">Verlauf</div>${seg([['Gewicht', 0], ['KFA', 1]], metric, 'bodyMetric')}</div>
      ${series.length > 1 ? `<div class="chart" data-chart="${esc(JSON.stringify({ v: values, p: [], m: 9 }))}"><div class="axis"><span>${esc(L.fmt(mx))}</span><span>${mx !== mn ? esc(L.fmt(mn)) : ''}</span></div><div class="cv"></div></div>
      <div class="chart-x"><span>${L.formatWeekLabel(series[0].ts)}</span><span>${L.formatWeekLabel(series[series.length - 1].ts)}</span></div>` : '<div class="muted" style="font-size:13.5px;margin-top:12px">Ab zwei Einträgen siehst du hier eine Kurve.</div>'}</div>` : ''}
    ${sectionHeader(f.id ? 'Eintrag bearbeiten' : 'Neuer Eintrag')}
    <div class="panel p18">
      <div class="two">
        <div><div class="flabel">Datum</div><input type="date" class="tf" id="b-date" data-in="body" data-k="date" value="${esc(f.date)}"></div>
        <div><div class="flabel">Gewicht (kg)</div><input class="tf" id="b-weight" data-in="body" data-k="weight" inputmode="decimal" autocomplete="off" placeholder="${last ? esc(L.plainNum(last.weight)) : 'z. B. 80,5'}" value="${esc(f.weight)}"></div>
      </div>
      <div class="flabel mt12">Körperfettanteil</div>
      ${seg([['Selbst eintragen', 'enter'], ['Aus Maßen berechnen', 'calc']], f.mode, 'bodyMode')}
      ${f.mode === 'enter'
        ? `<div class="mt10"><input class="tf" id="b-kfa" data-in="body" data-k="kfa" inputmode="decimal" autocomplete="off" placeholder="KFA in % (optional, z. B. von der Waage)" value="${esc(f.kfa)}"></div>`
        : `<div class="${b.sex === 'w' ? 'three' : 'two'} mt10">
            <div><div class="flabel">Bauch (cm)</div><input class="tf" id="b-waist" data-in="body" data-k="waist" inputmode="decimal" autocomplete="off" placeholder="auf Nabelhöhe" value="${esc(f.waist)}"></div>
            <div><div class="flabel">Hals (cm)</div><input class="tf" id="b-neck" data-in="body" data-k="neck" inputmode="decimal" autocomplete="off" placeholder="unter Kehlkopf" value="${esc(f.neck)}"></div>
            ${b.sex === 'w' ? `<div><div class="flabel">Hüfte (cm)</div><input class="tf" id="b-hip" data-in="body" data-k="hip" inputmode="decimal" autocomplete="off" placeholder="breiteste Stelle" value="${esc(f.hip)}"></div>` : ''}
          </div>
          <div class="bf-live" id="bf-live">${bodyLive()}</div>
          <div class="faint" style="font-size:12px;line-height:17px;margin-top:6px">US-Navy-Methode: Schätzung mit etwa ±3 % Genauigkeit. Morgens nüchtern messen, Maßband locker anlegen.</div>`}
      <div class="row gap10 mt16">${f.id ? secBtn('Abbrechen', 'bodyNew', null, { cls: 'grow' }) : ''}<div class="grow">${primaryBtn(f.id ? 'Änderung speichern' : 'Eintrag speichern', 'bodySave', 'check')}</div></div>
    </div>
    ${entries.length ? `${sectionHeader('Einträge')}<div class="panel flush">${[...entries].reverse().slice(0, 20).map((e, i) => `${i > 0 ? '<div class="divider in16"></div>' : ''}
      <div class="body-row link-row" data-a="bodyEdit" data-id="${e.id}">
        <div class="grow"><div class="nm">${esc(L.relativeDay(e.ts))}</div><div class="sb">${[e.weight > 0 ? `${L.fmt(e.weight)} kg` : '', e.kfa > 0 ? `${L.fmt(e.kfa)} % KFA${e.waist ? ' (berechnet)' : ''}` : ''].filter(Boolean).join(' · ')}</div></div>
        ${iconBtn('trash', 'Eintrag löschen', 'bodyDel', { cls: 'ghost xs dng', iconSize: 19, attrs: ` data-id="${e.id}"` })}
      </div>`).join('')}</div>` : ''}
    <div style="height:8px"></div>`;
}

/* ---------- Zusammenfassung ---------- */
function summarySheet() {
  const entry = S.summary;
  const hist = D().history;
  const bw = L.entryBw(entry, D().body);
  const st = L.histStats(entry.exercises, bw);
  const vol = L.fmtVolume(st.volume);
  S.summaryLine = S.summaryLine && S.summaryLine.id === entry.id ? S.summaryLine : { id: entry.id, t: pick(SUMMARY_LINES) };
  const prNames = entry.exercises.filter((e) => e.sets.some((s) => s.pr)).map((e) => e.name);
  const idx = hist.findIndex((h) => h.id === entry.id);
  const before = hist.slice(0, Math.max(0, idx)).reverse().find((h) => !entry.planId || h.planId === entry.planId) || null;
  const beforeVol = before ? histVolume(before) : 0;
  const volDiff = beforeVol > 0 && st.volume > 0 ? ((st.volume - beforeVol) / beforeVol) * 100 : null;
  const next = D().plans.length > 1 ? P() : null;
  return `<div class="sum-top"><div class="sum-badge${prNames.length ? ' gold' : ''}">${ic(prNames.length ? 'trophy' : 'check', 38)}</div>
      <h2>${S.summaryLine.t}</h2><div class="s">${entry.planName ? esc(entry.planName) + ' gespeichert' : 'Einheit gespeichert'}</div></div>
    <div class="panel p18">
      <div class="two" style="gap:16px 0">
        ${stat(L.fmtDuration(entry.end - entry.start), 'Dauer', { size: 34 })}${st.volume > 0 ? stat(vol[0], 'Volumen', { size: 34, unit: vol[1] }) : stat(L.fmt(st.reps, 0), 'Wiederholungen', { size: 34 })}
        ${stat(st.sets, 'Sätze', { size: 34 })}${stat(st.prs, 'Bestwerte', { size: 34, color: st.prs > 0 ? 'var(--gold)' : null })}
      </div>
      ${volDiff !== null ? `<div class="divider" style="margin:16px 0 12px"></div><div style="font-size:14px;color:${volDiff >= 0 ? 'var(--green)' : 'var(--muted)'}">${L.fmtPercent(volDiff)} Volumen gegenüber ${entry.planName ? 'dem letzten ' + esc(entry.planName) : 'der letzten Einheit'}</div>` : ''}
    </div>
    ${prNames.length ? `<div class="panel mt12">${iconLabel('trophy', 'Neue Bestwerte', 'var(--gold)', 'var(--gold)')}<div style="font-size:14.5px;line-height:20px;margin-top:6px">${esc(prNames.join(', '))}</div></div>` : ''}
    ${next ? `<div class="panel mt12"><div class="muted" style="font-size:13px">Als Nächstes dran</div><div style="font-size:16px;font-weight:600;margin-top:2px">${esc(next.name)}</div></div>` : ''}
    <div style="height:18px"></div>${primaryBtn('Weiter', 'closeSummary')}`;
}

/* ---------- Übungs-Detail ---------- */
function fmtAxis(v, metric) { return metric === 2 ? L.fmtVolume(v).join(' ') : L.fmt(v, 1); }

function detailSheet() {
  const exId = S.sheet.exId;
  const hist = D().history;
  const sessions = L.exerciseSessions(hist, exId, D().body);
  let lastEx = null;
  for (let i = hist.length - 1; i >= 0 && !lastEx; i--) lastEx = hist[i].exercises.find((e) => e.id === exId) || null;
  const planEx = allPlanExercises().find((p) => p.id === exId);
  const name = (lastEx && lastEx.name) || (planEx && planEx.name) || 'Übung';
  const cat = (planEx && planEx.cat) || (lastEx && lastEx.cat) || '';
  const bwf = L.exBwf(planEx || lastEx || {});
  let h = sheetTitle(name, [cat, bwf > 0 ? `Eigengewicht ${pct(bwf)}` : ''].filter(Boolean).join(' · ') || null);
  if (!sessions.length) {
    return h + `<div class="panel p18"><div class="muted" style="font-size:14.5px;line-height:20px">Für diese Übung gibt es noch keine gespeicherten Sätze. Nach dem ersten Training siehst du hier Verlauf und Bestwerte.</div></div>`;
  }
  const bodyweight = sessions.every((x) => x.topKg <= 0);
  const hasVol = sessions.some((x) => x.volume > 0);
  const opts = bodyweight ? (hasVol ? [['Wdh.', 0], ['Volumen', 2]] : [['Wdh.', 0]]) : [['Gewicht', 0], ['1RM', 1], ['Volumen', 2]];
  const metric = opts.some(([, v]) => v === S.detailMetric) ? S.detailMetric : 0;
  const bestE = Math.max(...sessions.map((x) => x.bestE1rm));
  let bestSet = null;
  for (const x of sessions.flatMap((s) => s.sets)) if (!bestSet || L.e1rm(x.kg, x.reps) + x.reps * 0.001 > L.e1rm(bestSet.kg, bestSet.reps) + bestSet.reps * 0.001) bestSet = x;
  const totalVol = L.fmtVolume(sessions.reduce((a, x) => a + x.volume, 0));
  const recent = sessions.slice(-20);
  const values = recent.map((x) => (metric === 1 ? x.bestE1rm : metric === 2 ? x.volume : x.main));
  const mn = Math.min(...values), mx = Math.max(...values);

  h += `<div class="panel p18"><div class="row">
      ${bestSet ? `<div class="grow">${stat(esc(L.setLabel(bestSet.kg, bestSet.reps)), 'Bester Satz', { size: 30, color: 'var(--gold)' })}</div>` : ''}
      ${!bodyweight ? `<div class="grow">${stat(L.fmt(bestE, 0), '1RM geschätzt', { size: 30, unit: 'kg' })}</div>` : ''}
      <div class="grow">${stat(sessions.length, 'Einheiten', { size: 30 })}</div></div></div>
    <div class="panel mt12"><div class="row"><div class="grow" style="font-size:16px;font-weight:600">Verlauf</div>
      ${seg(opts, metric, 'detailMetric')}</div>
      <div class="chart" data-chart="${esc(JSON.stringify({ v: values, p: recent.map((x) => x.hasPr), m: metric }))}">
        <div class="axis"><span>${esc(fmtAxis(mx, metric))}</span><span>${mx !== mn ? esc(fmtAxis(mn, metric)) : ''}</span></div><div class="cv"></div></div>
      <div class="chart-x"><span>${L.formatWeekLabel(recent[0].start)}</span><span>${L.formatWeekLabel(recent[recent.length - 1].start)}</span></div>
      <div class="faint" style="font-size:12.5px;margin-top:10px">${hasVol ? `Insgesamt ${totalVol[0]} ${totalVol[1]} bewegt${bwf > 0 ? ' (inkl. Eigengewicht)' : ''}.` : `Insgesamt ${L.fmt(sessions.reduce((a, x) => a + x.reps, 0), 0)} Wiederholungen.`} Goldene Punkte markieren Bestwerte.</div></div>
    ${sectionHeader('Letzte Einheiten')}
    <div class="panel flush">${[...sessions].reverse().slice(0, 8).map((s, i) => `${i > 0 ? '<div class="divider in16"></div>' : ''}
      <div style="padding:16px"><div class="row"><div class="grow" style="font-size:14.5px;font-weight:500">${esc(L.relativeDay(s.start))}</div>
      <span class="muted" style="font-size:12.5px">${s.topKg > 0 ? `1RM ≈ ${L.fmt(s.bestE1rm, 0)} kg` : `max. ${L.plainNum(s.topReps)} Wdh.`}</span></div>
      <div class="chips mt8">${s.sets.map(setChip).join('')}</div></div>`).join('')}</div>`;
  return h;
}

/** Liniendiagramm als SVG, nachdem die Breite bekannt ist. */
function drawCharts() {
  document.querySelectorAll('.chart[data-chart]').forEach((el) => {
    const cv = el.querySelector('.cv');
    if (!cv || cv.firstChild) return;
    let cfg;
    try { cfg = JSON.parse(el.dataset.chart); } catch (e) { return; }
    const values = cfg.v;
    const W = Math.max(60, cv.clientWidth);
    const H = 160;
    const padY = 8;
    const h = H - 2 * padY;
    const mn = Math.min(...values), mx = Math.max(...values);
    const range = mx - mn === 0 ? 1 : mx - mn;
    let grid = '';
    for (let k = 0; k <= 3; k++) { const y = padY + (h * k) / 3; grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#20256A" stroke-width="1"/>`; }
    const padX = 7;
    const pts = values.map((v, i) => [values.length === 1 ? W / 2 : padX + ((W - 2 * padX) * i) / (values.length - 1), padY + h - (mx - mn === 0 ? 0.5 : (v - mn) / range) * h]);
    let body = '';
    if (pts.length > 1) {
      const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
      const area = `M${pts[0][0]},${H} ` + pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` L${pts[pts.length - 1][0]},${H} Z`;
      body += `<path d="${area}" fill="url(#cg)"/><path d="${line}" fill="none" stroke="url(#cl)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    pts.forEach((p, i) => {
      const pr = cfg.p[i] === true;
      body += `<circle cx="${p[0]}" cy="${p[1]}" r="5.5" fill="#0A0C33"/><circle cx="${p[0]}" cy="${p[1]}" r="${pr ? 4.5 : 3}" fill="${pr ? '#FFB547' : '#A982FF'}"/>`;
    });
    cv.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A3CFF" stop-opacity=".32"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/></linearGradient><linearGradient id="cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1FD1FF"/><stop offset=".5" stop-color="#8A3CFF"/><stop offset="1" stop-color="#FF2FC8"/></linearGradient></defs>${grid}
      <g style="transform-origin:0 ${H}px;animation:grow .7s cubic-bezier(.2,.7,.2,1) both">${body}</g></svg>`;
  });
}

/* ---------- Einheit bearbeiten ---------- */
function editSheet() {
  const ed = S.edit;
  if (!ed) return '';
  const h = D().history.find((x) => x.id === ed.id);
  return `${sheetTitle('Einheit bearbeiten', h ? `${h.planName ? h.planName + ' · ' : ''}${L.formatDate(h.start)}, ${L.formatTime(h.start)} Uhr` : null)}
    ${ed.exercises.map((e, ei) => `<div class="panel edit-ex mt10">
      <div class="hd"><div class="nm">${esc(e.name)}</div>${iconBtn('trash', 'Übung entfernen', 'editDelEx', { cls: 'ghost xs dng', attrs: ` data-ei="${ei}"` })}</div>
      <div class="edit-row faint" style="font-size:12px;text-align:center"><span></span><span>${L.exBwf(e) > 0 ? '+kg' : 'kg'}</span><span>Wdh.</span><span></span></div>
      ${e.sets.map((st, si) => `<div class="edit-row"><span class="sn">${si + 1}</span>
        <input class="numf" id="e-${ei}-${si}-kg" data-in="edit" data-ei="${ei}" data-si="${si}" data-kg="1" inputmode="decimal" autocomplete="off" placeholder="KG" value="${esc(st.kg)}" aria-label="Gewicht (leer = Körpergewicht)">
        <input class="numf" id="e-${ei}-${si}-reps" data-in="edit" data-ei="${ei}" data-si="${si}" data-kg="0" inputmode="numeric" autocomplete="off" value="${esc(st.reps)}" aria-label="Wiederholungen">
        ${iconBtn('remove', 'Satz entfernen', 'editDelSet', { cls: 'ghost xs', attrs: ` data-ei="${ei}" data-si="${si}"` })}</div>
        ${(st.drops || []).map((dr, di) => `<div class="edit-row drop"><span class="sn">${ic('drop', 15)}</span>
          <input class="numf sm" id="e-${ei}-${si}-${di}-dkg" data-in="editDrop" data-ei="${ei}" data-si="${si}" data-di="${di}" data-kg="1" inputmode="decimal" autocomplete="off" placeholder="KG" value="${esc(dr.kg)}" aria-label="Gewicht Drop">
          <input class="numf sm" id="e-${ei}-${si}-${di}-dreps" data-in="editDrop" data-ei="${ei}" data-si="${si}" data-di="${di}" data-kg="0" inputmode="numeric" autocomplete="off" value="${esc(dr.reps)}" aria-label="Wiederholungen Drop">
          ${iconBtn('close', 'Drop entfernen', 'editDelDrop', { cls: 'ghost xs', iconSize: 18, attrs: ` data-ei="${ei}" data-si="${si}" data-di="${di}"` })}</div>`).join('')}`).join('')}
      <button class="settool" data-a="editAddSet" data-ei="${ei}">${ic('add', 18)}Satz</button>
    </div>`).join('')}
    ${ed.exercises.length ? '' : '<div class="muted" style="font-size:14px">Keine Übungen mehr übrig.</div>'}
    <div class="faint" style="font-size:12.5px;margin-top:12px">Bestwerte werden nach dem Speichern automatisch neu berechnet.</div>
    <div class="row gap10" style="margin-top:16px">${secBtn('Abbrechen', 'closeSheet', null, { cls: 'grow' })}<div class="grow">${primaryBtn('Speichern', 'editSave')}</div></div>`;
}

/* ---------- Großer Pausen-Timer ---------- */
const RING_C = 2 * Math.PI * 46;
function bigTimerHtml() {
  const t = D().timer;
  if (!t) return '';
  const remMs = Math.max(0, t.end - S.now);
  const remSec = Math.floor((remMs + 999) / 1000);
  const frac = t.total > 0 ? Math.min(1, remMs / 1000 / t.total) : 0;
  return `<div class="bigtimer" data-a="bigTimerBg">
    <div class="ring"><svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1FD1FF"/><stop offset=".5" stop-color="#8A3CFF"/><stop offset="1" stop-color="#FF2FC8"/></linearGradient></defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#171B57" stroke-width="5"/>
      <circle id="bt-ring" cx="50" cy="50" r="46" fill="none" stroke="url(#rg)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C * (1 - frac)}" style="transition:stroke-dashoffset .25s linear"/></svg>
      <div class="t${remSec <= 5 ? ' ending' : ''}" id="bt-time">${timeText(remSec)}</div></div>
    <div class="lbl">Pause – gleich geht's weiter</div>
    <div class="keys"><button class="tkey" data-a="addTime" data-v="-30">−30</button><button class="tkey" data-a="addTime" data-v="-15">−15</button><button class="tkey" data-a="addTime" data-v="15">+15</button><button class="tkey" data-a="addTime" data-v="30">+30</button><button class="tkey" data-a="addTime" data-v="60">+1:00</button></div>
    <div class="close">${secBtn('Pause überspringen', 'stopTimer', 'skip')}</div>
    <button class="link-btn mt12 muted" data-a="bigTimerClose">Verkleinern</button>
  </div>`;
}
