/* =========================================================
   Debtor — Quản lý cho vay lãi suất tháng
   ========================================================= */
'use strict';

const DB_KEY = 'debtor-db-v2';
const THEME_KEY = 'debtor-theme-v2';
const DAYS_PER_MONTH = 30;

/* 3 loại giao dịch chính */
const TYPES = {
  lend:      { label: 'Cho vay',  icon: 'arrowUpRight',  tone: 'lend',      dir: 'out' },
  interest:  { label: 'Thu lãi',  icon: 'percent',       tone: 'interest',  dir: 'in'  },
  principal: { label: 'Thu gốc',  icon: 'arrowDownLeft', tone: 'principal', dir: 'in'  },
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
  trendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 10.5l-5.1 1.7L13 18l-1.9-5.8L6 10.5l5.1-1.7z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
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
  // Warm palette — keep saturation moderate to fit Claude tone
  return `linear-gradient(135deg, hsl(${hue} 45% 58%), hsl(${(hue + 30) % 360} 50% 46%))`;
}

const todayISO = () => {
  const d = new Date();
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
  return Math.max(0, Math.floor((b - a) / 86400000));
};

/* ============ INTEREST CALCULATION ============ */
/**
 * Lãi tích lũy của một khoản cho vay.
 * rate: %/tháng. days/30 để quy ra số tháng.
 *   interest = principal × (rate/100) × (days / 30)
 */
function lendInterest(lend) {
  const days = daysBetween(lend.date, todayISO());
  return lend.amount * (lend.rate / 100) * (days / DAYS_PER_MONTH);
}

function lendTotalDue(lend) {
  return lend.amount + lendInterest(lend);
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

/* ============ STATS ============ */
/**
 * Thống kê của một người vay:
 *   - outstandingPrincipal: gốc chưa thu
 *   - outstandingInterest:  lãi tích lũy chưa thu
 *   - balance:              tổng còn phải thu
 */
function stats(contactId) {
  const txns = db.transactions.filter(t => t.contactId === contactId);

  let totalLent = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  let accruedInterest = 0;
  const lends = [];

  txns.forEach(t => {
    if (t.type === 'lend') {
      totalLent += t.amount;
      accruedInterest += lendInterest(t);
      lends.push(t);
    } else if (t.type === 'interest') {
      totalInterestPaid += t.amount;
    } else if (t.type === 'principal') {
      totalPrincipalPaid += t.amount;
    }
  });

  const outstandingPrincipal = totalLent - totalPrincipalPaid;
  const outstandingInterest = accruedInterest - totalInterestPaid;
  const balance = outstandingPrincipal + outstandingInterest;

  return {
    lends,
    totalLent,
    accruedInterest,
    totalInterestPaid,
    totalPrincipalPaid,
    outstandingPrincipal,
    outstandingInterest,
    balance,
    lendCount: lends.length,
  };
}

function globalStats() {
  let totalOutstanding = 0;
  let totalPrincipal = 0;
  let totalInterestOutstanding = 0;
  let totalCollected = 0;

  db.contacts.forEach(c => {
    const s = stats(c.id);
    totalOutstanding += Math.max(0, s.balance);
    totalPrincipal += Math.max(0, s.outstandingPrincipal);
    totalInterestOutstanding += Math.max(0, s.outstandingInterest);
    totalCollected += s.totalInterestPaid + s.totalPrincipalPaid;
  });

  return {
    totalOutstanding,
    totalPrincipal,
    totalInterestOutstanding,
    totalCollected,
    contactCount: db.contacts.length,
  };
}

/* ============ NAVIGATION ============ */
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
      <button class="icon-btn" data-action="edit-contact" data-id="${id}" title="Sửa">${icon('edit', 18)}</button>
      <button class="btn accent" data-action="new-tx" data-contact="${id}">
        ${icon('plus', 16)}<span>Khoản vay</span>
      </button>`;
  } else if (page === 'contacts') {
    box.innerHTML = `<button class="btn accent" data-action="new-contact">${icon('plus', 16)}<span>Người vay</span></button>`;
  } else if (page === 'activity') {
    box.innerHTML = `<button class="btn accent" data-action="new-tx">${icon('plus', 16)}<span>Giao dịch</span></button>`;
  } else if (page === 'settings') {
    box.innerHTML = '';
  } else {
    box.innerHTML = `<button class="btn accent" data-action="new-tx">${icon('plus', 16)}<span>Cho vay</span></button>`;
  }
}

/* ============================================================
   VIEW: DASHBOARD
   ============================================================ */
function renderDashboard() {
  const g = globalStats();

  const recent = [...db.transactions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 6);

  const topDebtors = [...db.contacts]
    .map(c => ({ c, s: stats(c.id) }))
    .filter(x => x.s.balance > 0)
    .sort((a, b) => b.s.balance - a.s.balance)
    .slice(0, 3);

  const html = `
    <section class="hero">
      <div class="hero-eyebrow">${icon('wallet', 14)} Tổng dư nợ cần thu</div>
      <div class="hero-net">${money(g.totalOutstanding)}</div>
      <div class="hero-split">
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('wallet', 13)} Gốc còn lại</span>
          <span class="hero-split-value text">${money(g.totalPrincipal)}</span>
        </div>
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('percent', 13)} Lãi tích lũy</span>
          <span class="hero-split-value amber">${money(g.totalInterestOutstanding)}</span>
        </div>
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('check', 13)} Đã thu</span>
          <span class="hero-split-value pos">${money(g.totalCollected)}</span>
        </div>
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
        <button class="btn accent" data-action="new-tx">${icon('plus', 16)} Cho vay</button>
      </div>
    </section>`}

    ${topDebtors.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Người vay nhiều nhất</h2>
        <a href="#/contacts" class="section-link">Tất cả ${icon('chevronRight', 14)}</a>
      </div>
      <div class="grid">
        ${topDebtors.map(({ c, s }) => contactCardHTML(c, s)).join('')}
      </div>
    </section>` : ''}
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

/* ============================================================
   VIEW: CONTACTS
   ============================================================ */
function renderContacts() {
  const q = (window.__search || '').trim().toLowerCase();
  let list = db.contacts.slice();

  if (q) list = list.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q) ||
    (c.note || '').toLowerCase().includes(q)
  );

  list.sort((a, b) => {
    const ba = stats(a.id).balance;
    const bb = stats(b.id).balance;
    if (bb !== ba) return bb - ba;
    return (a.name || '').localeCompare(b.name || '', 'vi');
  });

  const html = `
    <div class="toolbar">
      <div class="search-wrap">
        ${icon('search', 18)}
        <input type="search" class="search-input" id="contactSearch" placeholder="Tìm theo tên, SĐT, ghi chú…" value="${escapeHtml(window.__search || '')}" autocomplete="off">
      </div>
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
        ${list.map(c => contactCardHTML(c, stats(c.id))).join('')}
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
      if (newInp) {
        newInp.focus();
        try { newInp.setSelectionRange(pos, pos); } catch (_) {}
      }
    });
  }
  bindViewEvents();
}

function contactCardHTML(c, s) {
  const bal = s.balance;
  const cls = bal > 0 ? '' : 'zero';
  const label = bal > 0 ? 'Còn nợ' : 'Sạch nợ';
  const sub = [c.phone, c.note].filter(Boolean).map(escapeHtml).join(' · ')
    || (s.lendCount ? `${s.lendCount} khoản vay` : 'Không có ghi chú');

  return `
    <article class="contact-card" data-contact-id="${c.id}">
      <div class="contact-avatar" style="background:${avatarColor(c.name)}">${escapeHtml(initials(c.name))}</div>
      <div class="contact-body">
        <div class="contact-name">${escapeHtml(c.name)}</div>
        <div class="contact-sub">${sub}</div>
      </div>
      <div class="contact-balance">
        <span class="contact-balance-amount ${cls}">${bal > 0 ? money(bal) : '0 ₫'}</span>
        <span class="contact-balance-label">${label}</span>
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

  const s = stats(id);
  const sub = [c.phone, c.email, c.note].filter(Boolean).map(escapeHtml).join(' · ')
    || 'Không có thông tin thêm';

  const allTxns = db.transactions
    .filter(t => t.contactId === id)
    .sort((x, y) => (y.date || '').localeCompare(x.date || '') || (y.createdAt || 0) - (x.createdAt || 0));

  const loans = s.lends.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

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
      <div class="detail-balance-amount ${s.balance <= 0 ? 'zero' : ''}">${money(Math.max(0, s.balance))}</div>
      <div class="detail-sub-nums">
        <div>
          <div class="detail-sub-num-label">Gốc còn lại</div>
          <div class="detail-sub-num-value">${money(Math.max(0, s.outstandingPrincipal))}</div>
        </div>
        <div>
          <div class="detail-sub-num-label">Lãi tích lũy chưa thu</div>
          <div class="detail-sub-num-value" style="color:var(--amber)">${money(Math.max(0, s.outstandingInterest))}</div>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="btn accent" data-action="new-tx" data-contact="${id}">${icon('plus', 16)} Cho vay</button>
      <button class="btn ghost" data-action="collect-interest" data-contact="${id}">${icon('percent', 16)} Thu lãi</button>
      <button class="btn ghost" data-action="collect-principal" data-contact="${id}">${icon('arrowDownLeft', 16)} Thu gốc</button>
      <button class="btn soft-danger" data-action="delete-contact" data-id="${id}">${icon('trash', 16)} Xoá</button>
    </div>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Các khoản cho vay (${loans.length})</h2>
      </div>
      ${loans.length ? loans.map(lendCardHTML).join('') : `
        <div class="empty" style="padding:36px 20px">
          <div class="empty-icon">${icon('inbox', 24)}</div>
          <p class="empty-text" style="margin:0">Chưa có khoản cho vay nào.</p>
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

function lendCardHTML(lend) {
  const interest = lendInterest(lend);
  const total = lend.amount + interest;
  const days = daysBetween(lend.date, todayISO());

  const dueLine = lend.dueDate
    ? `<span>·</span><span>Hạn trả ${formatDate(lend.dueDate)}</span>`
    : '';

  return `
    <article class="loan-card">
      <div class="loan-head">
        <div style="min-width:0">
          <div class="loan-amount">${money(lend.amount)}</div>
          <div class="loan-meta">
            <span class="loan-rate-badge">${icon('percent', 11)} ${lend.rate}%/tháng</span>
            <span>·</span>
            <span>${formatDate(lend.date)}</span>
            <span>·</span>
            <span>${days} ngày</span>
            ${dueLine}
          </div>
        </div>
        <div class="loan-actions">
          <button class="icon-btn sm" data-tx-edit="${lend.id}" title="Sửa">${icon('edit', 15)}</button>
          <button class="icon-btn sm danger" data-tx-del="${lend.id}" title="Xoá">${icon('trash', 15)}</button>
        </div>
      </div>

      ${lend.note ? `<p style="font-size:13px;color:var(--text-2);margin-bottom:12px;line-height:1.5;word-break:break-word">${escapeHtml(lend.note)}</p>` : ''}

      <div class="loan-nums">
        <div>
          <div class="loan-num-label">Lãi tích lũy</div>
          <div class="loan-num-value amber">${money(interest)}</div>
        </div>
        <div>
          <div class="loan-num-label">Tổng phải thu</div>
          <div class="loan-num-value accent">${money(total)}</div>
        </div>
      </div>
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
        ${!db.transactions.length ? `<button class="btn accent" data-action="new-tx">${icon('plus', 16)} Cho vay</button>` : ''}
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
   TX ROW (shared)
   ============================================================ */
function txRowHTML(t) {
  const c = db.contacts.find(x => x.id === t.contactId);
  const T = TYPES[t.type] || TYPES.lend;
  const name = c ? c.name : 'Không rõ';

  const meta = t.type === 'lend'
    ? `${T.label} · ${t.rate}%/tháng · ${formatDate(t.date)}`
    : `${T.label} · ${formatDate(t.date)}`;

  const amountSign = t.type === 'lend' ? '−' : '+';
  const amountCls = t.type === 'lend' ? 'neg' : 'pos';

  const iconHTML = `<div class="tx-icon ${T.tone}">${icon(T.icon, 18)}</div>`;

  return `
    <div class="tx-row" data-tx-id="${t.id}">
      ${iconHTML}
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
      <h3 class="settings-group-title">Về ứng dụng</h3>
      <div class="card" style="padding:18px">
        <div style="font-family:'Lora',serif;font-style:italic;font-size:22px;font-weight:500;margin-bottom:10px">Debtor</div>
        <p style="font-size:13px;color:var(--text-2);line-height:1.6;margin:0">
          Lãi được tính theo công thức <b>gốc × lãi suất/tháng × số ngày / 30</b>.<br>
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

  switch (action) {
    case 'new-tx':           openTxForm({ contactId, type: 'lend' }); break;
    case 'collect-interest': openTxForm({ contactId, type: 'interest' }); break;
    case 'collect-principal':openTxForm({ contactId, type: 'principal' }); break;
    case 'edit-contact':     openContactForm(id); break;
    case 'delete-contact':   confirmDeleteContact(id); break;
    case 'new-contact':      openContactForm(); break;
    case 'theme-toggle':     toggleTheme(); break;
    case 'back':             history.back(); break;
    case 'export-json':      exportJSON(); break;
    case 'export-csv':       exportCSV(); break;
    case 'clear-all':        confirmClearAll(); break;
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
      const first = root.querySelector('input:not([type=hidden]), select, textarea');
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

  const html = `
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
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
        <button type="submit" class="btn accent">${c ? 'Lưu thay đổi' : 'Thêm'}</button>
      </div>
    </form>
  `;

  openModal(html);

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

    save();
    closeModal();
    buildNav();
    navigate();
  });
}

/* ============================================================
   MODAL: TRANSACTION FORM
   ============================================================ */
function openTxForm({ id = null, contactId = null, type = null } = {}) {
  if (!db.contacts.length) {
    toast('Thêm người vay trước đã nhé', 'error');
    openContactForm();
    return;
  }

  const t = id ? db.transactions.find(x => x.id === id) : null;

  const initialType = t ? t.type : (type || 'lend');
  const selectedContact = t ? t.contactId : (contactId || db.contacts[0].id);
  const date = t ? t.date : todayISO();
  const amount = t ? t.amount : '';
  const rate = t ? t.rate : 10;
  const dueDate = t ? (t.dueDate || '') : '';
  const note = t ? (t.note || '') : '';

  const title = t ? 'Sửa giao dịch' : 'Giao dịch mới';

  const typeButtons = Object.entries(TYPES).map(([k, v]) => `
    <button type="button" class="type-btn${k === initialType ? ' active' : ''}" data-type="${k}">
      <span class="type-btn-icon">${icon(v.icon, 17)}</span>
      <span>${v.label}</span>
    </button>
  `).join('');

  const contactOptions = db.contacts.map(c =>
    `<option value="${c.id}"${c.id === selectedContact ? ' selected' : ''}>${escapeHtml(c.name)}</option>`
  ).join('');

  const html = `
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <form id="txForm">
      <div class="modal-body">
        <div class="type-grid" id="typeGrid">${typeButtons}</div>

        <div class="field">
          <label class="field-label" for="txContact">Người vay <span class="req">*</span></label>
          <select class="select-field" id="txContact" required>${contactOptions}</select>
        </div>

        <div class="field">
          <label class="field-label" for="txAmount">Số tiền (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="txAmount" inputmode="numeric" placeholder="0" value="${amount ? nf.format(amount) : ''}" required autocomplete="off">
        </div>

        <div class="field" id="rateField" ${initialType !== 'lend' ? 'hidden' : ''}>
          <label class="field-label" for="txRate">Lãi suất (%/tháng) <span class="req">*</span></label>
          <input type="number" class="input" id="txRate" min="0" step="0.1" placeholder="VD: 10" value="${rate ?? ''}" autocomplete="off">
        </div>

        <div id="interestPreview" class="interest-preview" hidden>
          <span>Lãi sau <b id="previewDays">0</b> ngày:</span>
          <strong id="previewAmount">0 ₫</strong>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="txDate">Ngày</label>
            <input type="date" class="input" id="txDate" value="${date}">
          </div>
          <div class="field" id="dueField" ${initialType !== 'lend' ? 'hidden' : ''}>
            <label class="field-label" for="txDue">Hạn trả <span class="opt">(tuỳ chọn)</span></label>
            <input type="date" class="input" id="txDue" value="${dueDate}">
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="txNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <input type="text" class="input" id="txNote" maxlength="120" placeholder="VD: vay mua điện thoại" value="${escapeHtml(note)}" autocomplete="off">
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">${t ? 'Lưu thay đổi' : 'Thêm'}</button>
      </div>
    </form>
  `;

  openModal(html);

  let currentType = initialType;

  function updateTypeUI() {
    $$('#typeGrid [data-type]').forEach(b => b.classList.toggle('active', b.dataset.type === currentType));
    $('#rateField').hidden = currentType !== 'lend';
    $('#dueField').hidden = currentType !== 'lend';
    updatePreview();
  }

  function updatePreview() {
    const preview = $('#interestPreview');
    if (currentType !== 'lend') {
      preview.hidden = true;
      return;
    }
    const amt = Number($('#txAmount').value.replace(/\D/g, '')) || 0;
    const r = Number($('#txRate').value) || 0;
    const d = $('#txDate').value || todayISO();
    if (amt > 0 && r > 0 && d) {
      const days = daysBetween(d, todayISO());
      const interest = amt * (r / 100) * (days / DAYS_PER_MONTH);
      $('#previewDays').textContent = days;
      $('#previewAmount').textContent = money(interest);
      preview.hidden = false;
    } else {
      preview.hidden = true;
    }
  }

  $$('#typeGrid [data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentType = btn.dataset.type;
      updateTypeUI();
    });
  });

  const amt = $('#txAmount');
  amt.addEventListener('input', () => {
    const digits = amt.value.replace(/\D/g, '');
    amt.value = digits ? nf.format(Number(digits)) : '';
    updatePreview();
  });

  $('#txRate').addEventListener('input', updatePreview);
  $('#txDate').addEventListener('change', updatePreview);

  updateTypeUI();

  $('#txForm').addEventListener('submit', e => {
    e.preventDefault();

    const contactIdVal = $('#txContact').value;
    const amountVal = Number(amt.value.replace(/\D/g, ''));
    const dateVal = $('#txDate').value || todayISO();
    const noteVal = $('#txNote').value.trim();

    if (!contactIdVal) return toast('Chọn người vay', 'error');
    if (!amountVal || amountVal <= 0) return toast('Nhập số tiền hợp lệ', 'error');

    const data = {
      contactId: contactIdVal,
      type: currentType,
      amount: amountVal,
      date: dateVal,
      note: noteVal,
    };

    if (currentType === 'lend') {
      const rateVal = Number($('#txRate').value);
      if (!Number.isFinite(rateVal) || rateVal < 0) return toast('Lãi suất không hợp lệ', 'error');
      data.rate = rateVal;
      data.dueDate = $('#txDue').value || '';
    }

    if (t) {
      Object.assign(t, data);
      // clear rate if changing away from lend
      if (currentType !== 'lend') { delete t.rate; delete t.dueDate; }
      toast('Đã cập nhật', 'success');
    } else {
      db.transactions.push({ id: uid(), ...data, createdAt: Date.now() });
      toast('Đã thêm giao dịch', 'success');
    }

    save();
    closeModal();
    navigate();
  });
}

/* ============================================================
   DELETE / CONFIRM
   ============================================================ */
function openConfirm({ title, message, confirmText = 'Xoá', onConfirm, danger = true }) {
  const html = `
    <div class="modal-head">
      <h2 class="modal-title">${escapeHtml(title)}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <div class="modal-body">
      <p style="margin:0;font-size:14.5px;line-height:1.6;color:var(--text-2)">${message}</p>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn ghost" data-close>Huỷ</button>
      <button type="button" class="btn ${danger ? 'danger' : 'accent'}" id="confirmOk">${escapeHtml(confirmText)}</button>
    </div>
  `;
  openModal(html);
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
  openConfirm({
    title: 'Xoá giao dịch?',
    message: 'Giao dịch này sẽ bị xoá vĩnh viễn.',
    confirmText: 'Xoá',
    onConfirm: () => {
      db.transactions = db.transactions.filter(t => t.id !== id);
      save(); navigate();
      toast('Đã xoá giao dịch', 'success');
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
  const header = ['Người vay', 'Loại', 'Số tiền', 'Lãi suất (%/tháng)', 'Ngày', 'Hạn trả', 'Ghi chú'];
  const rows = db.transactions.map(t => {
    const c = db.contacts.find(x => x.id === t.contactId);
    return [
      c?.name || '',
      TYPES[t.type]?.label || t.type,
      t.amount,
      t.type === 'lend' ? (t.rate || '') : '',
      t.date,
      t.dueDate || '',
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
  if (e.key === 'Escape') {
    if ($('#modalRoot').innerHTML) closeModal();
  }
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    openTxForm({ type: 'lend' });
  }
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

  $('#fab').addEventListener('click', () => openTxForm({ type: 'lend' }));

  window.addEventListener('hashchange', navigate);
  if (!location.hash) location.hash = '#/dashboard';
  navigate();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
