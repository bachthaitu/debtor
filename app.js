/* =========================================================
   Debtor — Quản lý cho vay theo kỳ hạn tháng
   ========================================================= */
'use strict';

const DB_KEY = 'debtor-db-v3';
const THEME_KEY = 'debtor-theme-v3';
const DAYS_PER_MONTH = 30;
const DUE_SOON_DAYS = 7;

const TYPES = {
  lend:      { label: 'Cho vay',  icon: 'arrowUpRight',  tone: 'lend' },
  interest:  { label: 'Thu lãi',  icon: 'percent',       tone: 'interest' },
  principal: { label: 'Thu gốc',  icon: 'arrowDownLeft', tone: 'principal' },
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'home' },
  { id: 'contacts',  label: 'Người vay', icon: 'users' },
  { id: 'activity',  label: 'Hoạt động', icon: 'activity' },
  { id: 'settings',  label: 'Cài đặt',   icon: 'settings' },
];

const PAGE_TITLES = {
  dashboard: 'Tổng quan',
  contacts:  'Người vay',
  activity:  'Hoạt động',
  settings:  'Cài đặt',
};

const TERM_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/* ============ STATE ============ */
let db = { contacts: [], transactions: [] };
let currentRoute = { page: 'dashboard', id: null };

/* ============ ICONS ============ */
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  arrowDownLeft: '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
  percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 10.5l-5.1 1.7L13 18l-1.9-5.8L6 10.5l5.1-1.7z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
};

function icon(name, size = 20) {
  const paths = ICONS[name] || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

/* ============ HELPERS ============ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const nf = new Intl.NumberFormat('vi-VN');
const money = n => nf.format(Math.round(Number(n) || 0)) + ' ₫';
const moneySigned = n => (n > 0 ? '+' : n < 0 ? '−' : '') + money(Math.abs(n));

const escapeHtml = s => {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const initials = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
  return Math.abs(h);
}

function avatarColor(name) {
  const hue = hashStr(name) % 360;
  return `linear-gradient(135deg, hsl(${hue} 42% 58%), hsl(${(hue + 30) % 360} 48% 46%))`;
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isoFromDate = d => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = iso => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const relativeDate = iso => {
  if (!iso) return '';
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  const days = Math.round((t - d) / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return formatDate(iso);
};

const daysBetween = (fromISO, toISO) => {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  return Math.floor((b - a) / 86400000);
};

/* Tính ngày đáo hạn = ngày cho vay + số tháng */
function addMonths(iso, months) {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return isoFromDate(d);
}

/* ============ LOAN CALCULATIONS ============ */
/**
 * Lãi dự kiến khi đáo hạn (theo kỳ hạn)
 * = gốc × (lãi suất %/tháng) × số tháng
 */
function lendProjectedInterest(lend) {
  return lend.amount * (lend.rate / 100) * lend.months;
}

/**
 * Lãi tích lũy đến hôm nay
 * = gốc × lãi suất × min(số ngày đã qua / 30, số tháng)
 */
function lendAccruedInterest(lend) {
  const daysElapsed = Math.max(0, daysBetween(lend.date, todayISO()));
  const monthsElapsed = Math.min(daysElapsed / DAYS_PER_MONTH, lend.months);
  return lend.amount * (lend.rate / 100) * monthsElapsed;
}

function lendDueDate(lend) {
  return addMonths(lend.date, lend.months);
}

/** Tổng kết cho 1 khoản vay, có tính các giao dịch thu lãi / thu gốc */
function lendSummary(lend) {
  const payments = db.transactions.filter(t =>
    t.lendId === lend.id && (t.type === 'interest' || t.type === 'principal')
  );
  const paidInterest = payments.filter(p => p.type === 'interest').reduce((s, p) => s + p.amount, 0);
  const paidPrincipal = payments.filter(p => p.type === 'principal').reduce((s, p) => s + p.amount, 0);

  const projectedInterest = lendProjectedInterest(lend);
  const accruedInterest = lendAccruedInterest(lend);
  const outstandingPrincipal = Math.max(0, lend.amount - paidPrincipal);
  const outstandingInterest = Math.max(0, accruedInterest - paidInterest);
  const totalOutstanding = outstandingPrincipal + outstandingInterest;

  const today = todayISO();
  const dueDate = lendDueDate(lend);
  const daysToDue = daysBetween(today, dueDate);

  let status = 'active';
  let statusLabel = 'Đang vay';
  if (paidPrincipal >= lend.amount - 100 && paidInterest >= projectedInterest - 100) {
    status = 'closed'; statusLabel = 'Tất toán';
  } else if (daysToDue < 0) {
    status = 'overdue'; statusLabel = `Quá hạn ${-daysToDue} ngày`;
  } else if (daysToDue <= DUE_SOON_DAYS) {
    status = 'due-soon'; statusLabel = daysToDue === 0 ? 'Đáo hạn hôm nay' : `Còn ${daysToDue} ngày`;
  } else {
    status = 'active'; statusLabel = `Còn ${daysToDue} ngày`;
  }

  const progress = lend.months > 0
    ? Math.min(100, Math.max(0, (daysBetween(lend.date, today) / DAYS_PER_MONTH / lend.months) * 100))
    : 0;

  return {
    lend,
    paidInterest, paidPrincipal,
    projectedInterest, accruedInterest,
    outstandingPrincipal, outstandingInterest, totalOutstanding,
    dueDate, daysToDue, status, statusLabel,
    progress,
  };
}

/* Tổng kết cho 1 người */
function contactStats(contactId) {
  const lends = db.transactions.filter(t => t.contactId === contactId && t.type === 'lend');
  const summaries = lends.map(lendSummary);

  let totalOutstanding = 0;
  let totalPrincipalOut = 0;
  let totalInterestOut = 0;
  let totalPaid = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;
  let activeCount = 0;

  summaries.forEach(s => {
    if (s.status === 'closed') {
      totalPaid += s.paidInterest + s.paidPrincipal;
    } else {
      totalOutstanding += s.totalOutstanding;
      totalPrincipalOut += s.outstandingPrincipal;
      totalInterestOut += s.outstandingInterest;
      if (s.status === 'overdue') overdueCount++;
      else if (s.status === 'due-soon') dueSoonCount++;
      else activeCount++;
    }
  });

  return {
    lends: summaries,
    lendCount: lends.length,
    totalOutstanding,
    totalPrincipalOut,
    totalInterestOut,
    totalPaid,
    overdueCount, dueSoonCount, activeCount,
  };
}

/* Tổng toàn hệ thống */
function globalStats() {
  let totalOutstanding = 0;
  let totalPrincipalOut = 0;
  let totalInterestOut = 0;
  let totalPaid = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;

  db.contacts.forEach(c => {
    const s = contactStats(c.id);
    totalOutstanding += s.totalOutstanding;
    totalPrincipalOut += s.totalPrincipalOut;
    totalInterestOut += s.totalInterestOut;
    totalPaid += s.totalPaid;
    overdueCount += s.overdueCount;
    dueSoonCount += s.dueSoonCount;
  });

  return {
    totalOutstanding,
    totalPrincipalOut,
    totalInterestOut,
    totalPaid,
    overdueCount,
    dueSoonCount,
  };
}

/* Danh sách các khoản vay cần chú ý (sắp đáo hạn / quá hạn) */
function attentionLends() {
  const list = [];
  db.contacts.forEach(c => {
    db.transactions
      .filter(t => t.contactId === c.id && t.type === 'lend')
      .forEach(l => {
        const s = lendSummary(l);
        if (s.status === 'overdue' || s.status === 'due-soon') {
          list.push({ contact: c, summary: s });
        }
      });
  });
  return list.sort((a, b) => a.summary.daysToDue - b.summary.daysToDue);
}

/* Dòng tiền 6 tháng gần nhất */
function cashflowData() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `T${d.getMonth() + 1}`;
    months.push({ key, label, out: 0, in: 0 });
  }
  db.transactions.forEach(t => {
    const m = (t.date || '').slice(0, 7);
    const slot = months.find(x => x.key === m);
    if (!slot) return;
    if (t.type === 'lend') slot.out += t.amount;
    else slot.in += t.amount;
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
function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
}

function applyTheme(theme) {
  if (!theme || theme === 'system') {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    document.documentElement.dataset.theme = theme;
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}

  const actual = document.documentElement.dataset.theme;
  $$('[data-theme-label]').forEach(el => {
    el.textContent = actual === 'dark' ? 'Giao diện tối' : 'Giao diện sáng';
  });
  $$('[data-icon="theme"]').forEach(el => {
    el.innerHTML = icon(actual === 'dark' ? 'sun' : 'moon', 20);
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
  const iconName = type === 'error' ? 'x' : type === 'success' ? 'check' : 'sparkle';
  el.innerHTML = `${icon(iconName, 16)}<span>${escapeHtml(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 220);
  }, 2200);
}

/* ============ NAV ============ */
function buildNav() {
  const navHTML = NAV_ITEMS.map(item => `
    <a href="#/${item.id}" class="nav-item" data-nav="${item.id}">
      <span class="nav-icon">${icon(item.icon, 20)}</span>
      <span class="nav-label">${item.label}</span>
      ${item.id === 'contacts' && db.contacts.length ? `<span class="nav-badge">${db.contacts.length}</span>` : ''}
    </a>
  `).join('');
  $('#sidebarNav').innerHTML = navHTML;

  const tabHTML = NAV_ITEMS.map(item => `
    <a href="#/${item.id}" class="tab" data-nav="${item.id}">
      <span class="tab-icon">${icon(item.icon, 22)}</span>
      <span class="tab-label">${item.label}</span>
    </a>
  `).join('');
  $('#tabbar').innerHTML = tabHTML;
}

function setActiveNav(page) {
  $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === page));
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { page: parts[0] || 'dashboard', id: parts[1] || null };
}

function navigate() {
  currentRoute = parseHash();
  const { page, id } = currentRoute;

  let title = PAGE_TITLES[page] || 'Debtor';
  if (page === 'contacts' && id) {
    const c = db.contacts.find(x => x.id === id);
    if (c) title = c.name;
  }
  $('#pageTitle').textContent = title;

  const backBtn = $('#backBtn');
  if (page === 'contacts' && id) {
    backBtn.hidden = false;
    backBtn.innerHTML = icon('chevronLeft', 20);
  } else {
    backBtn.hidden = true;
  }

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
      <button class="btn accent" data-action="new-lend" data-contact="${id}">
        ${icon('plus', 16)}<span>Cho vay</span>
      </button>`;
  } else if (page === 'contacts') {
    box.innerHTML = `<button class="btn accent" data-action="new-contact">${icon('plus', 16)}<span>Thêm người</span></button>`;
  } else if (page === 'activity') {
    box.innerHTML = `<button class="btn accent" data-action="new-lend">${icon('plus', 16)}<span>Cho vay</span></button>`;
  } else if (page === 'settings') {
    box.innerHTML = '';
  } else {
    box.innerHTML = `<button class="btn accent" data-action="new-lend">${icon('plus', 16)}<span>Cho vay</span></button>`;
  }
}

/* ============================================================
   VIEW: DASHBOARD
   ============================================================ */
function renderDashboard() {
  const g = globalStats();
  const alerts = attentionLends();
  const cashflow = cashflowData();

  const recent = [...db.transactions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  const html = `
    <section class="hero">
      <div class="hero-eyebrow">${icon('wallet', 14)} Tổng dư nợ cần thu</div>
      <div class="hero-net">${money(g.totalOutstanding)}</div>
      <div class="hero-split">
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('wallet', 13)} Gốc còn lại</span>
          <span class="hero-split-value text">${money(g.totalPrincipalOut)}</span>
        </div>
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('percent', 13)} Lãi tích lũy</span>
          <span class="hero-split-value amber">${money(g.totalInterestOut)}</span>
        </div>
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('check', 13)} Đã thu về</span>
          <span class="hero-split-value pos">${money(g.totalPaid)}</span>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stat">
        <span class="stat-label">${icon('users', 14)} Người vay</span>
        <span class="stat-value">${db.contacts.length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">${icon('clock', 14)} Đang hoạt động</span>
        <span class="stat-value">${db.transactions.filter(t => t.type === 'lend').length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">${icon('bell', 14)} Sắp đáo hạn</span>
        <span class="stat-value amber">${g.dueSoonCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">${icon('bell', 14)} Quá hạn</span>
        <span class="stat-value red">${g.overdueCount}</span>
      </div>
    </section>

    ${alerts.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">${icon('bell', 18)} Cần chú ý</h2>
        <span class="section-link">${alerts.length} khoản</span>
      </div>
      <div class="alert-list">
        ${alerts.slice(0, 5).map(alertItemHTML).join('')}
      </div>
    </section>` : ''}

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">${icon('activity', 18)} Dòng tiền 6 tháng</h2>
      </div>
      <div class="card chart-card">
        <div class="chart-head">
          <span style="font-size:13px;color:var(--text-2)">So sánh tiền cho vay ra và tiền thu về</span>
          <div class="chart-legend">
            <span class="chart-legend-item"><span class="chart-legend-dot out"></span> Cho vay</span>
            <span class="chart-legend-item"><span class="chart-legend-dot in"></span> Thu về</span>
          </div>
        </div>
        ${chartHTML(cashflow)}
      </div>
    </section>

    ${recent.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Giao dịch gần đây</h2>
        <a href="#/activity" class="section-link">Xem tất cả ${icon('chevronRight', 14)}</a>
      </div>
      <div class="card tx-list">${recent.map(txRowHTML).join('')}</div>
    </section>` : `
    <section class="section">
      <div class="empty">
        <div class="empty-icon">${icon('inbox', 28)}</div>
        <h3 class="empty-title">Chưa có giao dịch nào</h3>
        <p class="empty-text">Ghi lại khoản cho vay đầu tiên để bắt đầu theo dõi gốc và lãi.</p>
        <button class="btn accent" data-action="new-lend">${icon('plus', 16)} Cho vay</button>
      </div>
    </section>`}
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

function alertItemHTML({ contact, summary }) {
  const s = summary;
  const isOverdue = s.status === 'overdue';
  return `
    <div class="alert-item ${isOverdue ? 'overdue' : ''}" data-contact-id="${contact.id}">
      <div class="contact-avatar" style="background:${avatarColor(contact.name)};width:40px;height:40px;font-size:14px;border-radius:12px">${escapeHtml(initials(contact.name))}</div>
      <div class="alert-body">
        <div class="alert-name">${escapeHtml(contact.name)}</div>
        <div class="alert-meta">
          ${isOverdue ? `Quá hạn từ ${formatDate(s.dueDate)}` : `Đáo hạn ${formatDate(s.dueDate)}`}
          · Gốc ${money(s.lend.amount)}
        </div>
      </div>
      <div class="alert-amount">
        <span class="alert-amount-value">${money(s.totalOutstanding)}</span>
        <span class="alert-days ${isOverdue ? '' : 'amber'}">${s.statusLabel}</span>
      </div>
    </div>
  `;
}

function chartHTML(months) {
  const maxVal = Math.max(...months.flatMap(m => [m.in, m.out]), 1);
  return `
    <div class="chart">
      ${months.map(m => `
        <div class="chart-col">
          <div class="chart-bars">
            <div class="chart-bar out"
                 style="height:${(m.out / maxVal) * 100}%"
                 data-tip="Cho vay: ${money(m.out)}"
                 title="Cho vay: ${money(m.out)}"></div>
            <div class="chart-bar in"
                 style="height:${(m.in / maxVal) * 100}%"
                 data-tip="Thu về: ${money(m.in)}"
                 title="Thu về: ${money(m.in)}"></div>
          </div>
          <div class="chart-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================================
   VIEW: CONTACTS
   ============================================================ */
function renderContacts() {
  const q = (window.__search || '').trim().toLowerCase();
  const sortBy = window.__sort || 'balance';

  let list = db.contacts.slice();

  if (q) list = list.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q) ||
    (c.note || '').toLowerCase().includes(q)
  );

  const withStats = list.map(c => ({ c, s: contactStats(c.id) }));

  withStats.sort((a, b) => {
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
        <input type="search" class="search-input" id="contactSearch" placeholder="Tìm theo tên, SĐT, ghi chú…" value="${escapeHtml(window.__search || '')}" autocomplete="off">
      </div>
      <select class="select" id="contactSort">
        <option value="balance"${sortBy === 'balance' ? ' selected' : ''}>Dư nợ cao nhất</option>
        <option value="overdue"${sortBy === 'overdue' ? ' selected' : ''}>Quá hạn nhiều nhất</option>
        <option value="name"${sortBy === 'name' ? ' selected' : ''}>Tên A–Z</option>
      </select>
    </div>
    ${!db.contacts.length ? `
      <div class="empty">
        <div class="empty-icon">${icon('users', 28)}</div>
        <h3 class="empty-title">Chưa có người vay nào</h3>
        <p class="empty-text">Thêm người vay đầu tiên để bắt đầu quản lý gốc và lãi.</p>
        <button class="btn accent" data-action="new-contact">${icon('plus', 16)} Thêm người vay</button>
      </div>
    ` : !list.length ? `
      <div class="empty">
        <div class="empty-icon">${icon('search', 28)}</div>
        <h3 class="empty-title">Không tìm thấy ai</h3>
        <p class="empty-text">Thử từ khoá khác xem sao.</p>
      </div>
    ` : `
      <div class="grid">
        ${withStats.map(({ c, s }) => contactCardHTML(c, s)).join('')}
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
      const newInp = $('#contactSearch');
      if (newInp) { newInp.focus(); try { newInp.setSelectionRange(pos, pos); } catch (_) {} }
    });
  }
  const sel = $('#contactSort');
  if (sel) sel.addEventListener('change', e => { window.__sort = e.target.value; renderContacts(); });

  bindViewEvents();
}

function contactCardHTML(c, s) {
  const bal = s.totalOutstanding;
  const hasOverdue = s.overdueCount > 0;
  const hasDueSoon = s.dueSoonCount > 0;

  let metaText = '';
  if (s.lendCount) {
    metaText = `${s.lendCount} khoản`;
    if (hasOverdue) metaText += ` · ${s.overdueCount} quá hạn`;
    else if (hasDueSoon) metaText += ` · ${s.dueSoonCount} sắp hạn`;
  } else {
    metaText = 'Chưa có khoản vay';
  }

  return `
    <article class="contact-card" data-contact-id="${c.id}">
      <div class="contact-top">
        <div class="contact-avatar" style="background:${avatarColor(c.name)}">${escapeHtml(initials(c.name))}</div>
        <div class="contact-body">
          <div class="contact-name">${escapeHtml(c.name)}</div>
          <div class="contact-sub">${c.phone ? escapeHtml(c.phone) : (c.note ? escapeHtml(c.note) : '—')}</div>
        </div>
        ${hasOverdue ? `<span class="status-badge overdue"><span class="status-dot"></span>Quá hạn</span>` :
          hasDueSoon ? `<span class="status-badge due-soon"><span class="status-dot"></span>Sắp hạn</span>` :
          (bal > 0 ? `<span class="status-badge active"><span class="status-dot"></span>Đang vay</span>` :
          `<span class="status-badge closed"><span class="status-dot"></span>Sạch nợ</span>`)}
      </div>
      <div class="contact-bottom">
        <div class="contact-balance">
          <span class="contact-balance-label">CÒN PHẢI THU</span>
          <span class="contact-balance-amount ${bal <= 0 ? 'zero' : ''}">${bal > 0 ? money(bal) : '0 ₫'}</span>
        </div>
        <div class="contact-meta">
          <span class="contact-meta-text">${metaText}</span>
          ${s.totalInterestOut > 0 ? `<span class="contact-meta-text" style="color:var(--amber)">Lãi ${money(s.totalInterestOut)}</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

/* ============================================================
   VIEW: CONTACT DETAIL
   ============================================================ */
function renderContactDetail(id) {
  const c = db.contacts.find(x => x.id === id);
  if (!c) { location.hash = '#/contacts'; return; }

  const s = contactStats(id);
  const subParts = [];
  if (c.phone) subParts.push(escapeHtml(c.phone));
  if (c.note) subParts.push(escapeHtml(c.note));
  const sub = subParts.join(' · ') || 'Không có thông tin thêm';

  const allTxns = db.transactions
    .filter(t => t.contactId === id)
    .sort((x, y) => (y.date || '').localeCompare(x.date || '') || (y.createdAt || 0) - (x.createdAt || 0));

  const activeLends = s.lends.filter(x => x.status !== 'closed');
  const closedLends = s.lends.filter(x => x.status === 'closed');
  const sortedLends = [...activeLends, ...closedLends];

  const html = `
    <div class="detail-head">
      <div class="detail-avatar" style="background:${avatarColor(c.name)}">${escapeHtml(initials(c.name))}</div>
      <div class="detail-info">
        <h2 class="detail-name">${escapeHtml(c.name)}</h2>
        <p class="detail-sub">${sub}</p>
      </div>
    </div>

    <div class="detail-balance">
      <div class="detail-balance-label">Tổng còn phải thu</div>
      <div class="detail-balance-amount ${s.totalOutstanding <= 0 ? 'zero' : ''}">${money(Math.max(0, s.totalOutstanding))}</div>
      <div class="detail-sub-nums">
        <div>
          <div class="detail-sub-num-label">Gốc còn lại</div>
          <div class="detail-sub-num-value">${money(s.totalPrincipalOut)}</div>
        </div>
        <div>
          <div class="detail-sub-num-label">Lãi tích lũy chưa thu</div>
          <div class="detail-sub-num-value" style="color:var(--amber)">${money(s.totalInterestOut)}</div>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="btn accent" data-action="new-lend" data-contact="${id}">${icon('plus', 16)} Cho vay mới</button>
      <button class="btn ghost" data-action="print-contact" data-id="${id}">${icon('print', 16)} In sao kê</button>
      <button class="btn soft-danger" data-action="delete-contact" data-id="${id}">${icon('trash', 16)} Xoá</button>
    </div>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Các khoản vay (${s.lendCount})</h2>
      </div>
      ${sortedLends.length ? `
        <div class="loan-list">
          ${sortedLends.map(lendCardHTML).join('')}
        </div>
      ` : `
        <div class="empty" style="padding:36px 20px">
          <div class="empty-icon">${icon('inbox', 24)}</div>
          <p class="empty-text" style="margin:0">Chưa có khoản vay nào.</p>
        </div>
      `}
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Lịch sử (${allTxns.length})</h2>
      </div>
      ${allTxns.length ? `
        <div class="card tx-list">${allTxns.map(txRowHTML).join('')}</div>
      ` : `
        <div class="empty" style="padding:36px 20px">
          <div class="empty-icon">${icon('inbox', 24)}</div>
          <p class="empty-text" style="margin:0">Chưa có giao dịch nào.</p>
        </div>
      `}
    </section>
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

function lendCardHTML(s) {
  const l = s.lend;
  const statusCls = s.status;
  const progressCls = s.status === 'overdue' ? 'overdue' : s.status === 'closed' ? 'closed' : '';
  const progressPct = Math.min(100, s.progress).toFixed(1);

  const progressLabelLeft = s.status === 'closed' ? 'Đã tất toán' :
    s.status === 'overdue' ? `Quá hạn ${-s.daysToDue} ngày` :
    `Còn ${s.daysToDue} ngày`;

  return `
    <article class="loan-card">
      <div class="loan-head">
        <div style="min-width:0">
          <div class="loan-amount">${money(l.amount)}</div>
          <div class="loan-meta">
            <span class="loan-rate-badge">${icon('percent', 11)} ${l.rate}%/tháng</span>
            <span class="loan-term-badge">${icon('calendar', 11)} ${l.months} tháng</span>
            <span>${formatDate(l.date)} → ${formatDate(s.dueDate)}</span>
          </div>
        </div>
        <div class="loan-actions">
          <span class="status-badge ${statusCls}"><span class="status-dot"></span>${s.statusLabel}</span>
          <button class="icon-btn sm" data-tx-edit="${l.id}" title="Sửa">${icon('edit', 15)}</button>
          <button class="icon-btn sm danger" data-tx-del="${l.id}" title="Xoá">${icon('trash', 15)}</button>
        </div>
      </div>

      <div class="loan-progress">
        <div class="loan-progress-bar">
          <div class="loan-progress-fill ${progressCls}" style="width:${progressPct}%"></div>
        </div>
        <div class="loan-progress-label">
          <span>${progressLabelLeft}</span>
          <span>${progressPct}% kỳ hạn</span>
        </div>
      </div>

      <div class="loan-nums">
        <div>
          <div class="loan-num-label">Gốc còn lại</div>
          <div class="loan-num-value">${money(s.outstandingPrincipal)}</div>
        </div>
        <div>
          <div class="loan-num-label">Lãi tích lũy</div>
          <div class="loan-num-value amber">${money(s.outstandingInterest)}</div>
        </div>
        <div>
          <div class="loan-num-label">Tổng phải thu</div>
          <div class="loan-num-value accent">${money(s.totalOutstanding)}</div>
        </div>
      </div>

      ${s.status !== 'closed' ? `
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          <button class="btn ghost sm" data-action="collect-interest" data-lend="${l.id}">${icon('percent', 14)} Thu lãi</button>
          <button class="btn ghost sm" data-action="collect-principal" data-lend="${l.id}">${icon('arrowDownLeft', 14)} Thu gốc</button>
        </div>
      ` : ''}

      ${l.note ? `<p class="loan-note">${escapeHtml(l.note)}</p>` : ''}
    </article>
  `;
}

/* ============================================================
   VIEW: ACTIVITY
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

  const groups = new Map();
  list.forEach(t => {
    const d = t.date || '';
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d).push(t);
  });

  const html = `
    <div class="toolbar">
      <div class="search-wrap">
        ${icon('search', 18)}
        <input type="search" class="search-input" id="activitySearch" placeholder="Tìm giao dịch…" value="${escapeHtml(window.__search || '')}" autocomplete="off">
      </div>
      <select class="select" id="activityFilter">
        <option value="all"${filter === 'all' ? ' selected' : ''}>Tất cả loại</option>
        <option value="lend"${filter === 'lend' ? ' selected' : ''}>Cho vay</option>
        <option value="interest"${filter === 'interest' ? ' selected' : ''}>Thu lãi</option>
        <option value="principal"${filter === 'principal' ? ' selected' : ''}>Thu gốc</option>
      </select>
    </div>

    ${!list.length ? `
      <div class="empty">
        <div class="empty-icon">${icon('activity', 28)}</div>
        <h3 class="empty-title">Không có giao dịch</h3>
        <p class="empty-text">${db.transactions.length ? 'Thử đổi bộ lọc hoặc từ khoá.' : 'Ghi lại giao dịch đầu tiên để bắt đầu.'}</p>
        ${!db.transactions.length ? `<button class="btn accent" data-action="new-lend">${icon('plus', 16)} Cho vay</button>` : ''}
      </div>
    ` : [...groups.entries()].map(([date, items]) => `
      <section class="section" style="margin-bottom:22px">
        <div class="section-head">
          <h2 class="section-title">${relativeDate(date)}</h2>
          <span style="font-size:12.5px;color:var(--text-3)">${items.length} giao dịch</span>
        </div>
        <div class="card tx-list">${items.map(txRowHTML).join('')}</div>
      </section>
    `).join('')}
  `;

  $('#view').innerHTML = html;

  const inp = $('#activitySearch');
  if (inp) {
    inp.addEventListener('input', e => {
      window.__search = e.target.value;
      const pos = e.target.selectionStart;
      renderActivity();
      const newInp = $('#activitySearch');
      if (newInp) { newInp.focus(); try { newInp.setSelectionRange(pos, pos); } catch (_) {} }
    });
  }
  const sel = $('#activityFilter');
  if (sel) sel.addEventListener('change', e => { window.__filter = e.target.value; renderActivity(); });

  bindViewEvents();
}

/* ============================================================
   TX ROW
   ============================================================ */
function txRowHTML(t) {
  const c = db.contacts.find(x => x.id === t.contactId);
  const T = TYPES[t.type] || TYPES.lend;
  const name = c ? c.name : 'Không rõ';

  let meta = '';
  if (t.type === 'lend') {
    meta = `${T.label} · ${t.rate}%/tháng · ${t.months} tháng · ${formatDate(t.date)}`;
  } else {
    meta = `${T.label} · ${formatDate(t.date)}`;
  }

  const amountSign = t.type === 'lend' ? '−' : '+';
  const amountCls = t.type === 'lend' ? 'neg' : 'pos';

  return `
    <div class="tx-row" data-tx-id="${t.id}">
      <div class="tx-icon ${T.tone}">${icon(T.icon, 18)}</div>
      <div class="tx-body">
        <div class="tx-name">${escapeHtml(name)}</div>
        <div class="tx-meta">${meta}${t.note ? ' · ' + escapeHtml(t.note) : ''}</div>
      </div>
      <div class="tx-amount ${amountCls}">${amountSign}${money(t.amount)}</div>
      <div class="tx-actions">
        <button class="icon-btn sm" data-tx-edit="${t.id}" title="Sửa">${icon('edit', 15)}</button>
        <button class="icon-btn sm danger" data-tx-del="${t.id}" title="Xoá">${icon('trash', 15)}</button>
      </div>
    </div>
  `;
}

/* ============================================================
   VIEW: SETTINGS
   ============================================================ */
function renderSettings() {
  const themeVal = getStoredTheme() || 'system';

  const html = `
    <div class="settings-group">
      <h3 class="settings-group-title">Giao diện</h3>
      <div class="card" style="padding:16px">
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
        <span class="settings-item-icon accent">${icon('download', 19)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title">Sao lưu (JSON)</div>
          <div class="settings-item-desc">Tải toàn bộ dữ liệu về máy để dự phòng</div>
        </div>
        ${icon('chevronRight', 18)}
      </button>
      <label class="settings-item" for="importFile" style="cursor:pointer">
        <span class="settings-item-icon accent">${icon('upload', 19)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title">Khôi phục từ file</div>
          <div class="settings-item-desc">Ghi đè dữ liệu hiện tại bằng file JSON đã sao lưu</div>
        </div>
        ${icon('chevronRight', 18)}
        <input type="file" id="importFile" accept="application/json,.json" hidden>
      </label>
      <button class="settings-item" data-action="export-csv">
        <span class="settings-item-icon">${icon('download', 19)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title">Xuất CSV</div>
          <div class="settings-item-desc">Mở bằng Excel / Google Sheets</div>
        </div>
        ${icon('chevronRight', 18)}
      </button>
    </div>

    <div class="settings-group">
      <h3 class="settings-group-title">Vùng nguy hiểm</h3>
      <button class="settings-item" data-action="clear-all">
        <span class="settings-item-icon danger">${icon('trash', 19)}</span>
        <div class="settings-item-body">
          <div class="settings-item-title" style="color:var(--red)">Xoá toàn bộ dữ liệu</div>
          <div class="settings-item-desc">Xoá hết người vay và giao dịch (không hoàn tác)</div>
        </div>
      </button>
    </div>

    <div class="settings-group">
      <h3 class="settings-group-title">Hướng dẫn tính lãi</h3>
      <div class="card" style="padding:18px">
        <p style="font-size:13.5px;color:var(--text-2);line-height:1.7;margin:0">
          <b style="color:var(--text)">Lãi dự kiến (khi đáo hạn):</b><br>
          Gốc × (Lãi suất ÷ 100) × Số tháng<br><br>
          <b style="color:var(--text)">Lãi tích lũy (đến hôm nay):</b><br>
          Gốc × (Lãi suất ÷ 100) × (Số ngày ÷ 30)
        </p>
        <p style="font-size:12.5px;color:var(--text-3);line-height:1.6;margin-top:14px;padding-top:14px;border-top:1px dashed var(--border)">
          Dữ liệu lưu trong <b>localStorage</b> của trình duyệt này. Hãy sao lưu định kỳ bằng nút <b>Sao lưu</b> ở trên.
        </p>
      </div>
    </div>
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bindViewEvents() {
  const view = $('#view');

  $$('[data-contact-id]', view).forEach(el => {
    el.addEventListener('click', () => {
      location.hash = `#/contacts/${el.dataset.contactId}`;
    });
  });

  $$('[data-tx-id]', view).forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('[data-tx-edit]') || e.target.closest('[data-tx-del]')) return;
      openTxForm({ id: row.dataset.txId });
    });
  });

  $$('[data-tx-edit]', view).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openTxForm({ id: btn.dataset.txEdit });
    });
  });

  $$('[data-tx-del]', view).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      confirmDeleteTx(btn.dataset.txDel);
    });
  });

  $$('#themeSeg [data-theme-val]', view).forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeVal);
      renderSettings();
    });
  });

  const imp = $('#importFile');
  if (imp) imp.addEventListener('change', handleImportFile);

  $$('[data-action]', view).forEach(el => {
    el.addEventListener('click', handleAction);
  });
}

function handleAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;
  const id = el.dataset.id;
  const contactId = el.dataset.contact;
  const lendId = el.dataset.lend;

  switch (action) {
    case 'new-lend':          openLendForm({ contactId }); break;
    case 'collect-interest':  openPaymentForm({ lendId, type: 'interest' }); break;
    case 'collect-principal': openPaymentForm({ lendId, type: 'principal' }); break;
    case 'edit-contact':      openContactForm(id); break;
    case 'delete-contact':    confirmDeleteContact(id); break;
    case 'new-contact':       openContactForm(); break;
    case 'print-contact':     printContact(id); break;
    case 'theme-toggle':      toggleTheme(); break;
    case 'back':              history.back(); break;
    case 'export-json':       exportJSON(); break;
    case 'export-csv':        exportCSV(); break;
    case 'clear-all':         confirmClearAll(); break;
  }
}

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
function openModal(html) {
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-handle"></div>
        ${html}
      </div>
    </div>
  `;
  document.body.style.overflow = 'hidden';

  $('#modalBackdrop').addEventListener('click', e => {
    if (e.target.id === 'modalBackdrop') closeModal();
  });
  $$('[data-close]', root).forEach(el => el.addEventListener('click', closeModal));

  if (window.innerWidth > 640) {
    setTimeout(() => {
      const first = root.querySelector('input:not([type=hidden]):not([readonly]), select, textarea');
      if (first) first.focus();
    }, 80);
  }
}

function closeModal() {
  $('#modalRoot').innerHTML = '';
  document.body.style.overflow = '';
}

/* ============================================================
   MODAL: CONTACT FORM
   ============================================================ */
function openContactForm(id = null) {
  const c = id ? db.contacts.find(x => x.id === id) : null;
  const title = c ? 'Sửa người vay' : 'Thêm người vay';

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 18)}</button>
    </div>
    <form id="contactForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="cName">Tên <span class="req">*</span></label>
          <input type="text" class="input" id="cName" maxlength="60" placeholder="VD: Nguyễn Văn A" value="${escapeHtml(c?.name || '')}" required autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cPhone">Số điện thoại <span class="opt">(tuỳ chọn)</span></label>
          <input type="tel" class="input" id="cPhone" maxlength="20" placeholder="VD: 0912 345 678" value="${escapeHtml(c?.phone || '')}" autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <textarea class="textarea" id="cNote" maxlength="200" placeholder="VD: Bạn giới thiệu, hay vay gấp…">${escapeHtml(c?.note || '')}</textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">${c ? 'Lưu' : 'Thêm'}</button>
      </div>
    </form>
  `);

  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName').value.trim();
    const phone = $('#cPhone').value.trim();
    const note = $('#cNote').value.trim();

    if (!name) { toast('Nhập tên đi bạn', 'error'); return; }

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
   MODAL: LEND FORM
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
  const months = existing ? existing.months : 3;
  const date = existing ? existing.date : todayISO();
  const note = existing ? (existing.note || '') : '';

  const title = isEdit ? 'Sửa khoản vay' : 'Cho vay mới';

  const contactOptions = db.contacts.map(c =>
    `<option value="${c.id}"${c.id === selectedContact ? ' selected' : ''}>${escapeHtml(c.name)}</option>`
  ).join('');

  const termChips = TERM_OPTIONS.map(n =>
    `<button type="button" class="term-chip${n === months ? ' active' : ''}" data-months="${n}">${n}</button>`
  ).join('');

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 18)}</button>
    </div>
    <form id="lendForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="lContact">Người vay <span class="req">*</span></label>
          <select class="select-field" id="lContact" required>${contactOptions}</select>
        </div>

        <div class="field">
          <label class="field-label" for="lAmount">Số tiền cho vay (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="lAmount" inputmode="numeric" placeholder="0" value="${amount ? nf.format(amount) : ''}" required autocomplete="off">
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="lRate">Lãi suất (%/tháng) <span class="req">*</span></label>
            <input type="number" class="input" id="lRate" min="0" step="0.1" placeholder="VD: 10" value="${rate ?? ''}" required>
          </div>
          <div class="field">
            <label class="field-label" for="lDate">Ngày cho vay</label>
            <input type="date" class="input" id="lDate" value="${date}">
          </div>
        </div>

        <div class="field">
          <label class="field-label">Kỳ hạn (tháng) <span class="req">*</span></label>
          <div class="term-grid" id="termGrid">${termChips}</div>
        </div>

        <div class="preview-box" id="previewBox">
          <div class="preview-item">
            <span class="preview-label">Đáo hạn</span>
            <span class="preview-value" id="previewDue">—</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Lãi dự kiến</span>
            <span class="preview-value" id="previewInterest">0 ₫</span>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="lNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <input type="text" class="input" id="lNote" maxlength="120" placeholder="VD: vay mua điện thoại" value="${escapeHtml(note)}" autocomplete="off">
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

    if (amt > 0 && r >= 0 && currentMonths > 0) {
      const due = addMonths(d, currentMonths);
      const interest = amt * (r / 100) * currentMonths;
      $('#previewDue').textContent = formatDate(due);
      $('#previewInterest').textContent = money(interest);
    } else {
      $('#previewDue').textContent = '—';
      $('#previewInterest').textContent = '0 ₫';
    }
  }

  $$('#termGrid .term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentMonths = Number(chip.dataset.months);
      $$('#termGrid .term-chip').forEach(c => c.classList.toggle('active', c === chip));
      updatePreview();
    });
  });

  const amt = $('#lAmount');
  amt.addEventListener('input', () => {
    const digits = amt.value.replace(/\D/g, '');
    amt.value = digits ? nf.format(Number(digits)) : '';
    updatePreview();
  });
  $('#lRate').addEventListener('input', updatePreview);
  $('#lDate').addEventListener('change', updatePreview);

  updatePreview();

  $('#lendForm').addEventListener('submit', e => {
    e.preventDefault();

    const contactIdVal = $('#lContact').value;
    const amountVal = Number(amt.value.replace(/\D/g, ''));
    const rateVal = Number($('#lRate').value);
    const dateVal = $('#lDate').value || todayISO();
    const noteVal = $('#lNote').value.trim();

    if (!contactIdVal) return toast('Chọn người vay', 'error');
    if (!amountVal || amountVal <= 0) return toast('Nhập số tiền hợp lệ', 'error');
    if (!Number.isFinite(rateVal) || rateVal < 0) return toast('Lãi suất không hợp lệ', 'error');

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
   MODAL: PAYMENT FORM (thu lãi / thu gốc)
   ============================================================ */
function openPaymentForm({ lendId, type }) {
  const lend = db.transactions.find(t => t.id === lendId && t.type === 'lend');
  if (!lend) return;

  const s = lendSummary(lend);
  const c = db.contacts.find(x => x.id === lend.contactId);
  const isInterest = type === 'interest';

  const suggestedAmount = isInterest
    ? Math.round(s.outstandingInterest)
    : Math.round(s.outstandingPrincipal);

  const title = isInterest ? 'Thu lãi' : 'Thu gốc';

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title} · ${escapeHtml(c?.name || '')}</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 18)}</button>
    </div>
    <form id="paymentForm">
      <div class="modal-body">
        <div class="preview-box" style="background:${isInterest ? 'var(--amber-soft)' : 'var(--green-soft)'}">
          <div class="preview-item">
            <span class="preview-label" style="color:${isInterest ? 'var(--amber)' : 'var(--green)'}">${isInterest ? 'Lãi chưa thu' : 'Gốc còn lại'}</span>
            <span class="preview-value" style="color:${isInterest ? 'var(--amber)' : 'var(--green)'}">${money(suggestedAmount)}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label" style="color:${isInterest ? 'var(--amber)' : 'var(--green)'}">Khoản vay</span>
            <span class="preview-value" style="color:${isInterest ? 'var(--amber)' : 'var(--green)'}">${money(lend.amount)}</span>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="pAmount">Số tiền thu (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="pAmount" inputmode="numeric" placeholder="0" value="${suggestedAmount > 0 ? nf.format(suggestedAmount) : ''}" required autocomplete="off">
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="pDate">Ngày thu</label>
            <input type="date" class="input" id="pDate" value="${todayISO()}">
          </div>
          <div class="field">
            <label class="field-label">Thu hết?</label>
            <div style="display:flex;gap:6px">
              <button type="button" class="btn ghost sm" style="flex:1" id="fullBtn">Tất cả</button>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="pNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <input type="text" class="input" id="pNote" maxlength="120" placeholder="VD: thu tiền mặt" autocomplete="off">
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">${title}</button>
      </div>
    </form>
  `);

  const amt = $('#pAmount');
  amt.addEventListener('input', () => {
    const digits = amt.value.replace(/\D/g, '');
    amt.value = digits ? nf.format(Number(digits)) : '';
  });
  $('#fullBtn').addEventListener('click', () => {
    amt.value = nf.format(suggestedAmount);
  });

  $('#paymentForm').addEventListener('submit', e => {
    e.preventDefault();
    const amountVal = Number(amt.value.replace(/\D/g, ''));
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
   PRINT STATEMENT
   ============================================================ */
function printContact(id) {
  const c = db.contacts.find(x => x.id === id);
  if (!c) return;
  const s = contactStats(id);

  const rows = s.lends.map(l => {
    const lend = l.lend;
    return `
      <tr>
        <td>${formatDate(lend.date)}</td>
        <td style="text-align:right">${money(lend.amount)}</td>
        <td style="text-align:right">${lend.rate}%</td>
        <td style="text-align:right">${lend.months}</td>
        <td>${formatDate(l.dueDate)}</td>
        <td style="text-align:right">${money(l.outstandingPrincipal)}</td>
        <td style="text-align:right">${money(l.outstandingInterest)}</td>
        <td style="text-align:right"><b>${money(l.totalOutstanding)}</b></td>
      </tr>
    `;
  }).join('');

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`
    <!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Sao kê — ${escapeHtml(c.name)}</title>
    <style>
      body { font-family: 'Lora', Georgia, serif; padding: 40px; color: #1A1917; max-width: 900px; margin: 0 auto; }
      h1 { font-size: 26px; font-weight: 600; margin-bottom: 6px; letter-spacing: -.02em; }
      .sub { color: #6B6860; font-size: 13px; margin-bottom: 24px; }
      .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px; background: #FAF9F5; border: 1px solid #E9E5D9; border-radius: 14px; margin-bottom: 28px; }
      .summary-item { display: flex; flex-direction: column; gap: 4px; }
      .summary-label { font-size: 11.5px; color: #6B6860; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
      .summary-value { font-size: 20px; font-weight: 600; letter-spacing: -.02em; }
      .summary-value.accent { color: #C96442; }
      .summary-value.amber { color: #A87419; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #E9E5D9; }
      th { font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; color: #6B6860; font-weight: 700; }
      tfoot td { font-weight: 700; border-top: 2px solid #1A1917; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #E9E5D9; text-align: center; font-size: 11.5px; color: #A19D91; }
      @media print { body { padding: 20px; } }
    </style></head>
    <body>
      <h1>Sao kê công nợ</h1>
      <div class="sub">
        <b>${escapeHtml(c.name)}</b>
        ${c.phone ? ' · ' + escapeHtml(c.phone) : ''}
        ${c.note ? ' · ' + escapeHtml(c.note) : ''}
        <br>Ngày in: ${formatDate(todayISO())}
      </div>

      <div class="summary">
        <div class="summary-item">
          <span class="summary-label">Gốc còn lại</span>
          <span class="summary-value">${money(s.totalPrincipalOut)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Lãi tích lũy</span>
          <span class="summary-value amber">${money(s.totalInterestOut)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tổng phải thu</span>
          <span class="summary-value accent">${money(s.totalOutstanding)}</span>
        </div>
      </div>

      ${rows ? `
      <table>
        <thead>
          <tr>
            <th>Ngày vay</th>
            <th style="text-align:right">Gốc</th>
            <th style="text-align:right">Lãi/th</th>
            <th style="text-align:right">Kỳ hạn</th>
            <th>Đáo hạn</th>
            <th style="text-align:right">Gốc còn</th>
            <th style="text-align:right">Lãi còn</th>
            <th style="text-align:right">Tổng</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>` : '<p>Chưa có khoản vay nào.</p>'}

      <div class="footer">Debtor — Quản lý cho vay</div>
      <script>setTimeout(() => window.print(), 300);<\/script>
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
      <h2 class="modal-title">${escapeHtml(title)}</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 18)}</button>
    </div>
    <div class="modal-body">
      <p style="margin:0;font-size:14.5px;line-height:1.6;color:var(--text-2)">${message}</p>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn ghost" data-close>Huỷ</button>
      <button type="button" class="btn ${danger ? 'danger' : 'accent'}" id="confirmOk">${escapeHtml(confirmText)}</button>
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
    message: `Bạn sắp xoá <b>${escapeHtml(c.name)}</b>${count ? ` và <b>${count} giao dịch</b> liên quan` : ''}. Không thể hoàn tác.`,
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

function confirmDeleteTx(id) {
  const t = db.transactions.find(x => x.id === id);
  if (!t) return;

  let msg = 'Giao dịch này sẽ bị xoá vĩnh viễn.';
  if (t.type === 'lend') {
    const related = db.transactions.filter(x => x.lendId === id).length;
    if (related) msg = `Khoản vay này có <b>${related} giao dịch thu lãi/thu gốc</b> đi kèm và sẽ bị xoá theo.`;
  }

  openConfirm({
    title: 'Xoá giao dịch?',
    message: msg,
    confirmText: 'Xoá',
    onConfirm: () => {
      db.transactions = db.transactions.filter(x => x.id !== id && x.lendId !== id);
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
  toast('Đã xuất file sao lưu', 'success');
}

function exportCSV() {
  const header = ['Người vay', 'Loại', 'Số tiền', 'Lãi suất (%/tháng)', 'Kỳ hạn (tháng)', 'Ngày', 'Đáo hạn', 'Ghi chú'];
  const rows = db.transactions.map(t => {
    const c = db.contacts.find(x => x.id === t.contactId);
    return [
      c?.name || '',
      TYPES[t.type]?.label || t.type,
      t.amount,
      t.type === 'lend' ? (t.rate || '') : '',
      t.type === 'lend' ? (t.months || '') : '',
      t.date,
      t.type === 'lend' ? addMonths(t.date, t.months || 0) : '',
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
    const search = $('.search-input');
    if (search) search.focus();
  }
});

/* ============================================================
   INIT
   ============================================================ */
function init() {
  applyTheme(getStoredTheme() || 'system');

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((getStoredTheme() || 'system') === 'system') applyTheme('system');
  });

  load();
  buildNav();

  $$('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (name === 'theme') {
      const actual = document.documentElement.dataset.theme;
      el.innerHTML = icon(actual === 'dark' ? 'sun' : 'moon', 20);
    } else if (name === 'plus') {
      el.innerHTML = icon('plus', 22);
    }
  });

  document.body.addEventListener('click', e => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    if ($('#view')?.contains(actionEl)) return;
    handleAction({ currentTarget: actionEl });
  });

  $('#fab').addEventListener('click', () => openLendForm({}));

  window.addEventListener('hashchange', navigate);
  if (!location.hash) location.hash = '#/dashboard';
  navigate();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
