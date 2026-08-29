/* =====================================================================
   Consumer feature layer, loaded after app.js.

   1. Deadline engine, month calendar and .ics export
   2. Escalating multi-channel reminders (mock delivery)
   3. Plain-language status translator
   4. Cost and fee tracker
   5. Bulk import

   Mock data only, no network calls.
   ===================================================================== */

/* ---- Statutory deadlines attached to the mock records --------------- */
const deadlineData = {
  '202441023841': { due: '2026-09-04', action: 'Reply to the First Examination Report', fee: 'fer_reply', extendableTo: '2026-12-04' },
  '202341079512': { due: '2027-11-23', action: 'Renewal fee for year 4', fee: 'patent_renewal', renewalYear: 4 },
  '202441015226': { due: '2026-09-02', action: 'Attend the controller hearing', fee: 'hearing' },
  '202341041908': { due: null, action: 'Awaiting the examination report', fee: null },
  '202241064701': { due: '2026-11-09', action: 'Renewal fee for year 5', fee: 'patent_renewal', renewalYear: 5 },
  '202441008913': { due: '2026-09-14', action: 'Request for examination, Form 18, 31 months from filing', fee: 'rfe' },
  '202241031366': { due: '2027-06-02', action: 'Renewal fee for year 6', fee: 'patent_renewal', renewalYear: 6 },
  '202341027104': { due: '2026-12-03', action: 'Request for examination, Form 18, 31 months from filing', fee: 'rfe' },
  '425107-001': { due: '2029-04-03', action: 'Extension of copyright in the design, Form 3', fee: 'design_renewal' },
  '412388-001': { due: '2026-09-12', action: 'Reply to the formalities objection', fee: 'design_reply' },
  '6817921': { due: '2026-10-18', action: 'Opposition window closes', fee: 'tm_opposition' },
  '6351204': { due: '2033-07-22', action: 'Trademark renewal, Form TM-R', fee: 'tm_renewal' },
  'GI-58': { due: '2026-10-16', action: 'Submit the GI examination response', fee: 'gi_reply' },
  'A-156232/2025': { due: null, action: 'No statutory deadline pending', fee: null }
};
patents.forEach((record) => Object.assign(record, deadlineData[record.id] || {}));

/* ---- 1. Deadline engine -------------------------------------------- */
const MS_DAY = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TIER_ORDER = ['overdue', 'critical', 'warning', 'soon', 'clear'];

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function parseISO(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function parseFiled(value) {
  const [day, month, year] = String(value).split(' ');
  const index = MONTHS.indexOf(month);
  return index < 0 ? null : new Date(Number(year), index, Number(day));
}
function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function formatDate(date) {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
function daysUntil(iso) {
  const target = parseISO(iso);
  return target ? Math.round((target - startOfToday()) / MS_DAY) : null;
}
/* Five bands drive every colour, sort order and reminder decision. */
function urgencyTier(days) {
  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days <= 15) return 'critical';
  if (days <= 45) return 'warning';
  if (days <= 90) return 'soon';
  return 'clear';
}
function countdownText(days) {
  if (days === null) return 'No deadline';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
}
function deadlineOf(record) {
  if (!record.due) return { days: null, tier: 'none', action: record.action };
  const days = daysUntil(record.due);
  return { days, tier: urgencyTier(days), date: parseISO(record.due), iso: record.due, action: record.action };
}
function liveDeadlines() {
  return patents
    .map((record) => ({ record, ...deadlineOf(record) }))
    .filter((item) => item.days !== null)
    .sort((a, b) => a.days - b.days);
}
function needsAttention() {
  return liveDeadlines().filter((item) => item.days <= 45);
}

/* ---- Calendar export: deadlines land in the user's own calendar ----- */
function icsBlock(item) {
  const stamp = toISO(item.date).replaceAll('-', '');
  const end = new Date(item.date.getTime() + MS_DAY);
  return [
    'BEGIN:VEVENT',
    `UID:${item.record.id.replace(/[^\w-]/g, '')}-${stamp}@patently`,
    `DTSTAMP:${toISO(startOfToday()).replaceAll('-', '')}T090000Z`,
    `DTSTART;VALUE=DATE:${stamp}`,
    `DTEND;VALUE=DATE:${toISO(end).replaceAll('-', '')}`,
    `SUMMARY:${item.action} - ${item.record.title}`,
    `DESCRIPTION:${item.record.type} ${item.record.id}. Status: ${item.record.status}. Tracked in Patently.`,
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${item.action} due in 7 days`,
    'END:VALARM',
    'END:VEVENT'
  ].join('\r\n');
}
function downloadICS(items, filename) {
  const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Patently//IP deadlines//EN', 'CALSCALE:GREGORIAN',
    ...items.map(icsBlock), 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ---- 2. Escalating reminders ---------------------------------------- */
const reminderDefaults = { channels: { email: true, whatsapp: true, sms: false }, leadDays: [90, 30, 7, 1] };
let reminderPrefs = reminderDefaults;
try {
  const saved = JSON.parse(localStorage.getItem('patentlyReminders'));
  if (saved) reminderPrefs = { channels: { ...reminderDefaults.channels, ...saved.channels }, leadDays: saved.leadDays || reminderDefaults.leadDays };
} catch { localStorage.removeItem('patentlyReminders'); }
function saveReminderPrefs() {
  localStorage.setItem('patentlyReminders', JSON.stringify(reminderPrefs));
}
const channelMeta = {
  email: { label: 'Email', icon: 'mail', when: 'Every reminder' },
  whatsapp: { label: 'WhatsApp', icon: 'chat', when: 'Final week only' },
  sms: { label: 'SMS', icon: 'sms', when: 'Final week only' }
};
/* Escalation rule: email carries every ping, WhatsApp and SMS join only
   inside the final week, when a missed deadline becomes irreversible. */
function channelsForLead(lead) {
  return Object.keys(channelMeta).filter((key) => reminderPrefs.channels[key] && (key === 'email' || lead <= 7));
}
function reminderSchedule(record) {
  const deadline = deadlineOf(record);
  if (deadline.days === null) return [];
  return [...reminderPrefs.leadDays].sort((a, b) => b - a).map((lead) => {
    const date = new Date(deadline.date.getTime() - lead * MS_DAY);
    return { lead, date, sent: date < startOfToday(), channels: channelsForLead(lead) };
  }).filter((ping) => ping.channels.length);
}
function previewReminders() {
  return patents.flatMap((record) => reminderSchedule(record)
    .filter((ping) => !ping.sent)
    .map((ping) => ({ ...ping, title: `${record.title} — ${ping.lead} day${ping.lead === 1 ? '' : 's'} before ${record.action.toLowerCase()}` })))
    .sort((a, b) => a.date - b.date)
    .slice(0, 6);
}

/* ---- 3. Plain-language status translator ---------------------------- */
const statusGuide = {
  'Under examination': {
    means: 'An examiner at the patent office is reading your application and comparing it with earlier publications.',
    ifIgnored: 'Nothing is lost yet, but the moment the examination report arrives the reply clock starts and it cannot be paused.',
    next: 'Keep your agent on standby and make sure the office holds a current email address for you.'
  },
  'Action needed': {
    means: 'The office has asked you for something specific and fixed a date by which it must reach them.',
    ifIgnored: 'The application is treated as abandoned. In most cases that decision is final and the fees already paid are lost.',
    next: 'Confirm the exact date below, then instruct your agent this week rather than in the final fortnight.'
  },
  Granted: {
    means: 'The patent is in force. You can stop others from making, using, selling or importing the invention in India.',
    ifIgnored: 'Missing a renewal fee lets the patent lapse. Restoration is possible for only 18 months and is never guaranteed.',
    next: 'Pay each annual renewal from year 3 onward. Every due date is already on the deadlines calendar.'
  },
  Published: {
    means: 'Your application is now public, but no examiner has looked at it. Publication is not examination.',
    ifIgnored: 'If Form 18 is not filed within 31 months of the earliest filing or priority date, the application is deemed withdrawn.',
    next: 'File the request for examination well before the 31-month date shown below.'
  },
  Registered: {
    means: 'The right is on the register and enforceable for its full term.',
    ifIgnored: 'The registration expires on its renewal date and the mark or design becomes available to everyone else.',
    next: 'Diarise the renewal. Nothing else is required in the meantime.'
  },
  'Accepted and advertised': {
    means: 'Your trademark cleared examination and is published in the journal so that others may object to it.',
    ifIgnored: 'If someone files an opposition and you do not answer within two months, the application is treated as abandoned.',
    next: 'Watch the journal until the opposition window closes on the date below.'
  },
  'Formalities check': {
    means: 'The office found a paperwork defect, such as a drawing, a form or a signature. It is not a problem with your idea.',
    ifIgnored: 'The application stops progressing towards registration and eventually lapses.',
    next: 'Correct the documents listed in the objection notice and refile before the date below.'
  }
};

/* ---- 4. Cost and fee tracker ---------------------------------------- */
const entityTypes = [
  { id: 0, label: 'Individual / startup', hint: 'Natural person, startup or educational institution' },
  { id: 1, label: 'Small entity', hint: 'MSME-registered small enterprise' },
  { id: 2, label: 'Large entity', hint: 'Every other applicant' }
];
let entityTier = Number(localStorage.getItem('patentlyEntity') ?? 0);
if (!entityTypes[entityTier]) entityTier = 0;
const feeSchedule = {
  fer_reply: { label: 'Reply to the FER', amount: [0, 0, 0], note: 'No official fee. An extension on Form 4 is charged per month.' },
  fer_extension: { label: 'Form 4 extension, per month', amount: [1000, 2500, 5000] },
  rfe: { label: 'Request for examination, Form 18', amount: [4400, 11000, 22000] },
  hearing: { label: 'Hearing attendance', amount: [0, 0, 0], note: 'No official fee. Professional charges may still apply.' },
  design_reply: { label: 'Reply to a formalities objection', amount: [0, 0, 0] },
  design_renewal: { label: 'Extension of copyright in a design, Form 3', amount: [2000, 6000, 8000] },
  tm_renewal: { label: 'Trademark renewal, Form TM-R, e-filing', amount: [9000, 9000, 9000] },
  tm_opposition: { label: 'Opposition window', amount: [0, 0, 0], note: 'No fee unless an opposition is filed against you.' },
  gi_reply: { label: 'GI examination response', amount: [0, 0, 0] },
  patent_renewal: { label: 'Patent renewal fee', amount: null }
};
/* Renewal fees rise in bands across the 20-year term. */
function renewalFee(year, tier = entityTier) {
  if (year < 3 || year > 20) return 0;
  const bands = [[6, [800, 2000, 4000]], [10, [2400, 6000, 12000]], [15, [4800, 12000, 24000]], [20, [8000, 20000, 40000]]];
  return bands.find(([last]) => year <= last)[1][tier];
}
function feeFor(record) {
  if (!record.fee) return null;
  const entry = feeSchedule[record.fee];
  const amount = entry.amount ? entry.amount[entityTier] : renewalFee(record.renewalYear || 3);
  return { label: entry.label, note: entry.note, amount };
}
function rupees(value) {
  return `₹${value.toLocaleString('en-IN')}`;
}
function feesDueWithin(days) {
  return liveDeadlines()
    .filter((item) => item.days >= 0 && item.days <= days)
    .reduce((total, item) => total + ((feeFor(item.record) || {}).amount || 0), 0);
}
/* Remaining cost of carrying a granted patent through to year 20. The fee
   for year N falls due on the anniversary that closes year N-1, so any
   anniversary already behind us has been paid and is dropped. */
function renewalProjection(record) {
  const filed = parseFiled(record.filed);
  if (!filed) return null;
  const rows = [];
  for (let year = 3; year <= 20; year += 1) {
    const dueOn = new Date(filed.getFullYear() + year - 1, filed.getMonth(), filed.getDate());
    if (dueOn >= startOfToday()) rows.push({ year, dueOn, amount: renewalFee(year) });
  }
  return rows.length ? { rows, total: rows.reduce((sum, row) => sum + row.amount, 0) } : null;
}

/* ---- Deadlines page -------------------------------------------------- */
let calendarCursor = startOfToday();
function renderDeadlineStats() {
  const live = liveDeadlines();
  const set = (id, value) => { const node = document.querySelector(id); if (node) node.textContent = value; };
  set('#deadlineOverdue', live.filter((item) => item.days < 0).length);
  set('#deadlineCritical', live.filter((item) => item.days >= 0 && item.days <= 15).length);
  set('#deadlineWarning', live.filter((item) => item.days >= 0 && item.days <= 45).length);
  set('#deadlineFees', rupees(feesDueWithin(365)));
  set('#navDeadlineCount', needsAttention().length);
}
function renderCalendar() {
  const grid = document.querySelector('#deadlineCalendar');
  if (!grid) return;
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  document.querySelector('#calendarLabel').textContent = `${MONTH_NAMES[month]} ${year}`;
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const byDay = new Map();
  liveDeadlines().forEach((item) => {
    if (item.date.getFullYear() !== year || item.date.getMonth() !== month) return;
    const bucket = byDay.get(item.date.getDate()) || [];
    bucket.push(item);
    byDay.set(item.date.getDate(), bucket);
  });
  const todayISO = toISO(startOfToday());
  const cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => `<span class="cal-head">${day}</span>`);
  for (let i = 0; i < offset; i += 1) cells.push('<span class="cal-cell is-empty"></span>');
  for (let day = 1; day <= total; day += 1) {
    const items = byDay.get(day) || [];
    const iso = toISO(new Date(year, month, day));
    const worst = items.reduce((tier, item) => (TIER_ORDER.indexOf(item.tier) < TIER_ORDER.indexOf(tier) ? item.tier : tier), 'clear');
    const tooltip = items.map((item) => `${item.action} — ${item.record.title}`).join(' | ');
    cells.push(`<button type="button" class="cal-cell${items.length ? ` has-events ${worst}` : ''}${iso === todayISO ? ' is-today' : ''}" data-day="${iso}"${items.length ? ` title="${tooltip}"` : ' disabled'}><span>${day}</span>${items.length ? '<i class="cal-dot"></i>' : ''}</button>`);
  }
  grid.innerHTML = cells.join('');
}
function renderUpcoming() {
  const list = document.querySelector('#deadlineList');
  if (!list) return;
  const items = liveDeadlines().filter((item) => item.days <= 400);
  list.innerHTML = items.length ? items.map((item) => {
    const fee = feeFor(item.record);
    return `<div class="deadline-item ${item.tier}" data-patent="${item.record.id}" role="button" tabindex="0">
      <div class="deadline-when"><strong>${String(item.date.getDate()).padStart(2, '0')}</strong><small>${MONTHS[item.date.getMonth()]} ${item.date.getFullYear()}</small></div>
      <div class="deadline-body">
        <strong>${item.action}</strong>
        <small>${item.record.title} &middot; ${item.record.type.toUpperCase()} ${item.record.id}</small>
        <div class="deadline-meta"><span class="tier-pill ${item.tier}">${countdownText(item.days)}</span>${fee && fee.amount ? `<span class="fee-pill">${rupees(fee.amount)} payable</span>` : ''}</div>
      </div>
      <button class="cal-add" type="button" data-ics="${item.record.id}" aria-label="Add ${item.record.title} to calendar" title="Add to calendar"><span class="material-symbols-outlined">event_available</span></button>
    </div>`;
  }).join('') : '<p class="deadline-empty">No deadlines in the next 12 months.</p>';
}
function renderEntityPicker() {
  const picker = document.querySelector('#entityPicker');
  if (!picker) return;
  picker.innerHTML = entityTypes.map((entity) => `<button type="button" class="entity-btn${entity.id === entityTier ? ' selected' : ''}" data-entity="${entity.id}" title="${entity.hint}">${entity.label}</button>`).join('');
}
function renderFeePanel() {
  const panel = document.querySelector('#feeBody');
  if (!panel) return;
  const rows = liveDeadlines()
    .filter((item) => item.days >= 0 && item.days <= 365)
    .map((item) => ({ item, fee: feeFor(item.record) }))
    .filter((row) => row.fee && row.fee.amount);
  const granted = patents
    .filter((record) => record.status === 'Granted')
    .map((record) => ({ record, projection: renewalProjection(record) }))
    .filter((row) => row.projection);
  const lifetime = granted.reduce((sum, row) => sum + row.projection.total, 0);
  panel.innerHTML = `
    <div class="fee-split">
      <div>
        <h3 class="fee-subhead">Official fees due in the next 12 months</h3>
        ${rows.length ? `<table class="fee-table"><tbody>${rows.map(({ item, fee }) => `
          <tr><td><strong>${fee.label}</strong><small>${item.record.title}</small></td><td class="fee-date">${formatDate(item.date)}</td><td class="fee-amount">${rupees(fee.amount)}</td></tr>`).join('')}
          <tr class="fee-total"><td>Total payable</td><td></td><td class="fee-amount">${rupees(rows.reduce((sum, row) => sum + row.fee.amount, 0))}</td></tr>
        </tbody></table>` : '<p class="fee-none">No official fees fall due in the next 12 months.</p>'}
      </div>
      <div>
        <h3 class="fee-subhead">Cost of keeping your granted patents alive to year 20</h3>
        <div class="projection">
          ${granted.map(({ record, projection }) => `
            <div class="projection-row">
              <div><strong>${record.title}</strong><small>Next renewal ${formatDate(projection.rows[0].dueOn)} &middot; ${projection.rows.length} payment${projection.rows.length === 1 ? '' : 's'} left</small></div>
              <span>${rupees(projection.total)}</span>
            </div>`).join('')}
          <div class="projection-row is-total"><div><strong>Lifetime maintenance cost</strong><small>At the ${entityTypes[entityTier].label.toLowerCase()} rate</small></div><span>${rupees(lifetime)}</span></div>
        </div>
      </div>
    </div>
    <p class="fee-note"><span class="material-symbols-outlined">info</span> Indicative e-filing fees under the First Schedule to the Patents Rules and the Trade Marks Rules. Confirm the current amount on the <a href="https://ipindia.gov.in/fee-structure.htm" target="_blank" rel="noopener">official fee page</a> before paying.</p>`;
}
function renderDeadlinesPage() {
  renderDeadlineStats();
  renderCalendar();
  renderUpcoming();
  renderEntityPicker();
  renderFeePanel();
}

/* ---- Reminder settings dialog --------------------------------------- */
const leadOptions = [90, 60, 30, 14, 7, 3, 1];
function renderReminderDialog() {
  const body = document.querySelector('#reminderBody');
  if (!body) return;
  const preview = previewReminders();
  body.innerHTML = `
    <fieldset class="reminder-group">
      <legend>Where should we reach you?</legend>
      ${Object.entries(channelMeta).map(([key, meta]) => `
        <label class="toggle-row"><span class="material-symbols-outlined">${meta.icon}</span>
          <span class="toggle-copy"><strong>${meta.label}</strong><small>${meta.when}</small></span>
          <input type="checkbox" data-channel="${key}"${reminderPrefs.channels[key] ? ' checked' : ''} /></label>`).join('')}
    </fieldset>
    <fieldset class="reminder-group">
      <legend>How far ahead?</legend>
      <div class="lead-chips">${leadOptions.map((lead) => `<button type="button" class="chip lead-chip${reminderPrefs.leadDays.includes(lead) ? ' selected' : ''}" data-lead="${lead}">${lead} days</button>`).join('')}</div>
      <p class="reminder-hint">Reminders escalate as the date closes in: email throughout, then WhatsApp and SMS in the last seven days.</p>
    </fieldset>
    <div class="reminder-preview">
      <h4>Next reminders across your portfolio</h4>
      ${preview.length ? preview.map((ping) => `
        <div class="preview-row"><span class="preview-date">${formatDate(ping.date)}</span><span class="preview-title">${ping.title}</span>
          <span class="preview-channels">${ping.channels.map((key) => `<i class="material-symbols-outlined" title="${channelMeta[key].label}">${channelMeta[key].icon}</i>`).join('')}</span></div>`).join('')
        : '<p class="fee-none">Select at least one channel and one lead time to schedule reminders.</p>'}
    </div>
    <p class="reminder-foot"><span class="material-symbols-outlined">science</span> Delivery is simulated in this MVP. The schedule above is exactly what the backend will send once SMTP and the messaging provider are connected.</p>`;
}

/* ---- 5. Bulk import -------------------------------------------------- */
const typeAliases = {
  patent: 'Patent', design: 'Design', trademark: 'Trademark', tm: 'Trademark',
  gi: 'Geographical indication', 'geographical indication': 'Geographical indication', copyright: 'Copyright'
};
/* Accepts "number, title, type" per line, with or without a CSV header. */
function parseBulk(text) {
  const rows = [];
  const errors = [];
  text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line, index) => {
    if (index === 0 && /application|number/i.test(line) && /title/i.test(line)) return;
    const [id, title, type] = line.split(/\s*[,;\t]\s*/);
    if (!id || !title) {
      errors.push(`Line ${index + 1}: needs at least an application number and a title.`);
      return;
    }
    if (patents.some((record) => record.id === id) || rows.some((row) => row.id === id)) {
      errors.push(`Line ${index + 1}: ${id} is already in your portfolio.`);
      return;
    }
    rows.push({ id, title, type: typeAliases[String(type || 'patent').toLowerCase()] || 'Patent' });
  });
  return { rows, errors };
}
function importRows(rows) {
  const stamp = formatDate(startOfToday());
  [...rows].reverse().forEach((row) => {
    patents.unshift({
      id: row.id, type: row.type, title: row.title, status: 'Published',
      filed: stamp, updated: 'Just now', next: 'Awaiting examination',
      due: null, action: 'Confirm the next deadline on the official portal', fee: null,
      timeline: [[stamp, 'Imported into your portfolio']]
    });
  });
}

/* ---- Wiring ---------------------------------------------------------- */
const on = (selector, event, handler) => document.querySelector(selector)?.addEventListener(event, handler);

on('#calendarPrev', 'click', () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  renderCalendar();
});
on('#calendarNext', 'click', () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  renderCalendar();
});
on('#calendarToday', 'click', () => {
  calendarCursor = startOfToday();
  renderCalendar();
});
on('#deadlineCalendar', 'click', (event) => {
  const cell = event.target.closest('[data-day]');
  if (!cell) return;
  const match = liveDeadlines().find((item) => item.iso === cell.dataset.day);
  if (match) openPatent(match.record);
});
on('#deadlineList', 'click', (event) => {
  const ics = event.target.closest('[data-ics]');
  if (ics) {
    const match = liveDeadlines().find((item) => item.record.id === ics.dataset.ics);
    if (match) downloadICS([match], `patently-${match.record.id.replace(/[^\w-]/g, '')}.ics`);
    return;
  }
  const row = event.target.closest('[data-patent]');
  if (row) openPatent(patents.find((record) => record.id === row.dataset.patent));
});
on('#deadlineList', 'keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const row = event.target.closest('[data-patent]');
  if (!row) return;
  event.preventDefault();
  openPatent(patents.find((record) => record.id === row.dataset.patent));
});
on('#exportIcs', 'click', () => downloadICS(liveDeadlines(), 'patently-deadlines.ics'));
on('#entityPicker', 'click', (event) => {
  const button = event.target.closest('[data-entity]');
  if (!button) return;
  entityTier = Number(button.dataset.entity);
  localStorage.setItem('patentlyEntity', entityTier);
  renderEntityPicker();
  renderFeePanel();
  renderDeadlineStats();
  renderUpcoming();
  const dialog = document.querySelector('#patentDialog');
  if (openRecordId && dialog.open) openPatent(patents.find((record) => record.id === openRecordId));
});

/* The attention list, the record dialog and the deadlines page all render
   these controls dynamically, so they are handled by delegation. */
const reminderDialog = document.querySelector('#reminderDialog');
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-open-reminders]')) {
    renderReminderDialog();
    reminderDialog.showModal();
    return;
  }
  const ics = event.target.closest('#patentDialog [data-ics]');
  if (ics) {
    const match = liveDeadlines().find((item) => item.record.id === ics.dataset.ics);
    if (match) downloadICS([match], `patently-${match.record.id.replace(/[^\w-]/g, '')}.ics`);
    return;
  }
  const attention = event.target.closest('#attentionList [data-patent]');
  if (attention) openPatent(patents.find((record) => record.id === attention.dataset.patent));
});
document.querySelector('#attentionList')?.addEventListener('keydown', (event) => {
  const row = event.target.closest('[data-patent]');
  if (!row || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  openPatent(patents.find((record) => record.id === row.dataset.patent));
});
on('#reminderClose', 'click', () => reminderDialog.close());
reminderDialog?.addEventListener('change', (event) => {
  const key = event.target.dataset.channel;
  if (!key) return;
  reminderPrefs.channels[key] = event.target.checked;
  saveReminderPrefs();
  renderReminderDialog();
});
reminderDialog?.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-lead]');
  if (!chip) return;
  const lead = Number(chip.dataset.lead);
  reminderPrefs.leadDays = reminderPrefs.leadDays.includes(lead)
    ? reminderPrefs.leadDays.filter((value) => value !== lead)
    : [...reminderPrefs.leadDays, lead];
  saveReminderPrefs();
  renderReminderDialog();
});

const bulkInput = document.querySelector('#bulkText');
const bulkStatus = document.querySelector('#bulkStatus');
function previewBulk() {
  const { rows, errors } = parseBulk(bulkInput.value);
  bulkStatus.className = `bulk-status${errors.length ? ' has-errors' : ''}`;
  bulkStatus.innerHTML = bulkInput.value.trim()
    ? `<strong>${rows.length} record${rows.length === 1 ? '' : 's'} ready to import.</strong>${errors.length ? `<ul>${errors.map((error) => `<li>${error}</li>`).join('')}</ul>` : ''}`
    : '';
}
on('#addTabs', 'click', (event) => {
  const tab = event.target.closest('[data-add-tab]');
  if (!tab) return;
  const mode = tab.dataset.addTab;
  document.querySelectorAll('[data-add-tab]').forEach((item) => item.classList.toggle('selected', item === tab));
  document.querySelectorAll('[data-add-pane]').forEach((pane) => { pane.hidden = pane.dataset.addPane !== mode; });
  document.querySelector('#addDialog').classList.toggle('is-bulk', mode === 'bulk');
});
on('#bulkFile', 'change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  bulkInput.value = await file.text();
  event.target.value = '';
  previewBulk();
});
on('#bulkText', 'input', previewBulk);
on('#bulkSample', 'click', () => {
  bulkInput.value = ['application number, title, type',
    '202541003377, Adaptive Wind Turbine Pitch Control, patent',
    '202541009120, Recyclable Thermal Insulation Panel, patent',
    '441902-001, Foldable Solar Lantern Housing, design',
    '7104882, VERDANTA, trademark'].join('\n');
  previewBulk();
});
on('#bulkForm', 'submit', (event) => {
  event.preventDefault();
  const { rows } = parseBulk(bulkInput.value);
  if (!rows.length) {
    bulkStatus.className = 'bulk-status has-errors';
    bulkStatus.innerHTML = '<strong>Nothing to import. Add at least one line of "number, title, type".</strong>';
    return;
  }
  importRows(rows);
  bulkInput.value = '';
  bulkStatus.innerHTML = '';
  document.querySelector('#addDialog').close();
  refreshAll();
});

/* Redraw everything that depends on the mock data set. */
function refreshAll() {
  renderTypeCounts();
  renderStats();
  renderPatents();
  renderAttention();
  renderDeadlinesPage();
}
refreshAll();
