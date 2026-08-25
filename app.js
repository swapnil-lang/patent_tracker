const patents = [
  { id: '202441023841', type: 'Patent', title: 'A System for Adaptive Solar Energy Forecasting', status: 'Under examination', filed: '18 Apr 2024', updated: 'Today', next: 'FER response due 04 Sep', urgent: true, timeline: [['25 Aug 2026', 'First Examination Report issued'], ['12 Jun 2025', 'Application published'], ['18 Apr 2024', 'Application filed']] },
  { id: '202341079512', type: 'Patent', title: 'Low-Carbon Cement Composition and Method', status: 'Granted', filed: '23 Nov 2023', updated: '22 Aug', next: 'Renewal due Nov 2027', timeline: [['22 Aug 2026', 'Patent certificate made available'], ['05 Aug 2026', 'Patent granted'], ['23 May 2025', 'Application published']] },
  { id: '202441015226', type: 'Patent', title: 'Computer Vision for Crop Disease Classification', status: 'Action needed', filed: '12 Mar 2024', updated: '20 Aug', next: 'Hearing: 02 Sep 2026', urgent: true, timeline: [['20 Aug 2026', 'Hearing notice received'], ['10 Jan 2026', 'Reply to FER submitted'], ['12 Mar 2024', 'Application filed']] },
  { id: '202341041908', type: 'Patent', title: 'Secure Transaction Layer for Edge Devices', status: 'Under examination', filed: '21 Jun 2023', updated: '18 Aug', next: 'Awaiting examination', timeline: [['18 Aug 2026', 'Request for examination processed'], ['21 Dec 2024', 'Application published'], ['21 Jun 2023', 'Application filed']] },
  { id: '202241064701', type: 'Patent', title: 'Wearable Hydration Monitoring Device', status: 'Granted', filed: '09 Nov 2022', updated: '15 Aug', next: 'Renewal due Nov 2026', timeline: [['15 Aug 2026', 'Renewal reminder created'], ['29 Jul 2025', 'Patent granted'], ['09 Nov 2022', 'Application filed']] },
  { id: '202441008913', type: 'Patent', title: 'Modular Battery Cooling Architecture', status: 'Published', filed: '14 Feb 2024', updated: '09 Aug', next: 'Awaiting examination', timeline: [['09 Aug 2026', 'Application published'], ['14 Feb 2024', 'Application filed']] },
  { id: '202241031366', type: 'Patent', title: 'Biodegradable Packaging Film', status: 'Granted', filed: '02 Jun 2022', updated: '02 Aug', next: 'No action required', timeline: [['02 Aug 2026', 'Status verified: granted'], ['18 Jan 2025', 'Patent granted'], ['02 Jun 2022', 'Application filed']] },
  { id: '202341027104', type: 'Patent', title: 'Method for Water Quality Prediction', status: 'Under examination', filed: '03 May 2023', updated: '28 Jul', next: 'Awaiting examination', timeline: [['28 Jul 2026', 'Examination request queued'], ['10 Nov 2024', 'Application published'], ['03 May 2023', 'Application filed']] },
  { id: '425107-001', type: 'Design', title: 'Ergonomic Insulated Beverage Container', status: 'Registered', filed: '03 Apr 2024', updated: '19 Aug', next: 'Renewal due Apr 2029', timeline: [['19 Aug 2026', 'Design registration certificate issued'], ['04 Jul 2025', 'Design registered'], ['03 Apr 2024', 'Design application filed']] },
  { id: '412388-001', type: 'Design', title: 'Compact Air Purifier Housing', status: 'Formalities check', filed: '14 Oct 2024', updated: '21 Aug', next: 'Reply to objections due 12 Sep', urgent: true, timeline: [['21 Aug 2026', 'Formalities objection received'], ['14 Oct 2024', 'Design application filed']] },
  { id: '6817921', type: 'Trademark', title: 'NOVALYTICA', status: 'Accepted and advertised', filed: '09 Jan 2024', updated: '23 Aug', next: 'Opposition window ends 18 Oct', timeline: [['23 Aug 2026', 'Mark accepted and advertised'], ['09 Jan 2024', 'Trademark application filed']] },
  { id: '6351204', type: 'Trademark', title: 'AQUASENSE', status: 'Registered', filed: '22 Jul 2023', updated: '07 Aug', next: 'Renewal due Jul 2033', timeline: [['07 Aug 2026', 'Trademark registered'], ['22 Jul 2023', 'Trademark application filed']] },
  { id: 'GI-58', type: 'Geographical indication', title: 'Mysore Rosewood Inlay', status: 'Under examination', filed: '12 Feb 2024', updated: '16 Aug', next: 'Submit examination response', urgent: true, timeline: [['16 Aug 2026', 'Examination report received'], ['12 Feb 2024', 'GI application filed']] },
  { id: 'A-156232/2025', type: 'Copyright', title: 'AquaSense Analytics Platform', status: 'Registered', filed: '17 Sep 2025', updated: '12 Aug', next: 'No action required', timeline: [['12 Aug 2026', 'Copyright registration recorded'], ['17 Sep 2025', 'Copyright application filed']] }
];

const demoUser = { name: 'Aarav Khanna', role: 'Founder, Novalytica', email: 'aarav@novalytica.in' };
const uploadedDocuments = new Map();
let openRecordId = null;

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = theme;
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.textContent = isDark ? 'light_mode' : 'dark_mode';
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  });
}
function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('patentlyTheme', nextTheme);
  applyTheme(nextTheme);
}

function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}
function showSignedInUser(user) {
  document.querySelector('#userName').textContent = user.name;
  document.querySelector('#userRole').textContent = user.role;
  document.querySelector('#userInitials').textContent = initials(user.name);
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  document.querySelector('.hero h1').textContent = `Good ${part}, ${user.name.split(' ')[0]}.`;
}
function setAuthState(user) {
  document.body.classList.remove('auth-pending', 'logged-in', 'logged-out');
  if (user) {
    sessionStorage.setItem('patentlyDemoUser', JSON.stringify(user));
    showSignedInUser(user);
    document.body.classList.add('logged-in');
  } else {
    sessionStorage.removeItem('patentlyDemoUser');
    document.body.classList.add('logged-out');
  }
}
function signInFromForm() {
  const email = document.querySelector('#loginEmail').value.trim();
  const password = document.querySelector('#loginPassword').value;
  const error = document.querySelector('#loginError');
  if (!email || !password || !document.querySelector('#loginEmail').checkValidity()) {
    error.textContent = 'Enter a valid email address and password to continue.';
    return;
  }
  const localPart = email.split('@')[0].replace(/[._-]/g, ' ');
  const name = localPart.replace(/\b\w/g, (letter) => letter.toUpperCase());
  setAuthState({ name, role: 'Patent portfolio owner', email });
}

let activeFilter = 'All';
const table = document.querySelector('#patentTable');
const search = document.querySelector('#portfolioSearch');
const statusFilter = document.querySelector('#statusFilter');
const yearFilter = document.querySelector('#yearFilter');
const typeFilter = document.querySelector('#typeFilter');

function slug(status) { return status.toLowerCase().replaceAll(' ', '-'); }
function mockDocuments(record) {
  const common = [
    { name: 'Application filing receipt', date: record.filed, format: 'PDF', icon: 'receipt_long' },
    { name: 'Application form and supporting documents', date: record.filed, format: 'PDF', icon: 'description' }
  ];
  const documentsByStatus = {
    'Under examination': { name: 'Examination report', date: record.updated, format: 'PDF', icon: 'fact_check' },
    'Action needed': { name: 'Hearing notice', date: record.updated, format: 'PDF', icon: 'notification_important' },
    'Granted': { name: 'Patent certificate', date: record.updated, format: 'PDF', icon: 'workspace_premium' },
    'Registered': { name: `${record.type} registration certificate`, date: record.updated, format: 'PDF', icon: 'verified' },
    'Accepted and advertised': { name: 'Journal advertisement', date: record.updated, format: 'PDF', icon: 'newspaper' },
    'Formalities check': { name: 'Formalities objection notice', date: record.updated, format: 'PDF', icon: 'warning' },
    'Published': { name: 'Publication journal extract', date: record.updated, format: 'PDF', icon: 'menu_book' }
  };
  return [...common, documentsByStatus[record.status], ...(uploadedDocuments.get(record.id) || [])].filter(Boolean);
}
function filteredPatents() {
  const term = search.value.trim().toLowerCase();
  return patents.filter((patent) => {
    const matchesFilter = activeFilter === 'All' || patent.status === activeFilter;
    const matchesYear = yearFilter.value === 'All' || patent.filed.endsWith(yearFilter.value);
    const matchesType = typeFilter.value === 'All' || patent.type === typeFilter.value;
    const matchesTerm = `${patent.id} ${patent.title} ${patent.type}`.toLowerCase().includes(term);
    return matchesFilter && matchesYear && matchesType && matchesTerm;
  });
}
function renderTypeCounts() {
  document.querySelectorAll('.type-card').forEach((card) => {
    const type = card.dataset.type;
    const count = type === 'All' ? patents.length : patents.filter((patent) => patent.type === type).length;
    card.querySelector('b').textContent = count;
    const noun = card.dataset.noun || (card.dataset.noun = card.querySelector('small').textContent.replace(/^\d+\s*/, ''));
    card.querySelector('small').textContent = `${count} ${noun}`;
  });
  document.querySelector('.nav-link[href="#portfolio"] b').textContent = patents.length;
}
function renderGreeting() {
  const now = new Date();
  document.querySelector('#heroDate').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  const hour = now.getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const heading = document.querySelector('.hero h1');
  heading.textContent = heading.textContent.replace(/Good (morning|afternoon|evening)/, `Good ${part}`);
}
function renderStats() {
  document.querySelector('#statTotal').innerHTML = `${patents.length} <small>IP records</small>`;
  document.querySelector('#statUrgent').textContent = patents.filter((patent) => patent.urgent).length;
  document.querySelector('#statGranted').textContent = patents.filter((patent) => patent.status === 'Granted' || patent.status === 'Registered').length;
}
function renderFilterSummary(shown) {
  const summary = document.querySelector('#filterSummary');
  const active = [];
  if (typeFilter.value !== 'All') active.push({ label: typeFilter.options[typeFilter.selectedIndex].textContent, clear: 'type' });
  if (activeFilter !== 'All') active.push({ label: activeFilter, clear: 'status' });
  if (yearFilter.value !== 'All') active.push({ label: `Filed in ${yearFilter.value}`, clear: 'year' });
  const term = search.value.trim();
  if (term) active.push({ label: `“${term}”`, clear: 'search' });
  summary.classList.toggle('is-filtered', active.length > 0);
  summary.innerHTML = `
    <span class="summary-count"><b>${shown}</b> of ${patents.length} records</span>
    ${active.map((item) => `<button class="active-filter" type="button" data-clear="${item.clear}">${item.label}<span class="material-symbols-outlined">close</span></button>`).join('')}
    ${active.length ? '<button class="clear-all" type="button" data-clear="all">Clear all</button>' : ''}`;
}
function renderPatents() {
  const list = filteredPatents();
  document.querySelector('#resultCount').textContent = list.length;
  renderFilterSummary(list.length);
  table.innerHTML = list.length ? list.map((patent) => `
    <tr class="record-row" data-patent="${patent.id}" tabindex="0" role="button" aria-label="Open ${patent.title}">
      <td class="application"><strong>${patent.title}</strong><small>${patent.type.toUpperCase()} ${patent.id}</small></td>
      <td data-label="IP type"><span class="type-tag ${slug(patent.type)}">${patent.type}</span></td>
      <td data-label="Status"><span class="status ${slug(patent.status)}">${patent.status}</span></td>
      <td class="date" data-label="Filed">${patent.filed}</td><td class="date" data-label="Last update">${patent.updated}</td>
      <td class="next-action ${patent.urgent ? 'urgent' : ''}" data-label="Next action">${patent.next}</td>
      <td class="row-action"><button class="row-btn" data-patent="${patent.id}" aria-label="View ${patent.title}">→</button></td>
    </tr>`).join('') : `<tr><td colspan="7" class="empty"><span class="material-symbols-outlined">search_off</span>No records match those filters.<button class="clear-all" type="button" data-clear="all">Clear all filters</button></td></tr>`;
  table.closest('.table-wrap').classList.remove('just-changed');
  void table.offsetWidth;
  table.closest('.table-wrap').classList.add('just-changed');
}
function openPatent(patent) {
  openRecordId = patent.id;
  const documents = mockDocuments(patent);
  document.querySelector('#dialogContent').innerHTML = `
    <div class="detail-header"><span class="type-tag ${slug(patent.type)}">${patent.type}</span> <span class="status ${slug(patent.status)}">${patent.status}</span><h2>${patent.title}</h2><p>${patent.type.toUpperCase()} RECORD NO. ${patent.id}</p></div>
    <div class="detail-content"><div class="detail-meta"><div><small>FILED</small><strong>${patent.filed}</strong></div><div><small>LAST UPDATED</small><strong>${patent.updated}</strong></div><div><small>NEXT ACTION</small><strong>${patent.next}</strong></div></div><h3 class="timeline-title">Application timeline</h3>${patent.timeline.map(([date, event]) => `<div class="timeline-item"><strong>${event}</strong><small>${date}</small></div>`).join('')}<div class="documents-heading"><h3 class="timeline-title">Documents <span>${documents.length}</span></h3><button class="upload-doc-btn" type="button" data-action="upload-document"><span class="material-symbols-outlined">upload_file</span> Upload</button><input class="document-file-input" id="documentFileInput" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" /></div><p class="upload-hint">PDF, DOC, DOCX, PNG or JPG up to 10 MB</p><div class="record-documents">${documents.map((document) => `<div class="record-document"><span class="document-icon material-symbols-outlined">${document.icon}</span><div><strong>${document.name}</strong><small>${document.format} · ${document.date}${document.uploaded ? ' · Uploaded by you' : ''}</small></div><button class="download-doc material-symbols-outlined" type="button" data-document="${document.name}" aria-label="Download ${document.name}">download</button></div>`).join('')}</div></div>`;
  const dialog = document.querySelector('#patentDialog');
  if (!dialog.open) dialog.showModal();
}
function renderAttention() {
  const attention = patents.filter((patent) => patent.urgent);
  document.querySelector('#attentionList').innerHTML = attention.map((patent) => `<div class="attention-item"><div class="attention-icon">!</div><div><strong>${patent.title}</strong><small>IN ${patent.id} · ${patent.next}</small></div><span class="due-tag">ACTION REQUIRED</span></div>`).join('');
}
function renderActivity() {
  const activity = [
    ['First Examination Report issued', 'A System for Adaptive Solar Energy Forecasting', 'Today, 10:42 AM'],
    ['Patent granted', 'Low-Carbon Cement Composition and Method', '22 Aug, 3:10 PM'],
    ['Hearing notice received', 'Computer Vision for Crop Disease Classification', '20 Aug, 9:08 AM']
  ];
  document.querySelector('#activityList').innerHTML = activity.map(([event, title, time]) => `<div class="activity"><span class="activity-dot"></span><div><p><b>${event}</b> for ${title}</p><time>${time}</time></div></div>`).join('');
}

document.querySelector('#filterChips').addEventListener('click', (event) => {
  if (!event.target.matches('.chip')) return;
  activeFilter = event.target.dataset.filter;
  statusFilter.value = activeFilter;
  document.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('selected', chip === event.target));
  renderPatents();
});
search.addEventListener('input', renderPatents);
statusFilter.addEventListener('change', () => {
  activeFilter = statusFilter.value;
  document.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('selected', chip.dataset.filter === activeFilter));
  renderPatents();
});
yearFilter.addEventListener('change', renderPatents);
typeFilter.addEventListener('change', () => { document.querySelectorAll('.type-card').forEach((card) => card.classList.toggle('selected', card.dataset.type === typeFilter.value)); renderPatents(); });
document.querySelector('.ip-types').addEventListener('click', (event) => {
  const card = event.target.closest('.type-card');
  if (!card) return;
  typeFilter.value = card.dataset.type;
  document.querySelectorAll('.type-card').forEach((item) => item.classList.toggle('selected', item === card));
  renderPatents();
});
function openRecordFromElement(element) {
  const record = element.closest('[data-patent]');
  if (!record) return;
  openPatent(patents.find((patent) => patent.id === record.dataset.patent));
}
table.addEventListener('click', (event) => openRecordFromElement(event.target));
table.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openRecordFromElement(event.target);
  }
});
document.querySelector('#patentDialog').addEventListener('click', (event) => {
  if (event.target.closest('[data-action="upload-document"]')) {
    document.querySelector('#documentFileInput').click();
    return;
  }
  const documentName = event.target.dataset.document;
  if (documentName) window.alert(`${documentName} is a mock document in this MVP.`);
});
document.querySelector('#patentDialog').addEventListener('change', (event) => {
  if (event.target.id !== 'documentFileInput' || !event.target.files.length || !openRecordId) return;
  const file = event.target.files[0];
  if (file.size > 10 * 1024 * 1024) {
    window.alert('Please choose a document smaller than 10 MB.');
    event.target.value = '';
    return;
  }
  const extension = file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE';
  const recordFiles = uploadedDocuments.get(openRecordId) || [];
  recordFiles.unshift({ name: file.name, date: 'Just now', format: extension, icon: 'upload_file', uploaded: true });
  uploadedDocuments.set(openRecordId, recordFiles);
  openPatent(patents.find((patent) => patent.id === openRecordId));
});
document.querySelector('#dialogClose').addEventListener('click', () => document.querySelector('#patentDialog').close());
document.querySelector('#addPatentBtn').addEventListener('click', () => document.querySelector('#addDialog').showModal());
document.querySelector('#addClose').addEventListener('click', () => document.querySelector('#addDialog').close());
document.querySelector('#addPatentForm').addEventListener('submit', (event) => {
  event.preventDefault(); const fields = event.currentTarget.querySelectorAll('input');
  patents.unshift({ id: fields[0].value, type: 'Patent', title: fields[1].value, status: 'Published', filed: 'Today', updated: 'Just now', next: 'Awaiting examination', timeline: [['25 Aug 2026', 'Added to your portfolio']] });
  event.currentTarget.reset(); document.querySelector('#addDialog').close(); activeFilter = 'All'; statusFilter.value = 'All'; yearFilter.value = 'All'; typeFilter.value = 'All'; document.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('selected', chip.dataset.filter === 'All')); document.querySelectorAll('.type-card').forEach((card) => card.classList.toggle('selected', card.dataset.type === 'All')); renderTypeCounts(); renderStats(); renderPatents(); showPage('portfolio');
});
document.querySelector('#markRead').addEventListener('click', (event) => { event.target.textContent = 'All caught up'; document.querySelector('.alert-count').textContent = '0'; });
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); } });
document.querySelector('#loginForm').addEventListener('submit', (event) => { event.preventDefault(); signInFromForm(); });
document.querySelector('#demoLogin').addEventListener('click', () => {
  document.querySelector('#loginEmail').value = demoUser.email;
  document.querySelector('#loginPassword').value = 'demo-password';
  setAuthState(demoUser);
});
document.querySelector('#passwordToggle').addEventListener('click', (event) => {
  const input = document.querySelector('#loginPassword');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  event.currentTarget.textContent = isHidden ? 'visibility_off' : 'visibility';
  event.currentTarget.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});
document.querySelector('#logoutBtn').addEventListener('click', () => {
  document.querySelector('#loginForm').reset();
  document.querySelector('#loginError').textContent = '';
  setAuthState(null);
});
document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', toggleTheme));
const savedTheme = localStorage.getItem('patentlyTheme');
applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
let savedUser = null;
try { savedUser = JSON.parse(sessionStorage.getItem('patentlyDemoUser')); } catch { sessionStorage.removeItem('patentlyDemoUser'); }
setAuthState(savedUser);
renderGreeting(); renderTypeCounts(); renderStats(); renderPatents(); renderAttention(); renderActivity();

function syncFilterUI() {
  document.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('selected', chip.dataset.filter === activeFilter));
  document.querySelectorAll('.type-card').forEach((card) => card.classList.toggle('selected', card.dataset.type === typeFilter.value));
}
function clearFilter(which) {
  if (which === 'all' || which === 'type') typeFilter.value = 'All';
  if (which === 'all' || which === 'status') { activeFilter = 'All'; statusFilter.value = 'All'; }
  if (which === 'all' || which === 'year') yearFilter.value = 'All';
  if (which === 'all' || which === 'search') search.value = '';
  syncFilterUI();
  renderPatents();
}
document.querySelector('#filterSummary').addEventListener('click', (event) => {
  const button = event.target.closest('[data-clear]');
  if (button) clearFilter(button.dataset.clear);
});
table.addEventListener('click', (event) => {
  const button = event.target.closest('[data-clear]');
  if (button) clearFilter(button.dataset.clear);
});

const sidebar = document.querySelector('#sidebar');
const navScrim = document.querySelector('#navScrim');
const menuBtn = document.querySelector('#menuBtn');
function setNav(open) {
  document.body.classList.toggle('nav-open', open);
  navScrim.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'close' : 'menu';
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
navScrim.addEventListener('click', () => setNav(false));
sidebar.addEventListener('click', (event) => { if (event.target.closest('.nav-link')) setNav(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setNav(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 900) setNav(false); });

const IPO = 'https://ipindia.gov.in/pages/home/acts-rules-ipr';
const filingSteps = [
  { title: 'What can be patented?', tag: 'Eligibility', icon: 'lightbulb', points: [
    'A product or process',
    'Must be new',
    'Must involve an inventive step (non-obvious)',
    'Capable of industrial application',
    `Must not fall under the statutory exclusions (<a href="${IPO}" target="_blank" rel="noopener">sections 3 and 4</a>)`
  ] },
  { title: 'Before you file', tag: 'Preparation', icon: 'search', points: [
    'Conduct a preliminary search for novelty and obviousness',
    'Use free databases like <a href="https://iprsearch.ipindia.gov.in/publicsearch" target="_blank" rel="noopener">InPASS</a>, <a href="https://patentscope.wipo.int/" target="_blank" rel="noopener">Patentscope</a> or <a href="https://worldwide.espacenet.com/" target="_blank" rel="noopener">Espacenet</a>',
    'Prepare a draft specification',
    'Review the specification to refine your draft',
    'Seek professional help if required'
  ] },
  { title: 'Who can file?', tag: 'Applicant', icon: 'person', points: [
    'The true and first inventor',
    'The assignee of the inventor',
    'A legal representative, where the inventor is deceased'
  ] },
  { title: 'Where to file', tag: 'Jurisdiction', icon: 'location_on', groups: [
    { label: 'Depends on', items: ['Residence of the applicant', 'Place of business', 'Domicile', 'Place of origin of the invention'] },
    { label: 'Patent offices', items: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'] }
  ] },
  { title: 'How to file', tag: 'Submission', icon: 'upload_file', points: [
    'Physical filing, by post or in person',
    'E-filing — recommended, with a concessional fee',
    'Refer to the First Schedule for the prescribed fees'
  ] },
  { title: 'Documents required', tag: 'Forms', icon: 'description', groups: [
    { label: 'Mandatory', items: [
      '<b>Form 1</b> — Application for a patent',
      '<b>Form 2</b> — Provisional / complete specification',
      '<b>Form 3</b> — Statement and undertaking',
      '<b>Form 5</b> — Declaration of inventorship',
      '<b>Form 18</b> — Request for examination'
    ] },
    { label: 'Optional, if applicable', items: [
      '<b>Form 9</b> — Early publication',
      '<b>Form 18A</b> — Expedited examination',
      '<b>Form 26</b> — Authorization of patent agent',
      '<b>Form 28</b> — Small entity / startup / educational institution'
    ] }
  ] },
  { title: 'Post-filing confirmation', tag: 'After filing', icon: 'receipt_long', points: [
    'Preserve the payment receipts',
    'Verify the submission on the official portal',
    'Track the application status regularly'
  ] },
  { title: 'Publication', tag: '18 months', icon: 'menu_book', points: [
    'Automatic publication 18 months after filing',
    'Early publication can be requested on <b>Form 9</b>'
  ] },
  { title: 'Examination', tag: '31 months', icon: 'fact_check', points: [
    'No examination takes place if <b>Form 18 / 18A</b> is not filed within 31 months from filing or priority, whichever is earlier',
    'After examination, the First Examination Report (FER) is issued',
    'Reply to the FER within 6 months, extendable by a further 3 months on <b>Form 4</b>',
    'A hearing opportunity is extended to the applicant whenever required'
  ], warn: true },
  { title: 'Grant', tag: '20 years', icon: 'workspace_premium', points: [
    'The patent is granted once all requirements under the Act and Rules are complied with',
    'A patent is granted for 20 years from the date of filing',
    'Renewal fees must be paid on time to maintain the patent'
  ] },
  { title: 'Advantages', tag: 'Outcome', icon: 'ads_click', points: [
    'Exclusive right to prevent others from making, using, selling or importing the patented product or process without consent',
    'Exploit your patent for market advantage, commercialization, licensing and more'
  ] }
];
const filingTips = [
  { icon: 'savings', text: 'E-filing attracts a fee concession.' },
  { icon: 'fast_forward', text: 'Early publication reduces the waiting period.' },
  { icon: 'rocket_launch', text: 'Expedited examination is available for eligible applicants.' },
  { icon: 'alarm', text: 'Failure to meet a timeline is fatal in patent prosecution.', warn: true }
];
const filingResources = [
  { label: 'IP Saarthi chatbot', url: 'https://ipindia.gov.in/ipsaarthi/', icon: 'smart_toy' },
  { label: 'Open House Help Desk', url: 'https://iprsearch.ipindia.gov.in/openhousehelpdesk/Login/login', icon: 'support_agent' },
  { label: 'InPASS patent search', url: 'https://iprsearch.ipindia.gov.in/publicsearch', icon: 'search' },
  { label: 'Acts and rules', url: IPO, icon: 'gavel' }
];
function renderFilingSteps() {
  document.querySelector('#applyTips').innerHTML = filingTips.map((tip) => `
    <div class="apply-tip${tip.warn ? ' warn' : ''}"><span class="material-symbols-outlined">${tip.icon}</span><p>${tip.text}</p></div>`).join('');
  document.querySelector('#applyResources').innerHTML = filingResources.map((item) => `
    <a class="resource-link" href="${item.url}" target="_blank" rel="noopener"><span class="material-symbols-outlined">${item.icon}</span>${item.label}<span class="material-symbols-outlined resource-arrow">open_in_new</span></a>`).join('');
  document.querySelector('#applySteps').innerHTML = filingSteps.map((step, index) => `
    <li class="apply-step${step.warn ? ' warn' : ''}">
      <div class="apply-step-num">${index + 1}</div>
      <div class="apply-step-body">
        <div class="apply-step-head"><strong><span class="material-symbols-outlined">${step.icon}</span>${step.title}</strong><span class="apply-step-time">${step.tag}</span></div>
        ${step.points ? `<ul class="apply-points">${step.points.map((point) => `<li>${point}</li>`).join('')}</ul>` : ''}
        ${step.groups ? `<div class="apply-groups">${step.groups.map((group) => `<div class="apply-group"><span class="apply-group-label">${group.label}</span><ul class="apply-points">${group.items.map((item) => `<li>${item}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
      </div>
    </li>`).join('');
}
document.querySelector('#applyPatentBtn').addEventListener('click', () => showPage('apply'));
document.querySelector('#applyStartBtn').addEventListener('click', () => document.querySelector('#addDialog').showModal());
document.querySelector('.icon-btn').addEventListener('click', () => showPage('dashboard'));
renderFilingSteps();

/* ---- Tabbed navigation: one section on screen at a time ---- */
const pages = [...document.querySelectorAll('[data-page]')].map((page) => page.id);
function showPage(id, { push = true } = {}) {
  const target = pages.includes(id) ? id : pages[0];
  document.querySelectorAll('[data-page]').forEach((page) => page.classList.toggle('active', page.id === target));
  document.querySelectorAll('.nav-link, .page-tab').forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${target}`;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  if (push && window.location.hash.slice(1) !== target) window.history.replaceState(null, '', `#${target}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
}
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  if (!pages.includes(id)) return;
  event.preventDefault();
  showPage(id);
});
window.addEventListener('hashchange', () => showPage(window.location.hash.slice(1), { push: false }));
showPage(window.location.hash.slice(1), { push: false });
