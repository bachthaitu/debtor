/* =========================================================
   Debtor Management
   ========================================================= */
'use strict';

const DB_KEY = 'debtor-mgmt-v1';
const THEME_KEY = 'debtor-theme-v1';
const DUE_SOON_DAYS = 7;

const NAV = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'grid' },
  { id: 'contacts',  label: 'Người vay', icon: 'users' },
  { id: 'activity',  label: 'Hoạt động', icon: 'list' },
  { id: 'settings',  label: 'Cài đặt',   icon: 'cog' },
];

const PAGE_TITLES = {
  dashboard: 'Tổng quan',
  contacts:  'Người vay',
  activity:  'Hoạt động',
  settings:  'Cài đặt',
};

const TERMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/* ============ STATE ============ */
let db = { contacts: [], transactions: [] };

/* ============ ICONS ============ */
const ICONS = {
  grid:   '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  users:  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  list:   '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  cog:    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  plus:   '<path d="M5 12h14"/><path d="M12 5v14"/>',
  edit:   '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash:  '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x:      '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  sun:    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon:   '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  down:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  up:     '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  print:  '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  check:  '<path d="M20 6 9 17l-5-5"/>',
  bell:   '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/>',
  percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
};

const icon = (name, size = 20) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

/* ============ UTILS ============ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const nf = new Intl.NumberFormat('vi-VN');
const money = n => nf.format(Math.round(Number(n) || 0)) + ' ₫';

const esc = s => {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const initials = name => {
  const p = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return (p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const hashStr = s => {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const avatarBg = name => {
  const hue = hashStr(name) % 360;
  return `hsl(${hue} 45% 55%)`;
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fmtDate = iso => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const daysBetween = (a, b) => {
  const x = new Date(a + 'T00:00:00');
  const y = new Date(b + 'T00:00:00');
  return Math.round((y - x) / 86400000);
};

const addMonths = (iso, months) => {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return toISO(d);
};

/* ============ CALCULATIONS ============ */
/**
 * Lãi = gốc × (lãi suất %/tháng ÷ 100) × số tháng
 * VD: 5.000.000 × 20/100 × 1 = 1.000.000
 */
function lendCalc(lend) {
  const principal = Number(lend.amount) || 0;
  const rate = Number(lend.rate) || 0;
  const months = Number(lend.months) || 1;
  const interest = principal * (rate / 100) * months;
  const dueDate = addMonths(lend.date, months);
  return { principal, rate, months, interest, dueDate, total: principal + interest };
}

function lendState(lend) {
  const calc = lendCalc(lend);

  const payments = db.transactions.filter(t => t.lendId === lend.id);
  const paidInterest = payments
    .filter(p => p.type === 'interest')
    .reduce((s, p) => s + p.amount, 0);
  const paidPrincipal = payments
    .filter(p => p.type === 'principal')
    .reduce((s, p) => s + p.amount, 0);

  const outstandingPrincipal = Math.max(0, calc.principal - paidPrincipal);
  const outstandingInterest = Math.max(0, calc.interest - paidInterest);
  const outstanding = outstandingPrincipal + outstandingInterest;

  const today = todayISO();
  const daysToDue = daysBetween(today, calc.dueDate);

  let status = 'active';
  let statusLabel = 'Đang vay';
  if (outstanding <= 0) {
    status = 'closed'; statusLabel = 'Tất toán';
  } else if (daysToDue < 0) {
    status = 'overdue'; statusLabel = `Quá ${-daysToDue} ngày`;
  } else if (daysToDue <= DUE_SOON_DAYS) {
    status = 'due-soon';
    statusLabel = daysToDue === 0 ? 'Đáo hạn hôm nay' : `Còn ${daysToDue} ngày`;
  } else {
    statusLabel = `Còn ${daysToDue} ngày`;
  }

  return {
    ...calc,
    paidInterest, paidPrincipal,
    outstandingPrincipal, outstandingInterest, outstanding,
    daysToDue, status, statusLabel,
  };
}

function contactState(contactId) {
  const lends = db.transactions.filter(t => t.contactId === contactId && t.type === 'lend');
  let totalOutstanding = 0;
  let totalPrincipalOut = 0;
  let totalInterestOut = 0;
  let totalPaid = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;
  let activeCount = 0;
  let closedCount = 0;

  lends.forEach(l => {
    const s = lendState(l);
    if (s.status === 'closed') {
      closedCount++;
      totalPaid += s.paidInterest + s.paidPrincipal;
    } else {
      totalOutstanding += s.outstanding;
      totalPrincipalOut += s.outstandingPrincipal;
      totalInterestOut += s.outstandingInterest;
      if (s.status === 'overdue') overdueCount++;
      else if (s.status === 'due-soon') dueSoonCount++;
      else activeCount++;
    }
  });

  return {
    lends,
    count: lends.length,
    totalOutstanding,
    totalPrincipalOut,
    totalInterestOut,
    totalPaid,
    overdueCount,
    dueSoonCount,
    activeCount,
    closedCount,
  };
}

function globalState() {
  let totalOutstanding = 0;
  let totalPrincipalOut = 0;
  let totalInterestOut = 0;
  let totalPaid = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;
  let activeLendCount = 0;

  db.contacts.forEach(c => {
    const s = contactState(c.id);
    totalOutstanding += s.totalOutstanding;
    totalPrincipalOut += s.totalPrincipalOut;
    totalInterestOut += s.totalInterestOut;
    totalPaid += s.totalPaid;
    overdueCount += s.overdueCount;
    dueSoonCount += s.dueSoonCount;
    activeLendCount += s.activeCount + s.overdueCount + s.dueSoonCount;
  });

  return {
    totalOutstanding, totalPrincipalOut, totalInterestOut, totalPaid,
    overdueCount, dueSoonCount, activeLendCount,
  };
}

function attentionList() {
  const list = [];
  db.contacts.forEach(c => {
    db.transactions
      .filter(t => t.contactId === c.id && t.type === 'lend')
      .forEach(l => {
        const s = lendState(l);
        if (s.status === 'overdue' || s.status === 'due-soon') {
          list.push({ contact: c, lend: l, state: s });
        }
      });
  });
  return list.sort((a, b) => a.state.daysToDue - b.state.daysToDue);
}

function cashflow() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `T${d.getMonth() + 1}`,
      out: 0,
      in: 0,
    });
  }
  db.transactions.forEach(t => {
    const m = (t.date || '').slice(0, 7);
    const slot = months.find(x => x.key === m);
    if (!slot) return;
    if (t.type === 'lend') slot.out += Number(t.amount) || 0;
    else slot.in += Number(t.amount) || 0;
  });
  return months;
}

/* ============ STORAGE ============ */
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    db.contacts = Array.isArray(data.contacts) ? data.contacts : [];
    db.transactions = Array.isArray(data.transactions) ? data.transactions : [];
  } catch (e) { console.error(e); }
}

function save() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  catch (_) { toast('Không lưu được dữ liệu', 'error'); }
}

/* ============ THEME ============ */
function getTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
}

function applyTheme(theme) {
  let actual = theme;
  if (!theme || theme === 'system') {
    actual = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = actual;
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}

  $$('[data-theme-icon]').forEach(el => {
    el.innerHTML = icon(actual === 'dark' ? 'sun' : 'moon', 18);
  });
  $$('[data-theme-label]').forEach(el => {
    el.textContent = actual === 'dark' ? 'Giao diện tối' : 'Giao diện sáng';
  });
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme;
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ============ TOAST ============ */
function toast(msg, type = 'info') {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const iconName = type === 'error' ? 'x' : 'check';
  el.innerHTML = `${icon(iconName, 15)}<span>${esc(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 200);
  }, 2200);
}

/* ============ NAV ============ */
function buildNav() {
  const currentPage = parseHash().page;
  $('#sidebarNav').innerHTML = NAV.map(item => `
    <a href="#/${item.id}" class="nav-item${item.id === currentPage ? ' active' : ''}" data-nav="${item.id}">
      <span class="nav-icon">${icon(item.icon, 18)}</span>
      <span class="nav-label">${item.label}</span>
      ${item.id === 'contacts' && db.contacts.length ? `<span class="nav-badge">${db.contacts.length}</span>` : ''}
    </a>
  `).join('');

  $('#tabbar').innerHTML = NAV.map(item => `
    <a href="#/${item.id}" class="tab${item.id === currentPage ? ' active' : ''}" data-nav="${item.id}">
      <span class="tab-icon">${icon(item.icon, 22)}</span>
      <span class="tab-label">${item.label}</span>
    </a>
  `).join('');
}

function setActiveNav(page) {
  $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === page));
}

/* ============ ROUTER ============ */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { page: parts[0] || 'dashboard', id: parts[1] || null };
}

function navigate() {
  const { page, id } = parseHash();

  let title = PAGE_TITLES[page] || 'Tổng quan';
  if (page === 'contacts' && id) {
    const c = db.contacts.find(x => x.id === id);
    if (c) title = c.name;
  }
  $('#pageTitle').textContent = title;

  const backBtn = $('#backBtn');
  if (page === 'contacts' && id) backBtn.hidden = false;
  else backBtn.hidden = true;

  setActiveNav(page);

  if (page === 'dashboard') renderDashboard();
  else if (page === 'contacts') id ? renderContactDetail(id) : renderContacts();
  else if (page === 'activity') renderActivity();
  else if (page === 'settings') renderSettings();
  else renderDashboard();

  renderTopbarActions(page, id);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderTopbarActions(page, id) {
  const box = $('#topbarActions');
  if (page === 'contacts' && id) {
    box.innerHTML = `
      <button class="btn accent sm" data-action="new-lend" data-contact="${id}">
        ${icon('plus', 15)} Cho vay
      </button>`;
  } else if (page === 'contacts') {
    box.innerHTML = `<button class="btn accent sm" data-action="new-contact">${icon('plus', 15)} Thêm người</button>`;
  } else if (page === 'activity') {
    box.innerHTML = `<button class="btn accent sm" data-action="new-lend">${icon('plus', 15)} Cho vay</button>`;
  } else if (page === 'dashboard') {
    box.innerHTML = `<button class="btn accent sm" data-action="new-lend">${icon('plus', 15)} Cho vay</button>`;
  } else {
    box.innerHTML = '';
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function renderDashboard() {
  const g = globalState();
  const alerts = attentionList();
  const flow = cashflow();

  const html = `
    <section class="hero">
      <div class="hero-label">Tổng dư nợ cần thu</div>
      <div class="hero-value">${money(g.totalOutstanding)}</div>
      <div class="hero-sub">
        <div class="hero-sub-item">
          <span class="hero-sub-label">Gốc còn lại</span>
          <span class="hero-sub-value">${money(g.totalPrincipalOut)}</span>
        </div>
        <div class="hero-sub-item">
          <span class="hero-sub-label">Lãi còn lại</span>
          <span class="hero-sub-value amber">${money(g.totalInterestOut)}</span>
        </div>
        <div class="hero-sub-item">
          <span class="hero-sub-label">Đã thu về</span>
          <span class="hero-sub-value green">${money(g.totalPaid)}</span>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stat">
        <div class="stat-label">Người vay</div>
        <div class="stat-value">${db.contacts.length}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Khoản đang vay</div>
        <div class="stat-value">${g.activeLendCount}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Sắp đáo hạn</div>
        <div class="stat-value amber">${g.dueSoonCount}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Quá hạn</div>
        <div class="stat-value red">${g.overdueCount}</div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Dòng tiền 6 tháng gần đây</h2>
      </div>
      <div class="chart-card">
        <div class="chart-head">
          <div>
            <div class="chart-title">Cho vay ra và thu về</div>
            <div class="chart-sub">Theo tháng</div>
          </div>
          <div class="chart-legend">
            <span class="chart-legend-item"><span class="chart-legend-dot out"></span> Cho vay</span>
            <span class="chart-legend-item"><span class="chart-legend-dot in"></span> Thu về</span>
          </div>
        </div>
        ${renderChart(flow)}
      </div>
    </section>

    ${alerts.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">${icon('bell', 17)} Cần chú ý (${alerts.length})</h2>
      </div>
      <div class="table table-contacts">
        <div class="table-head">
          <div>Người vay</div>
          <div>Đáo hạn</div>
          <div class="cell num">Còn phải thu</div>
          <div>Trạng thái</div>
          <div></div>
        </div>
        ${alerts.slice(0, 5).map(a => attentionRowHTML(a)).join('')}
      </div>
    </section>` : ''}

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Người vay</h2>
        <a href="#/contacts" class="section-link">Xem tất cả →</a>
      </div>
      ${db.contacts.length ? `
        <div class="table table-contacts">
          <div class="table-head">
            <div>Người vay</div>
            <div>Số khoản</div>
            <div class="cell num">Dư nợ</div>
            <div>Trạng thái</div>
            <div></div>
          </div>
          ${db.contacts.slice(0, 5).map(c => contactRowHTML(c, contactState(c.id))).join('')}
        </div>
      ` : `
        <div class="empty">
          <div class="empty-title">Chưa có người vay nào</div>
          <div class="empty-text">Thêm người vay đầu tiên để bắt đầu quản lý gốc và lãi.</div>
          <button class="btn accent" data-action="new-contact">${icon('plus', 15)} Thêm người vay</button>
        </div>
      `}
    </section>
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

function attentionRowHTML({ contact, state }) {
  const isOverdue = state.status === 'overdue';
  return `
    <div class="table-row" data-contact-id="${contact.id}">
      <div class="cell cell-person">
        <div class="cell-avatar" style="background:${avatarBg(contact.name)}">${esc(initials(contact.name))}</div>
        <div style="min-width:0">
          <div class="cell-person-name">${esc(contact.name)}</div>
          <div class="cell-person-sub">Gốc ${money(state.principal)}</div>
        </div>
      </div>
      <div class="cell cell-text" data-label="Đáo hạn">${fmtDate(state.dueDate)}</div>
      <div class="cell num cell-strong accent" data-label="Còn phải thu">${money(state.outstanding)}</div>
      <div class="cell" data-label="Trạng thái">
        <span class="badge ${state.status}"><span class="badge-dot"></span>${state.statusLabel}</span>
      </div>
      <div class="cell cell-actions">
        <button class="icon-btn sm" data-action="view-contact" data-id="${contact.id}" title="Xem">${icon('arrowRight', 15)}</button>
      </div>
    </div>
  `;
}

function renderChart(months) {
  const maxVal = Math.max(...months.flatMap(m => [m.in, m.out]), 1);
  const hasData = months.some(m => m.in > 0 || m.out > 0);

  if (!hasData) {
    return `<div class="chart-empty">Chưa có dữ liệu giao dịch</div>`;
  }

  return `
    <div class="chart">
      ${months.map(m => `
        <div class="chart-col">
          <div class="chart-bars">
            <div class="chart-bar out"
                 style="height:${Math.max(3, (m.out / maxVal) * 100)}%"
                 data-tip="Cho vay: ${money(m.out)}"></div>
            <div class="chart-bar in"
                 style="height:${Math.max(3, (m.in / maxVal) * 100)}%"
                 data-tip="Thu về: ${money(m.in)}"></div>
          </div>
          <div class="chart-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================================
   CONTACTS LIST
   ============================================================ */
function renderContacts() {
  const q = (window.__search || '').trim().toLowerCase();
  const sortBy = window.__sort || 'balance';

  let list = db.contacts.slice();
  if (q) {
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.note || '').toLowerCase().includes(q)
    );
  }

  const withState = list.map(c => ({ c, s: contactState(c.id) }));

  withState.sort((a, b) => {
    if (sortBy === 'balance') return b.s.totalOutstanding - a.s.totalOutstanding;
    if (sortBy === 'name') return (a.c.name || '').localeCompare(b.c.name || '', 'vi');
    if (sortBy === 'overdue') {
      if (b.s.overdueCount !== a.s.overdueCount) return b.s.overdueCount - a.s.overdueCount;
      return b.s.totalOutstanding - a.s.totalOutstanding;
    }
    return 0;
  });

  const html = `
    <div class="toolbar">
      <div class="search-wrap">
        ${icon('search', 18)}
        <input type="search" class="search-input" id="contactSearch"
               placeholder="Tìm theo tên, SĐT, ghi chú…"
               value="${esc(window.__search || '')}" autocomplete="off">
      </div>
      <select class="select" id="contactSort">
        <option value="balance"${sortBy === 'balance' ? ' selected' : ''}>Dư nợ cao nhất</option>
        <option value="overdue"${sortBy === 'overdue' ? ' selected' : ''}>Quá hạn nhiều nhất</option>
        <option value="name"${sortBy === 'name' ? ' selected' : ''}>Tên A–Z</option>
      </select>
    </div>

    ${!db.contacts.length ? `
      <div class="empty">
        <div class="empty-title">Chưa có người vay nào</div>
        <div class="empty-text">Thêm người vay đầu tiên để bắt đầu.</div>
        <button class="btn accent" data-action="new-contact">${icon('plus', 15)} Thêm người vay</button>
      </div>
    ` : !list.length ? `
      <div class="empty">
        <div class="empty-title">Không tìm thấy ai</div>
        <div class="empty-text">Thử từ khoá khác xem sao.</div>
      </div>
    ` : `
      <div class="table table-contacts">
        <div class="table-head">
          <div>Người vay</div>
          <div>Số khoản</div>
          <div class="cell num">Dư nợ</div>
          <div>Trạng thái</div>
          <div></div>
        </div>
        ${withState.map(({ c, s }) => contactRowHTML(c, s)).join('')}
      </div>
    `}
  `;

  $('#view').innerHTML = html;

  const inp = $('#contactSearch');
  if (inp) {
    inp.addEventListener('input', e => {
      window.__search = e.target.value;
      const pos = e.target.selectionStart;
      renderContacts();
      const ni = $('#contactSearch');
      if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (_) {} }
    });
  }
  const sel = $('#contactSort');
  if (sel) sel.addEventListener('change', e => {
    window.__sort = e.target.value;
    renderContacts();
  });

  bindViewEvents();
}

function contactRowHTML(c, s) {
  const bal = s.totalOutstanding;
  let badge;
  if (bal <= 0) {
    badge = `<span class="badge closed"><span class="badge-dot"></span>Sạch nợ</span>`;
  } else if (s.overdueCount > 0) {
    badge = `<span class="badge overdue"><span class="badge-dot"></span>${s.overdueCount} quá hạn</span>`;
  } else if (s.dueSoonCount > 0) {
    badge = `<span class="badge due-soon"><span class="badge-dot"></span>${s.dueSoonCount} sắp hạn</span>`;
  } else {
    badge = `<span class="badge active"><span class="badge-dot"></span>Đang vay</span>`;
  }

  const sub = c.phone ? esc(c.phone) : (c.note ? esc(c.note) : '—');

  return `
    <div class="table-row" data-contact-id="${c.id}">
      <div class="cell cell-person">
        <div class="cell-avatar" style="background:${avatarBg(c.name)}">${esc(initials(c.name))}</div>
        <div style="min-width:0">
          <div class="cell-person-name">${esc(c.name)}</div>
          <div class="cell-person-sub">${sub}</div>
        </div>
      </div>
      <div class="cell cell-text" data-label="Số khoản">${s.count} khoản</div>
      <div class="cell num cell-strong accent" data-label="Dư nợ">${bal > 0 ? money(bal) : '—'}</div>
      <div class="cell" data-label="Trạng thái">${badge}</div>
      <div class="cell cell-actions">
        <button class="icon-btn sm" data-action="edit-contact" data-id="${c.id}" title="Sửa">${icon('edit', 14)}</button>
        <button class="icon-btn sm danger" data-action="delete-contact" data-id="${c.id}" title="Xoá">${icon('trash', 14)}</button>
      </div>
    </div>
  `;
}

/* ============================================================
   CONTACT DETAIL
   ============================================================ */
function renderContactDetail(id) {
  const c = db.contacts.find(x => x.id === id);
  if (!c) { location.hash = '#/contacts'; return; }

  const s = contactState(id);
  const subParts = [c.phone, c.note].filter(Boolean).map(esc);
  const sub = subParts.join(' · ') || 'Không có thông tin thêm';

  const allPayments = db.transactions
    .filter(t => t.contactId === id && (t.type === 'interest' || t.type === 'principal'))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));

  const lendsSorted = [...s.lends].sort((a, b) => {
    const sa = lendState(a);
    const sb = lendState(b);
    if (sa.status === 'closed' && sb.status !== 'closed') return 1;
    if (sb.status === 'closed' && sa.status !== 'closed') return -1;
    return (b.date || '').localeCompare(a.date || '');
  });

  const html = `
    <div class="detail-head">
      <div class="detail-avatar" style="background:${avatarBg(c.name)}">${esc(initials(c.name))}</div>
      <div class="detail-info">
        <h2 class="detail-name">${esc(c.name)}</h2>
        <p class="detail-sub">${sub}</p>
      </div>
    </div>

    <section class="hero">
      <div class="hero-label">Tổng còn phải thu</div>
      <div class="hero-value">${money(Math.max(0, s.totalOutstanding))}</div>
      <div class="hero-sub">
        <div class="hero-sub-item">
          <span class="hero-sub-label">Gốc còn lại</span>
          <span class="hero-sub-value">${money(s.totalPrincipalOut)}</span>
        </div>
        <div class="hero-sub-item">
          <span class="hero-sub-label">Lãi còn lại</span>
          <span class="hero-sub-value amber">${money(s.totalInterestOut)}</span>
        </div>
        <div class="hero-sub-item">
          <span class="hero-sub-label">Đã thu về</span>
          <span class="hero-sub-value green">${money(s.totalPaid)}</span>
        </div>
      </div>
    </section>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">
      <button class="btn accent" data-action="new-lend" data-contact="${id}">${icon('plus', 15)} Cho vay mới</button>
      <button class="btn ghost" data-action="edit-contact" data-id="${id}">${icon('edit', 15)} Sửa thông tin</button>
      <button class="btn ghost" data-action="print-contact" data-id="${id}">${icon('print', 15)} In sao kê</button>
      <button class="btn soft-danger" data-action="delete-contact" data-id="${id}">${icon('trash', 15)} Xoá</button>
    </div>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Các khoản vay (${s.count})</h2>
      </div>
      ${lendsSorted.length ? `
        <div class="table table-loans">
          <div class="table-head">
            <div>Ngày vay</div>
            <div class="cell num">Gốc</div>
            <div class="cell num">Lãi/tháng</div>
            <div class="cell num">Kỳ hạn</div>
            <div>Đáo hạn</div>
            <div class="cell num">Còn phải thu</div>
            <div>Trạng thái</div>
            <div></div>
          </div>
          ${lendsSorted.map(l => lendRowHTML(l)).join('')}
        </div>
      ` : `
        <div class="empty">
          <div class="empty-title">Chưa có khoản vay nào</div>
          <div class="empty-text">Bấm "Cho vay mới" để ghi khoản đầu tiên.</div>
        </div>
      `}
    </section>

    ${allPayments.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Lịch sử thu tiền (${allPayments.length})</h2>
      </div>
      <div class="table table-tx">
        <div class="table-head">
          <div>Ngày</div>
          <div>Loại</div>
          <div class="cell num">Số tiền</div>
          <div>Khoản vay</div>
          <div>Ghi chú</div>
          <div></div>
        </div>
        ${allPayments.map(p => paymentRowHTML(p)).join('')}
      </div>
    </section>` : ''}
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

function lendRowHTML(lend) {
  const s = lendState(lend);
  const closed = s.status === 'closed';
  const progressCls = closed ? 'closed' : s.status === 'overdue' ? 'overdue' : '';

  return `
    <div class="table-row ${closed ? '' : ''}" data-lend-id="${lend.id}">
      <div class="cell cell-text" data-label="Ngày vay">${fmtDate(lend.date)}</div>
      <div class="cell num cell-strong" data-label="Gốc">${money(s.principal)}</div>
      <div class="cell num cell-text" data-label="Lãi/tháng">${s.rate}%</div>
      <div class="cell num cell-text" data-label="Kỳ hạn">${s.months} th</div>
      <div class="cell cell-text" data-label="Đáo hạn">${fmtDate(s.dueDate)}</div>
      <div class="cell num cell-strong accent" data-label="Còn phải thu">${money(s.outstanding)}</div>
      <div class="cell" data-label="Trạng thái">
        <span class="badge ${s.status}"><span class="badge-dot"></span>${s.statusLabel}</span>
      </div>
      <div class="cell cell-actions">
        ${closed ? '' : `
          <button class="icon-btn sm" data-action="collect-interest" data-lend="${lend.id}" title="Thu lãi">${icon('percent', 14)}</button>
          <button class="icon-btn sm" data-action="collect-principal" data-lend="${lend.id}" title="Thu gốc">${icon('down', 14)}</button>
        `}
        <button class="icon-btn sm" data-action="edit-lend" data-id="${lend.id}" title="Sửa">${icon('edit', 14)}</button>
        <button class="icon-btn sm danger" data-action="delete-lend" data-id="${lend.id}" title="Xoá">${icon('trash', 14)}</button>
      </div>
    </div>
  `;
}

function paymentRowHTML(p) {
  const lend = db.transactions.find(t => t.id === p.lendId);
  const isInterest = p.type === 'interest';
  return `
    <div class="table-row no-hover">
      <div class="cell cell-text" data-label="Ngày">${fmtDate(p.date)}</div>
      <div class="cell cell-text" data-label="Loại">${isInterest ? 'Thu lãi' : 'Thu gốc'}</div>
      <div class="cell num cell-strong green" data-label="Số tiền">+${money(p.amount)}</div>
      <div class="cell cell-text" data-label="Khoản vay">${lend ? money(lend.amount) : '—'}</div>
      <div class="cell cell-text" data-label="Ghi chú">${esc(p.note || '—')}</div>
      <div class="cell cell-actions">
        <button class="icon-btn sm danger" data-action="delete-tx" data-id="${p.id}" title="Xoá">${icon('trash', 14)}</button>
      </div>
    </div>
  `;
}

/* ============================================================
   ACTIVITY
   ============================================================ */
function renderActivity() {
  const q = (window.__search || '').trim().toLowerCase();
  const filter = window.__filter || 'all';

  let list = db.transactions.slice();
  if (filter !== 'all') list = list.filter(t => t.type === filter);

  if (q) {
    list = list.filter(t => {
      const c = db.contacts.find(x => x.id === t.contactId);
      return (c?.name || '').toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q);
    });
  }

  list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));

  const html = `
    <div class="toolbar">
      <div class="search-wrap">
        ${icon('search', 18)}
        <input type="search" class="search-input" id="actSearch"
               placeholder="Tìm giao dịch…"
               value="${esc(window.__search || '')}" autocomplete="off">
      </div>
      <select class="select" id="actFilter">
        <option value="all"${filter === 'all' ? ' selected' : ''}>Tất cả loại</option>
        <option value="lend"${filter === 'lend' ? ' selected' : ''}>Cho vay</option>
        <option value="interest"${filter === 'interest' ? ' selected' : ''}>Thu lãi</option>
        <option value="principal"${filter === 'principal' ? ' selected' : ''}>Thu gốc</option>
      </select>
    </div>

    ${!list.length ? `
      <div class="empty">
        <div class="empty-title">Không có giao dịch</div>
        <div class="empty-text">${db.transactions.length ? 'Thử đổi bộ lọc hoặc từ khoá.' : 'Ghi lại giao dịch đầu tiên để bắt đầu.'}</div>
        ${!db.transactions.length ? `<button class="btn accent" data-action="new-lend">${icon('plus', 15)} Cho vay</button>` : ''}
      </div>
    ` : `
      <div class="table table-tx">
        <div class="table-head">
          <div>Ngày</div>
          <div>Người vay</div>
          <div>Loại</div>
          <div class="cell num">Số tiền</div>
          <div>Chi tiết</div>
          <div></div>
        </div>
        ${list.map(txRowHTML).join('')}
      </div>
    `}
  `;

  $('#view').innerHTML = html;

  const inp = $('#actSearch');
  if (inp) {
    inp.addEventListener('input', e => {
      window.__search = e.target.value;
      const pos = e.target.selectionStart;
      renderActivity();
      const ni = $('#actSearch');
      if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (_) {} }
    });
  }
  const sel = $('#actFilter');
  if (sel) sel.addEventListener('change', e => {
    window.__filter = e.target.value;
    renderActivity();
  });

  bindViewEvents();
}

function txRowHTML(t) {
  const c = db.contacts.find(x => x.id === t.contactId);
  const name = c ? c.name : 'Không rõ';
  const isLend = t.type === 'lend';
  const isInterest = t.type === 'interest';

  const typeLabel = isLend ? 'Cho vay' : isInterest ? 'Thu lãi' : 'Thu gốc';
  const sign = isLend ? '−' : '+';
  const signCls = isLend ? 'accent' : 'green';

  let detail = '';
  if (isLend) {
    detail = `${t.rate}%/tháng · ${t.months} tháng${t.note ? ' · ' + esc(t.note) : ''}`;
  } else {
    detail = t.note ? esc(t.note) : '—';
  }

  return `
    <div class="table-row" data-contact-id="${c?.id || ''}">
      <div class="cell cell-text" data-label="Ngày">${fmtDate(t.date)}</div>
      <div class="cell cell-person" data-label="Người vay">
        <div class="cell-avatar" style="background:${avatarBg(name)};width:32px;height:32px;font-size:11px;border-radius:8px">${esc(initials(name))}</div>
        <div class="cell-person-name" style="font-size:13.5px">${esc(name)}</div>
      </div>
      <div class="cell cell-text" data-label="Loại">${typeLabel}</div>
      <div class="cell num cell-strong ${signCls}" data-label="Số tiền">${sign}${money(t.amount)}</div>
      <div class="cell cell-text" data-label="Chi tiết">${detail}</div>
      <div class="cell cell-actions">
        ${isLend ? `<button class="icon-btn sm" data-action="edit-lend" data-id="${t.id}" title="Sửa">${icon('edit', 14)}</button>` : ''}
        <button class="icon-btn sm danger" data-action="delete-tx" data-id="${t.id}" title="Xoá">${icon('trash', 14)}</button>
      </div>
    </div>
  `;
}

/* ============================================================
   SETTINGS
   ============================================================ */
function renderSettings() {
  const themeVal = getTheme() || 'system';

  $('#view').innerHTML = `
    <div class="settings-group">
      <h3 class="settings-group-title">Giao diện</h3>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px">
        <div class="field-label" style="margin-bottom:10px">Chế độ hiển thị</div>
        <div class="seg-group" id="themeSeg">
          <button class="seg-btn${themeVal === 'light' ? ' active' : ''}" data-theme-val="light">Sáng</button>
          <button class="seg-btn${themeVal === 'dark' ? ' active' : ''}" data-theme-val="dark">Tối</button>
          <button class="seg-btn${themeVal === 'system' ? ' active' : ''}" data-theme-val="system">Hệ thống</button>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <h3 class="settings-group-title">Dữ liệu</h3>
      <button class="settings-item" data-action="export-json">
        <span class="nav-icon">${icon('down', 18)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title">Sao lưu (JSON)</div>
          <div class="settings-item-desc">Tải toàn bộ dữ liệu về máy</div>
        </div>
      </button>
      <label class="settings-item" for="importFile" style="cursor:pointer">
        <span class="nav-icon">${icon('up', 18)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title">Khôi phục từ file</div>
          <div class="settings-item-desc">Ghi đè dữ liệu hiện tại bằng file JSON</div>
        </div>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
      </label>
      <button class="settings-item" data-action="export-csv">
        <span class="nav-icon">${icon('down', 18)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title">Xuất CSV</div>
          <div class="settings-item-desc">Mở bằng Excel / Google Sheets</div>
        </div>
      </button>
    </div>

    <div class="settings-group">
      <h3 class="settings-group-title">Vùng nguy hiểm</h3>
      <button class="settings-item" data-action="clear-all">
        <span class="nav-icon" style="color:var(--red)">${icon('trash', 18)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title" style="color:var(--red)">Xoá toàn bộ dữ liệu</div>
          <div class="settings-item-desc">Xoá hết người vay và giao dịch (không hoàn tác)</div>
        </div>
      </button>
    </div>

    <div class="settings-group">
      <h3 class="settings-group-title">Cách tính lãi</h3>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;font-size:13.5px;line-height:1.7;color:var(--text-2)">
        <div style="color:var(--text);font-weight:600;margin-bottom:6px">Lãi = Gốc × Lãi suất ÷ 100 × Số tháng</div>
        <div style="font-style:italic">Ví dụ: Cho vay 5.000.000 ₫, lãi suất 20%/tháng, kỳ hạn 1 tháng</div>
        <div style="margin-top:4px">→ Lãi = 5.000.000 × 20 ÷ 100 × 1 = <b style="color:var(--amber)">1.000.000 ₫</b></div>
        <div style="margin-top:4px">→ Tổng phải thu = <b style="color:var(--accent)">6.000.000 ₫</b></div>
        <div style="margin-top:14px;padding-top:14px;border-top:1px dashed var(--border);font-size:12.5px;color:var(--text-3)">
          Dữ liệu lưu trong localStorage của trình duyệt này. Hãy sao lưu định kỳ.
        </div>
      </div>
    </div>
  `;

  $('#view').innerHTML = $('#view').innerHTML; // rebuild

  $$('#themeSeg [data-theme-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeVal);
      renderSettings();
    });
  });
  const imp = $('#importFile');
  if (imp) imp.addEventListener('change', handleImportFile);
  $$('[data-action]').forEach(el => el.addEventListener('click', handleAction));
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bindViewEvents() {
  const view = $('#view');

  // Row click → contact detail
  $$('[data-contact-id]', view).forEach(el => {
    if (!el.dataset.contactId) return;
    el.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) return;
      location.hash = `#/contacts/${el.dataset.contactId}`;
    });
  });

  // Lend row click → edit
  $$('[data-lend-id]', view).forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) return;
      openLendForm({ id: el.dataset.lendId });
    });
  });

  // Actions
  $$('[data-action]', view).forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      handleAction(e);
    });
  });

  // Theme seg
  $$('#themeSeg [data-theme-val]', view).forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeVal);
      renderSettings();
    });
  });

  // Import
  const imp = $('#importFile');
  if (imp) imp.addEventListener('change', handleImportFile);
}

function handleAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;
  const id = el.dataset.id;
  const contactId = el.dataset.contact;
  const lendId = el.dataset.lend;

  switch (action) {
    case 'new-lend':          openLendForm({ contactId }); break;
    case 'edit-lend':         openLendForm({ id }); break;
    case 'delete-lend':       confirmDeleteLend(id); break;
    case 'collect-interest':  openPaymentForm({ lendId, type: 'interest' }); break;
    case 'collect-principal': openPaymentForm({ lendId, type: 'principal' }); break;
    case 'new-contact':       openContactForm(); break;
    case 'edit-contact':      openContactForm(id); break;
    case 'delete-contact':    confirmDeleteContact(id); break;
    case 'view-contact':      location.hash = `#/contacts/${id}`; break;
    case 'delete-tx':         confirmDeleteTx(id); break;
    case 'print-contact':     printContact(id); break;
    case 'theme-toggle':      toggleTheme(); break;
    case 'export-json':       exportJSON(); break;
    case 'export-csv':        exportCSV(); break;
    case 'clear-all':         confirmClearAll(); break;
  }
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(html) {
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true">${html}</div>
    </div>
  `;
  document.body.style.overflow = 'hidden';

  $('#modalBackdrop').addEventListener('click', e => {
    if (e.target.id === 'modalBackdrop') closeModal();
  });
  $$('[data-close]', root).forEach(el => el.addEventListener('click', closeModal));
}

function closeModal() {
  $('#modalRoot').innerHTML = '';
  document.body.style.overflow = '';
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function openContactForm(id = null) {
  const c = id ? db.contacts.find(x => x.id === id) : null;
  const title = c ? 'Sửa người vay' : 'Thêm người vay';

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <form id="contactForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="cName">Tên <span class="req">*</span></label>
          <input type="text" class="input" id="cName" maxlength="60"
                 placeholder="VD: Nguyễn Văn A" value="${esc(c?.name || '')}"
                 required autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cPhone">Số điện thoại <span class="opt">(tuỳ chọn)</span></label>
          <input type="tel" class="input" id="cPhone" maxlength="20"
                 placeholder="VD: 0912 345 678" value="${esc(c?.phone || '')}"
                 autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <textarea class="textarea" id="cNote" maxlength="200"
                    placeholder="VD: Bạn giới thiệu, hay vay gấp…">${esc(c?.note || '')}</textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">${c ? 'Lưu' : 'Thêm'}</button>
      </div>
    </form>
  `);

  setTimeout(() => $('#cName')?.focus(), 100);

  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName').value.trim();
    const phone = $('#cPhone').value.trim();
    const note = $('#cNote').value.trim();

    if (!name) return toast('Nhập tên đi bạn', 'error');

    if (c) {
      Object.assign(c, { name, phone, note });
      toast('Đã cập nhật', 'success');
    } else {
      db.contacts.push({ id: uid(), name, phone, note, createdAt: Date.now() });
      toast('Đã thêm người vay', 'success');
    }

    save(); closeModal(); buildNav(); navigate();
  });
}

/* ============================================================
   LEND FORM
   ============================================================ */
function openLendForm({ contactId = null, id = null } = {}) {
  const isEdit = !!id;
  const existing = isEdit ? db.transactions.find(x => x.id === id) : null;

  if (!db.contacts.length) {
    toast('Thêm người vay trước đã nhé', 'error');
    openContactForm();
    return;
  }

  const selectedContact = existing ? existing.contactId : (contactId || db.contacts[0].id);
  const amount = existing ? existing.amount : '';
  const rate = existing ? existing.rate : 10;
  const months = existing ? existing.months : 1;
  const date = existing ? existing.date : todayISO();
  const note = existing ? (existing.note || '') : '';

  const contactOptions = db.contacts.map(c =>
    `<option value="${c.id}"${c.id === selectedContact ? ' selected' : ''}>${esc(c.name)}</option>`
  ).join('');

  const termChips = TERMS.map(n =>
    `<button type="button" class="term-chip${n === months ? ' active' : ''}" data-months="${n}">${n}</button>`
  ).join('');

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${isEdit ? 'Sửa khoản vay' : 'Cho vay mới'}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <form id="lendForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="lContact">Người vay <span class="req">*</span></label>
          <select class="select-field" id="lContact" required>${contactOptions}</select>
        </div>

        <div class="field">
          <label class="field-label" for="lAmount">Số tiền cho vay (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="lAmount" inputmode="numeric"
                 placeholder="0" value="${amount ? nf.format(amount) : ''}"
                 required autocomplete="off">
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="lRate">Lãi suất (%/tháng) <span class="req">*</span></label>
            <input type="number" class="input" id="lRate" min="0" step="0.1"
                   placeholder="VD: 20" value="${rate ?? ''}" required>
          </div>
          <div class="field">
            <label class="field-label" for="lDate">Ngày cho vay</label>
            <input type="date" class="input" id="lDate" value="${date}">
          </div>
        </div>

        <div class="field">
          <label class="field-label">Kỳ hạn (tháng) <span class="req">*</span></label>
          <div class="term-chips" id="termChips">${termChips}</div>
        </div>

        <div class="preview-box" id="previewBox">
          <div class="preview-item">
            <span class="preview-label">Tiền lãi</span>
            <span class="preview-value" id="pvInterest">0 ₫</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Tổng phải thu</span>
            <span class="preview-value" id="pvTotal">0 ₫</span>
          </div>
          <div class="preview-item" style="grid-column:1/-1">
            <span class="preview-label">Đáo hạn</span>
            <span class="preview-value" id="pvDue">—</span>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="lNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <input type="text" class="input" id="lNote" maxlength="120"
                 placeholder="VD: vay mua điện thoại"
                 value="${esc(note)}" autocomplete="off">
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">${isEdit ? 'Lưu' : 'Cho vay'}</button>
      </div>
    </form>
  `);

  let currentMonths = months;

  function updatePreview() {
    const amt = Number($('#lAmount').value.replace(/\D/g, '')) || 0;
    const r = Number($('#lRate').value) || 0;
    const d = $('#lDate').value || todayISO();

    if (amt > 0) {
      const interest = amt * (r / 100) * currentMonths;
      const due = addMonths(d, currentMonths);
      $('#pvInterest').textContent = money(interest);
      $('#pvTotal').textContent = money(amt + interest);
      $('#pvDue').textContent = fmtDate(due);
    } else {
      $('#pvInterest').textContent = '0 ₫';
      $('#pvTotal').textContent = '0 ₫';
      $('#pvDue').textContent = '—';
    }
  }

  $$('#termChips .term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentMonths = Number(chip.dataset.months);
      $$('#termChips .term-chip').forEach(c => c.classList.toggle('active', c === chip));
      updatePreview();
    });
  });

  const amtInput = $('#lAmount');
  amtInput.addEventListener('input', () => {
    const digits = amtInput.value.replace(/\D/g, '');
    amtInput.value = digits ? nf.format(Number(digits)) : '';
    updatePreview();
  });
  $('#lRate').addEventListener('input', updatePreview);
  $('#lDate').addEventListener('change', updatePreview);

  updatePreview();
  setTimeout(() => amtInput?.focus(), 100);

  $('#lendForm').addEventListener('submit', e => {
    e.preventDefault();

    const contactIdVal = $('#lContact').value;
    const amountVal = Number(amtInput.value.replace(/\D/g, ''));
    const rateVal = Number($('#lRate').value);
    const dateVal = $('#lDate').value || todayISO();
    const noteVal = $('#lNote').value.trim();

    if (!contactIdVal) return toast('Chọn người vay', 'error');
    if (!amountVal || amountVal <= 0) return toast('Nhập số tiền hợp lệ', 'error');
    if (!Number.isFinite(rateVal) || rateVal < 0) return toast('Lãi suất không hợp lệ', 'error');
    if (!currentMonths || currentMonths < 1) return toast('Chọn kỳ hạn', 'error');

    const data = {
      contactId: contactIdVal,
      type: 'lend',
      amount: amountVal,
      rate: rateVal,
      months: currentMonths,
      date: dateVal,
      note: noteVal,
    };

    if (isEdit && existing) {
      Object.assign(existing, data);
      toast('Đã cập nhật', 'success');
    } else {
      db.transactions.push({ id: uid(), ...data, createdAt: Date.now() });
      toast('Đã cho vay', 'success');
    }

    save(); closeModal(); navigate();
  });
}

/* ============================================================
   PAYMENT FORM
   ============================================================ */
function openPaymentForm({ lendId, type }) {
  const lend = db.transactions.find(t => t.id === lendId && t.type === 'lend');
  if (!lend) return;

  const state = lendState(lend);
  const c = db.contacts.find(x => x.id === lend.contactId);
  const isInterest = type === 'interest';

  const suggested = Math.round(isInterest ? state.outstandingInterest : state.outstandingPrincipal);
  const title = isInterest ? 'Thu lãi' : 'Thu gốc';

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <form id="payForm">
      <div class="modal-body">
        <div style="background:var(--surface-2);border-radius:var(--radius-sm);padding:14px 16px;margin-bottom:18px">
          <div style="font-size:13px;color:var(--text-2);margin-bottom:6px">${esc(c?.name || '')} · Gốc ${money(lend.amount)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div style="font-size:11.5px;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em">Lãi còn lại</div>
              <div style="font-size:15px;font-weight:600;color:var(--amber);margin-top:3px">${money(state.outstandingInterest)}</div>
            </div>
            <div>
              <div style="font-size:11.5px;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em">Gốc còn lại</div>
              <div style="font-size:15px;font-weight:600;color:var(--text);margin-top:3px">${money(state.outstandingPrincipal)}</div>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="pAmount">Số tiền (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="pAmount" inputmode="numeric"
                 placeholder="0" value="${suggested > 0 ? nf.format(suggested) : ''}"
                 required autocomplete="off">
        </div>

        <div class="field">
          <label class="field-label" for="pDate">Ngày thu</label>
          <input type="date" class="input" id="pDate" value="${todayISO()}">
        </div>

        <div class="field">
          <label class="field-label" for="pNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <input type="text" class="input" id="pNote" maxlength="120"
                 placeholder="VD: thu tiền mặt" autocomplete="off">
        </div>

        ${suggested > 0 ? `
          <button type="button" class="btn ghost sm" id="fullBtn" style="width:100%">
            Thu hết (${money(suggested)})
          </button>
        ` : ''}
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">${title}</button>
      </div>
    </form>
  `);

  const amtInput = $('#pAmount');
  amtInput.addEventListener('input', () => {
    const d = amtInput.value.replace(/\D/g, '');
    amtInput.value = d ? nf.format(Number(d)) : '';
  });
  const fullBtn = $('#fullBtn');
  if (fullBtn) fullBtn.addEventListener('click', () => {
    amtInput.value = nf.format(suggested);
  });

  setTimeout(() => amtInput?.focus(), 100);

  $('#payForm').addEventListener('submit', e => {
    e.preventDefault();
    const amountVal = Number(amtInput.value.replace(/\D/g, ''));
    const dateVal = $('#pDate').value || todayISO();
    const noteVal = $('#pNote').value.trim();

    if (!amountVal || amountVal <= 0) return toast('Nhập số tiền hợp lệ', 'error');

    db.transactions.push({
      id: uid(),
      contactId: lend.contactId,
      lendId: lend.id,
      type,
      amount: amountVal,
      date: dateVal,
      note: noteVal,
      createdAt: Date.now(),
    });

    save(); closeModal();
    toast(isInterest ? 'Đã thu lãi' : 'Đã thu gốc', 'success');
    navigate();
  });
}

/* ============================================================
   PRINT
   ============================================================ */
function printContact(id) {
  const c = db.contacts.find(x => x.id === id);
  if (!c) return;

  const s = contactState(id);
  const rows = s.lends.map(l => {
    const st = lendState(l);
    return `
      <tr>
        <td>${fmtDate(l.date)}</td>
        <td class="num">${money(st.principal)}</td>
        <td class="num">${st.rate}%</td>
        <td class="num">${st.months} th</td>
        <td>${fmtDate(st.dueDate)}</td>
        <td class="num">${money(st.outstandingPrincipal)}</td>
        <td class="num">${money(st.outstandingInterest)}</td>
        <td class="num"><b>${money(st.outstanding)}</b></td>
      </tr>
    `;
  }).join('');

  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Sao kê — ${esc(c.name)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { font-family: 'Lora', Georgia, serif; box-sizing: border-box; }
      body { padding: 40px; color: #1A1917; max-width: 900px; margin: 0 auto; }
      h1 { font-size: 24px; font-weight: 600; margin-bottom: 6px; letter-spacing: -.02em; }
      .sub { color: #6B6860; font-size: 13px; margin-bottom: 24px; line-height: 1.6; }
      .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px; background: #FAF9F5; border: 1px solid #E9E5D9; border-radius: 12px; margin-bottom: 28px; }
      .summary-item { display: flex; flex-direction: column; gap: 4px; }
      .summary-label { font-size: 11px; color: #6B6860; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
      .summary-value { font-size: 19px; font-weight: 600; letter-spacing: -.02em; }
      .accent { color: #C96442; }
      .amber { color: #A87419; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #E9E5D9; }
      th { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #6B6860; font-weight: 700; }
      td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #E9E5D9; text-align: center; font-size: 11.5px; color: #A19D91; font-style: italic; }
      @media print { body { padding: 20px; } }
    </style></head>
    <body>
      <h1>Sao kê công nợ</h1>
      <div class="sub">
        <b>${esc(c.name)}</b>${c.phone ? ' · ' + esc(c.phone) : ''}${c.note ? ' · ' + esc(c.note) : ''}<br>
        Ngày in: ${fmtDate(todayISO())}
      </div>
      <div class="summary">
        <div class="summary-item">
          <span class="summary-label">Gốc còn lại</span>
          <span class="summary-value">${money(s.totalPrincipalOut)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Lãi còn lại</span>
          <span class="summary-value amber">${money(s.totalInterestOut)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tổng phải thu</span>
          <span class="summary-value accent">${money(s.totalOutstanding)}</span>
        </div>
      </div>
      ${rows ? `
      <table>
        <thead><tr>
          <th>Ngày vay</th><th class="num">Gốc</th><th class="num">Lãi/th</th>
          <th class="num">Kỳ hạn</th><th>Đáo hạn</th>
          <th class="num">Gốc còn</th><th class="num">Lãi còn</th><th class="num">Tổng</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>` : '<p style="color:#6B6860">Chưa có khoản vay nào.</p>'}
      <div class="footer">Debtor Management</div>
      <script>setTimeout(() => window.print(), 400);<\/script>
    </body></html>
  `);
  win.document.close();
}

/* ============================================================
   CONFIRM & DELETE
   ============================================================ */
function openConfirm({ title, message, confirmText = 'Xoá', onConfirm, danger = true }) {
  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${esc(title)}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <div class="modal-body">
      <p style="margin:0;font-size:14.5px;line-height:1.65;color:var(--text-2)">${message}</p>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn ghost" data-close>Huỷ</button>
      <button type="button" class="btn ${danger ? 'danger' : 'accent'}" id="confirmOk">${esc(confirmText)}</button>
    </div>
  `);
  $('#confirmOk').addEventListener('click', () => {
    closeModal();
    onConfirm?.();
  });
}

function confirmDeleteContact(id) {
  const c = db.contacts.find(x => x.id === id);
  if (!c) return;
  const count = db.transactions.filter(t => t.contactId === id).length;
  openConfirm({
    title: 'Xoá người vay?',
    message: `Bạn sắp xoá <b>${esc(c.name)}</b>${count ? ` và <b>${count} giao dịch</b> liên quan` : ''}. Không thể hoàn tác.`,
    confirmText: 'Xoá',
    onConfirm: () => {
      db.contacts = db.contacts.filter(x => x.id !== id);
      db.transactions = db.transactions.filter(t => t.contactId !== id);
      save(); buildNav();
      location.hash = '#/contacts';
      toast('Đã xoá', 'success');
    },
  });
}

function confirmDeleteLend(id) {
  const lend = db.transactions.find(t => t.id === id);
  if (!lend) return;
  const payments = db.transactions.filter(t => t.lendId === id).length;
  openConfirm({
    title: 'Xoá khoản vay?',
    message: payments
      ? `Khoản vay này có <b>${payments} giao dịch thu tiền</b> đi kèm và sẽ bị xoá theo.`
      : 'Khoản vay này sẽ bị xoá vĩnh viễn.',
    confirmText: 'Xoá',
    onConfirm: () => {
      db.transactions = db.transactions.filter(x => x.id !== id && x.lendId !== id);
      save(); navigate();
      toast('Đã xoá', 'success');
    },
  });
}

function confirmDeleteTx(id) {
  openConfirm({
    title: 'Xoá giao dịch?',
    message: 'Giao dịch này sẽ bị xoá vĩnh viễn.',
    confirmText: 'Xoá',
    onConfirm: () => {
      db.transactions = db.transactions.filter(x => x.id !== id);
      save(); navigate();
      toast('Đã xoá', 'success');
    },
  });
}

function confirmClearAll() {
  openConfirm({
    title: 'Xoá toàn bộ dữ liệu?',
    message: `Toàn bộ <b>${db.contacts.length} người vay</b> và <b>${db.transactions.length} giao dịch</b> sẽ bị xoá. Nên sao lưu trước.`,
    confirmText: 'Xoá hết',
    onConfirm: () => {
      db = { contacts: [], transactions: [] };
      save(); buildNav();
      location.hash = '#/dashboard';
      toast('Đã xoá toàn bộ', 'success');
    },
  });
}

/* ============================================================
   EXPORT / IMPORT
   ============================================================ */
function exportJSON() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debtor-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Đã xuất file', 'success');
}

function exportCSV() {
  const header = ['Người vay', 'Loại', 'Số tiền', 'Lãi suất (%/tháng)', 'Kỳ hạn (tháng)', 'Ngày', 'Đáo hạn', 'Ghi chú'];
  const rows = db.transactions.map(t => {
    const c = db.contacts.find(x => x.id === t.contactId);
    return [
      c?.name || '',
      t.type === 'lend' ? 'Cho vay' : t.type === 'interest' ? 'Thu lãi' : 'Thu gốc',
      t.amount,
      t.type === 'lend' ? t.rate : '',
      t.type === 'lend' ? t.months : '',
      t.date,
      t.type === 'lend' ? addMonths(t.date, t.months) : '',
      t.note || '',
    ];
  });
  const csv = [header, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debtor-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Đã xuất CSV', 'success');
}

async function handleImportFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.contacts) || !Array.isArray(data.transactions)) {
      throw new Error('Sai định dạng');
    }
    openConfirm({
      title: 'Khôi phục dữ liệu?',
      message: `Thay thế toàn bộ dữ liệu hiện tại bằng <b>${data.contacts.length} người vay</b> và <b>${data.transactions.length} giao dịch</b> từ file.`,
      confirmText: 'Khôi phục',
      danger: false,
      onConfirm: () => {
        db = { contacts: data.contacts, transactions: data.transactions };
        save(); buildNav(); navigate();
        toast('Đã khôi phục', 'success');
      },
    });
  } catch (err) {
    console.error(err);
    toast('File không hợp lệ', 'error');
  } finally {
    e.target.value = '';
  }
}

/* ============================================================
   SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modalRoot').innerHTML) closeModal();
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openLendForm({}); }
  if (e.key === '/') {
    e.preventDefault();
    const s = $('.search-input');
    if (s) s.focus();
  }
});

/* ============================================================
   INIT
   ============================================================ */
function init() {
  applyTheme(getTheme() || 'system');

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((getTheme() || 'system') === 'system') applyTheme('system');
  });

  load();
  buildNav();

  document.body.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if ($('#view')?.contains(el)) return;
    handleAction({ currentTarget: el });
  });

  $('#fab').addEventListener('click', () => openLendForm({}));
  $('#backBtn').addEventListener('click', () => history.back());

  window.addEventListener('hashchange', () => { buildNav(); navigate(); });
  if (!location.hash) location.hash = '#/dashboard';
  navigate();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
