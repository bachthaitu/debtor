/* =========================================================
   Debtor — app.js
   ========================================================= */
'use strict';

/* ============ CONSTANTS ============ */
const DB_KEY = 'debtor-db-v1';
const THEME_KEY = 'debtor-theme-v1';

const TYPES = {
  lend:    { label: 'Cho vay',  icon: 'arrowUpRight',   tone: 'lend',    sign: +1, dir: 'out' },
  collect: { label: 'Thu nợ',   icon: 'arrowDownLeft',  tone: 'collect', sign: -1, dir: 'in'  },
  borrow:  { label: 'Đi vay',   icon: 'arrowDownLeft',  tone: 'borrow',  sign: -1, dir: 'in'  },
  repay:   { label: 'Trả nợ',   icon: 'arrowUpRight',   tone: 'repay',   sign: +1, dir: 'out' },
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'home' },
  { id: 'contacts',  label: 'Người',     icon: 'users' },
  { id: 'activity',  label: 'Hoạt động', icon: 'activity' },
  { id: 'settings',  label: 'Cài đặt',   icon: 'settings' },
];

const PAGE_TITLES = {
  dashboard: 'Tổng quan',
  contacts:  'Danh bạ',
  activity:  'Hoạt động',
  settings:  'Cài đặt',
};

/* ============ STATE ============ */
let db = { contacts: [], transactions: [] };
let currentRoute = { page: 'dashboard', id: null };
let toastTimer = null;

/* ============ ICONS (Lucide, stroke-based) ============ */
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
  trendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  trendingDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 10.5l-5.1 1.7L13 18l-1.9-5.8L6 10.5l5.1-1.7z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
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
const moneySigned = n => (n > 0 ? '+' : '') + money(n);

const escapeHtml = s => {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const initials = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length === 1
    ? parts[0][0]
    : parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
  return Math.abs(h);
}

function avatarColor(name) {
  const hue = hashStr(name) % 360;
  return `linear-gradient(135deg, hsl(${hue} 55% 58%), hsl(${(hue + 30) % 360} 60% 48%))`;
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
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(iso + 'T00:00:00');
  const days = Math.round((t - d) / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return formatDate(iso);
};

/* ============ STORAGE ============ */
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    db.contacts = Array.isArray(data.contacts) ? data.contacts : [];
    db.transactions = Array.isArray(data.transactions) ? data.transactions : [];
  } catch (err) {
    console.error('Load failed', err);
  }
}

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    toast('Không lưu được dữ liệu', 'error');
  }
}

/* ============ THEME ============ */
function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
}

function applyTheme(theme) {
  if (theme === 'system' || !theme) {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    document.documentElement.dataset.theme = theme;
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}

  // Update theme toggle label & icon
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

/* ============ BALANCE ============ */
function balanceOf(contactId) {
  return db.transactions.reduce(
    (sum, t) => t.contactId === contactId ? sum + TYPES[t.type].sign * t.amount : sum,
    0
  );
}

function totals() {
  let recv = 0, pay = 0;
  db.contacts.forEach(c => {
    const b = balanceOf(c.id);
    if (b > 0) recv += b;
    else pay += -b;
  });
  return { recv, pay, net: recv - pay };
}

/* ============ AVATAR HTML ============ */
function avatarHTML(name, size = 44, extra = '') {
  const style = `background:${avatarColor(name)};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.36)}px`;
  return `<div class="tx-avatar" style="${style};${extra}">${escapeHtml(initials(name))}</div>`;
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
  $$('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === page);
  });
}

/* ============ ROUTER ============ */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { page: parts[0] || 'dashboard', id: parts[1] || null };
}

function navigate() {
  currentRoute = parseHash();
  const { page, id } = currentRoute;

  // Page title
  let title = PAGE_TITLES[page] || 'Debtor';
  if (page === 'contacts' && id) {
    const c = db.contacts.find(x => x.id === id);
    if (c) title = c.name;
  }
  $('#pageTitle').textContent = title;

  // Back button (mobile) — show on contact detail
  const backBtn = $('#backBtn');
  if (page === 'contacts' && id) {
    backBtn.hidden = false;
    backBtn.innerHTML = icon('chevronLeft', 20);
  } else {
    backBtn.hidden = true;
  }

  setActiveNav(page);

  // Render view
  if (page === 'dashboard') renderDashboard();
  else if (page === 'contacts') id ? renderContactDetail(id) : renderContacts();
  else if (page === 'activity') renderActivity();
  else if (page === 'settings') renderSettings();
  else renderDashboard();

  // Update topbar actions per page
  renderTopbarActions(page, id);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderTopbarActions(page, id) {
  const box = $('#topbarActions');
  if (page === 'contacts' && id) {
    box.innerHTML = `
      <button class="icon-btn" data-action="edit-contact" data-id="${id}" title="Sửa">${icon('edit', 18)}</button>
      <button class="btn primary" data-action="new-tx" data-contact="${id}">
        ${icon('plus', 16)}<span>Giao dịch</span>
      </button>
    `;
  } else if (page === 'contacts') {
    box.innerHTML = `
      <button class="btn primary" data-action="new-contact">
        ${icon('plus', 16)}<span>Người</span>
      </button>
    `;
  } else if (page === 'activity') {
    box.innerHTML = `
      <button class="btn primary" data-action="new-tx">
        ${icon('plus', 16)}<span>Giao dịch</span>
      </button>
    `;
  } else if (page === 'settings') {
    box.innerHTML = '';
  } else {
    box.innerHTML = `
      <button class="btn primary" data-action="new-tx">
        ${icon('plus', 16)}<span>Giao dịch</span>
      </button>
    `;
  }
}

/* ============================================================
   VIEW: DASHBOARD
   ============================================================ */
function renderDashboard() {
  const { recv, pay, net } = totals();
  const netClass = net > 0 ? 'pos' : net < 0 ? 'neg' : '';

  // Recent transactions
  const recent = [...db.transactions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  // Top contacts by |balance|
  const topContacts = [...db.contacts]
    .map(c => ({ c, b: balanceOf(c.id) }))
    .filter(x => x.b !== 0)
    .sort((a, b) => Math.abs(b.b) - Math.abs(a.b))
    .slice(0, 3);

  const html = `
    <section class="hero">
      <div class="hero-eyebrow">${icon('wallet', 14)} Số dư ròng</div>
      <div class="hero-net ${netClass}">${net === 0 ? '0 ₫' : moneySigned(net)}</div>
      <div class="hero-split">
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('trendingUp', 13)} Họ nợ tôi</span>
          <span class="hero-split-value pos">${money(recv)}</span>
        </div>
        <div class="hero-split-item">
          <span class="hero-split-label">${icon('trendingDown', 13)} Tôi nợ họ</span>
          <span class="hero-split-value neg">${money(pay)}</span>
        </div>
      </div>
    </section>

    ${recent.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Giao dịch gần đây</h2>
        <a href="#/activity" class="section-link">Xem tất cả ${icon('chevronRight', 14)}</a>
      </div>
      <div class="card tx-list">
        ${recent.map(txRowHTML).join('')}
      </div>
    </section>` : `
    <section class="section">
      <div class="empty">
        <div class="empty-icon">${icon('inbox', 28)}</div>
        <h3 class="empty-title">Chưa có giao dịch nào</h3>
        <p class="empty-text">Ghi lại khoản cho vay hoặc đi vay đầu tiên để bắt đầu theo dõi.</p>
        <button class="btn primary" data-action="new-tx">${icon('plus', 16)} Thêm giao dịch</button>
      </div>
    </section>`}

    ${topContacts.length ? `
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Người có số dư lớn nhất</h2>
        <a href="#/contacts" class="section-link">Tất cả ${icon('chevronRight', 14)}</a>
      </div>
      <div class="grid">
        ${topContacts.map(({ c, b }) => contactCardHTML(c, b)).join('')}
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

  // Sort by |balance| desc, then by name
  list.sort((a, b) => {
    const ba = Math.abs(balanceOf(a.id));
    const bb = Math.abs(balanceOf(b.id));
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
        <h3 class="empty-title">Chưa có ai trong danh bạ</h3>
        <p class="empty-text">Thêm người đầu tiên để bắt đầu ghi lại các khoản nợ.</p>
        <button class="btn primary" data-action="new-contact">${icon('plus', 16)} Thêm người</button>
      </div>
    ` : !list.length ? `
      <div class="empty">
        <div class="empty-icon">${icon('search', 28)}</div>
        <h3 class="empty-title">Không tìm thấy ai</h3>
        <p class="empty-text">Thử từ khoá khác xem sao.</p>
      </div>
    ` : `
      <div class="grid">
        ${list.map(c => contactCardHTML(c, balanceOf(c.id))).join('')}
      </div>
    `}
  `;

  $('#view').innerHTML = html;

  // Bind search
  const inp = $('#contactSearch');
  if (inp) {
    inp.addEventListener('input', e => {
      window.__search = e.target.value;
      // Preserve focus & caret
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

function contactCardHTML(c, b) {
  const cls = b > 0 ? 'pos' : b < 0 ? 'neg' : 'zero';
  const label = b > 0 ? 'Họ nợ bạn' : b < 0 ? 'Bạn nợ họ' : 'Sạch nợ';
  const sub = [c.phone, c.note].filter(Boolean).map(escapeHtml).join(' · ') || 'Không có ghi chú';
  return `
    <article class="contact-card" data-contact-id="${c.id}">
      ${avatarHTML(c.name, 44)}
      <div class="contact-body">
        <div class="contact-name">${escapeHtml(c.name)}</div>
        <div class="contact-sub">${sub}</div>
      </div>
      <div class="contact-balance">
        <span class="contact-balance-amount ${cls}">${b === 0 ? '0 ₫' : moneySigned(b)}</span>
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
  if (!c) {
    location.hash = '#/contacts';
    return;
  }

  const b = balanceOf(id);
  const cls = b > 0 ? 'pos' : b < 0 ? 'neg' : 'zero';
  const label = b > 0 ? 'Họ nợ bạn' : b < 0 ? 'Bạn nợ họ' : 'Sạch nợ';

  const txs = db.transactions
    .filter(t => t.contactId === id)
    .sort((x, y) => (y.date || '').localeCompare(x.date || '') || (y.createdAt || 0) - (x.createdAt || 0));

  const sub = [c.phone, c.email, c.note].filter(Boolean).map(escapeHtml).join(' · ') || 'Không có thông tin thêm';

  const html = `
    <div class="detail-head">
      ${avatarHTML(c.name, 64, 'border-radius:20px;font-size:22px;')}
      <div class="detail-info">
        <h2 class="detail-name">${escapeHtml(c.name)}</h2>
        <p class="detail-sub">${sub}</p>
      </div>
    </div>

    <div class="detail-balance">
      <div class="detail-balance-label">${label}</div>
      <div class="detail-balance-amount ${cls}">${b === 0 ? '0 ₫' : moneySigned(b)}</div>
    </div>

    <div class="detail-actions">
      <button class="btn primary" data-action="new-tx" data-contact="${id}">
        ${icon('plus', 16)} Thêm giao dịch
      </button>
      <button class="btn ghost" data-action="edit-contact" data-id="${id}">
        ${icon('edit', 16)} Sửa
      </button>
      <button class="btn soft-danger" data-action="delete-contact" data-id="${id}">
        ${icon('trash', 16)} Xoá
      </button>
    </div>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Lịch sử (${txs.length})</h2>
      </div>
      ${txs.length ? `
        <div class="card tx-list">
          ${txs.map(txRowHTML).join('')}
        </div>
      ` : `
        <div class="empty" style="padding:36px 20px">
          <div class="empty-icon">${icon('inbox', 24)}</div>
          <p class="empty-text" style="margin:0">Chưa có giao dịch nào với người này.</p>
        </div>
      `}
    </section>
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
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
      return (c?.name || '').toLowerCase().includes(q) ||
             (t.note || '').toLowerCase().includes(q);
    });
  }

  list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));

  // Group by date
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
        <option value="collect"${filter === 'collect' ? ' selected' : ''}>Thu nợ</option>
        <option value="borrow"${filter === 'borrow' ? ' selected' : ''}>Đi vay</option>
        <option value="repay"${filter === 'repay' ? ' selected' : ''}>Trả nợ</option>
      </select>
    </div>

    ${!list.length ? `
      <div class="empty">
        <div class="empty-icon">${icon('activity', 28)}</div>
        <h3 class="empty-title">Không có giao dịch</h3>
        <p class="empty-text">${db.transactions.length ? 'Thử đổi bộ lọc hoặc từ khoá.' : 'Ghi lại giao dịch đầu tiên để bắt đầu.'}</p>
        ${!db.transactions.length ? `<button class="btn primary" data-action="new-tx">${icon('plus', 16)} Thêm giao dịch</button>` : ''}
      </div>
    ` : [...groups.entries()].map(([date, items]) => `
      <section class="section" style="margin-bottom:22px">
        <div class="section-head">
          <h2 class="section-title">${relativeDate(date)}</h2>
          <span style="font-size:12.5px;color:var(--text-3)">${items.length} giao dịch</span>
        </div>
        <div class="card tx-list">
          ${items.map(txRowHTML).join('')}
        </div>
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
      if (newInp) {
        newInp.focus();
        try { newInp.setSelectionRange(pos, pos); } catch (_) {}
      }
    });
  }
  const sel = $('#activityFilter');
  if (sel) {
    sel.addEventListener('change', e => {
      window.__filter = e.target.value;
      renderActivity();
    });
  }

  bindViewEvents();
}

/* ============================================================
   TX ROW (shared)
   ============================================================ */
function txRowHTML(t) {
  const c = db.contacts.find(x => x.id === t.contactId);
  const T = TYPES[t.type] || TYPES.lend;
  const name = c ? c.name : 'Không rõ';
  const noteTxt = t.note ? escapeHtml(t.note) : T.label;

  return `
    <div class="tx-row" data-tx-id="${t.id}">
      ${avatarHTML(name, 40, `position:relative;`).replace(
        '</div>',
        `<span class="tx-avatar-badge ${T.tone}">${icon(T.icon, 11)}</span></div>`
      )}
      <div class="tx-body">
        <div class="tx-name">${escapeHtml(name)}</div>
        <div class="tx-meta">${T.label}${t.note ? ' · ' + escapeHtml(t.note) : ''} · ${formatDate(t.date)}</div>
      </div>
      <div class="tx-amount ${T.dir === 'in' ? 'pos' : 'neg'}">${T.dir === 'in' ? '+' : '−'}${money(t.amount)}</div>
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
          <div class="settings-item-desc">Tải toàn bộ danh bạ và giao dịch về máy</div>
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
          <div class="settings-item-desc">Xuất danh sách giao dịch ra Excel / Google Sheets</div>
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
          <div class="settings-item-desc">Xoá hết danh bạ và giao dịch (không thể hoàn tác)</div>
        </div>
      </button>
    </div>

    <div class="settings-group">
      <h3 class="settings-group-title">Về ứng dụng</h3>
      <div class="card" style="padding:18px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <span class="brand-mark" style="width:36px;height:36px;font-size:20px">D</span>
          <div>
            <div style="font-weight:700;font-size:15px">Debtor</div>
            <div style="font-size:12.5px;color:var(--text-2)">v1.0 · Chạy hoàn toàn trên trình duyệt</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-2);line-height:1.6;margin:0">
          Dữ liệu được lưu trong <b>localStorage</b> của trình duyệt bạn đang dùng.
          Hãy sao lưu định kỳ để tránh mất dữ liệu khi xoá cache hoặc đổi thiết bị.
        </p>
      </div>
    </div>
  `;

  $('#view').innerHTML = html;
  bindViewEvents();
}

/* ============================================================
   EVENT BINDING (view-level)
   ============================================================ */
function bindViewEvents() {
  const view = $('#view');

  // Contact card click
  $$('[data-contact-id]', view).forEach(el => {
    el.addEventListener('click', () => {
      location.hash = `#/contacts/${el.dataset.contactId}`;
    });
  });

  // Tx row click (edit)
  $$('[data-tx-id]', view).forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('[data-tx-edit]') || e.target.closest('[data-tx-del]')) return;
      openTxForm({ id: row.dataset.txId });
    });
  });

  // Tx edit buttons
  $$('[data-tx-edit]', view).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openTxForm({ id: btn.dataset.txEdit });
    });
  });

  // Tx delete buttons
  $$('[data-tx-del]', view).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      confirmDeleteTx(btn.dataset.txDel);
    });
  });

  // Theme segment
  $$('#themeSeg [data-theme-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeVal);
      renderSettings();
    });
  });

  // Import file
  const imp = $('#importFile');
  if (imp) imp.addEventListener('change', handleImportFile);

  // Global actions inside view
  $$('[data-action]', view).forEach(el => {
    el.addEventListener('click', handleAction);
  });
}

/* ============================================================
   ACTION HANDLER
   ============================================================ */
function handleAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;
  const id = el.dataset.id;
  const contactId = el.dataset.contact;

  switch (action) {
    case 'new-tx':      openTxForm({ contactId }); break;
    case 'edit-contact':openContactForm(id); break;
    case 'delete-contact': confirmDeleteContact(id); break;
    case 'new-contact': openContactForm(); break;
    case 'theme-toggle': toggleTheme(); break;
    case 'back':        history.back(); break;
    case 'export-json': exportJSON(); break;
    case 'export-csv':  exportCSV(); break;
    case 'clear-all':   confirmClearAll(); break;
  }
}

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
function openModal(html, opts = {}) {
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

  // Bind close buttons
  $$('[data-close]', root).forEach(el => el.addEventListener('click', closeModal));

  // Autofocus first input (desktop only)
  if (window.innerWidth > 640) {
    setTimeout(() => {
      const first = root.querySelector('input:not([type=hidden]), select, textarea');
      if (first) first.focus();
    }, 80);
  }
}

function closeModal() {
  const root = $('#modalRoot');
  root.innerHTML = '';
  document.body.style.overflow = '';
}

/* ============================================================
   MODAL: CONTACT FORM
   ============================================================ */
function openContactForm(id = null) {
  const c = id ? db.contacts.find(x => x.id === id) : null;
  const title = c ? 'Sửa người' : 'Thêm người';

  const html = `
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button" aria-label="Đóng">${icon('x', 18)}</button>
    </div>
    <form id="contactForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="cName">Tên <span style="color:var(--red)">*</span></label>
          <input type="text" class="input" id="cName" maxlength="60" placeholder="VD: Nguyễn Văn A" value="${escapeHtml(c?.name || '')}" required autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cPhone">Số điện thoại <span class="opt">(tuỳ chọn)</span></label>
          <input type="tel" class="input" id="cPhone" maxlength="20" placeholder="VD: 0912 345 678" value="${escapeHtml(c?.phone || '')}" autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cEmail">Email <span class="opt">(tuỳ chọn)</span></label>
          <input type="email" class="input" id="cEmail" maxlength="80" placeholder="VD: a@example.com" value="${escapeHtml(c?.email || '')}" autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <textarea class="textarea" id="cNote" maxlength="200" placeholder="VD: Bạn học cấp 3, hay vay tiền mặt…">${escapeHtml(c?.note || '')}</textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn primary">${c ? 'Lưu thay đổi' : 'Thêm'}</button>
      </div>
    </form>
  `;

  openModal(html);

  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName').value.trim();
    const phone = $('#cPhone').value.trim();
    const email = $('#cEmail').value.trim();
    const note = $('#cNote').value.trim();

    if (!name) {
      toast('Nhập tên đi bạn', 'error');
      return;
    }

    if (c) {
      Object.assign(c, { name, phone, email, note });
      toast('Đã cập nhật', 'success');
    } else {
      db.contacts.push({ id: uid(), name, phone, email, note, createdAt: Date.now() });
      toast('Đã thêm người', 'success');
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
function openTxForm({ id = null, contactId = null } = {}) {
  if (!db.contacts.length) {
    toast('Thêm người trước đã nhé', 'error');
    openContactForm();
    return;
  }

  const t = id ? db.transactions.find(x => x.id === id) : null;
  const type = t ? t.type : 'lend';
  const selectedContact = t ? t.contactId : (contactId || db.contacts[0].id);
  const date = t ? t.date : todayISO();
  const amount = t ? t.amount : '';
  const note = t ? (t.note || '') : '';

  const title = t ? 'Sửa giao dịch' : 'Giao dịch mới';

  const typeButtons = Object.entries(TYPES).map(([k, v]) => `
    <button type="button" class="type-btn${k === type ? ' active' : ''}" data-type="${k}">
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
          <label class="field-label" for="txContact">Người <span style="color:var(--red)">*</span></label>
          <select class="select-field" id="txContact" required>
            ${contactOptions}
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="txAmount">Số tiền (₫) <span style="color:var(--red)">*</span></label>
          <input type="text" class="input money" id="txAmount" inputmode="numeric" placeholder="0" value="${amount ? nf.format(amount) : ''}" required autocomplete="off">
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="txDate">Ngày</label>
            <input type="date" class="input" id="txDate" value="${date}">
          </div>
          <div class="field">
            <label class="field-label" for="txDue">Hạn trả <span class="opt">(tuỳ chọn)</span></label>
            <input type="date" class="input" id="txDue" value="${t?.dueDate || ''}">
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="txNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <input type="text" class="input" id="txNote" maxlength="120" placeholder="VD: vay mua điện thoại" value="${escapeHtml(note)}" autocomplete="off">
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn primary">${t ? 'Lưu thay đổi' : 'Thêm'}</button>
      </div>
    </form>
  `;

  openModal(html);

  // Type selector
  let currentType = type;
  $$('#typeGrid [data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentType = btn.dataset.type;
      $$('#typeGrid [data-type]').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // Money input formatting
  const amt = $('#txAmount');
  amt.addEventListener('input', () => {
    const digits = amt.value.replace(/\D/g, '');
    amt.value = digits ? nf.format(Number(digits)) : '';
  });

  // Submit
  $('#txForm').addEventListener('submit', e => {
    e.preventDefault();

    const contactIdVal = $('#txContact').value;
    const amountVal = Number(amt.value.replace(/\D/g, ''));
    const dateVal = $('#txDate').value || todayISO();
    const dueVal = $('#txDue').value || '';
    const noteVal = $('#txNote').value.trim();

    if (!contactIdVal) return toast('Chọn người', 'error');
    if (!amountVal || amountVal <= 0) return toast('Nhập số tiền hợp lệ', 'error');

    const data = {
      contactId: contactIdVal,
      type: currentType,
      amount: amountVal,
      date: dateVal,
      dueDate: dueVal,
      note: noteVal,
    };

    if (t) {
      Object.assign(t, data);
      toast('Đã cập nhật giao dịch', 'success');
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
   DELETE FLOWS
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
      <button type="button" class="btn ${danger ? 'danger' : 'primary'}" id="confirmOk">${escapeHtml(confirmText)}</button>
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
    title: 'Xoá người này?',
    message: `Bạn sắp xoá <b>${escapeHtml(c.name)}</b>${count ? ` và <b>${count} giao dịch</b> liên quan` : ''}. Hành động không thể hoàn tác.`,
    confirmText: 'Xoá',
    onConfirm: () => {
      db.contacts = db.contacts.filter(x => x.id !== id);
      db.transactions = db.transactions.filter(t => t.contactId !== id);
      save();
      buildNav();
      location.hash = '#/contacts';
      toast('Đã xoá', 'success');
    },
  });
}

function confirmDeleteTx(id) {
  openConfirm({
    title: 'Xoá giao dịch?',
    message: 'Giao dịch này sẽ bị xoá vĩnh viễn khỏi lịch sử.',
    confirmText: 'Xoá',
    onConfirm: () => {
      db.transactions = db.transactions.filter(t => t.id !== id);
      save();
      navigate();
      toast('Đã xoá giao dịch', 'success');
    },
  });
}

function confirmClearAll() {
  openConfirm({
    title: 'Xoá toàn bộ dữ liệu?',
    message: `Toàn bộ <b>${db.contacts.length} người</b> và <b>${db.transactions.length} giao dịch</b> sẽ bị xoá. Hành động không thể hoàn tác — nên sao lưu trước.`,
    confirmText: 'Xoá hết',
    onConfirm: () => {
      db = { contacts: [], transactions: [] };
      save();
      buildNav();
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
  const header = ['Người', 'Loại', 'Số tiền', 'Ngày', 'Hạn trả', 'Ghi chú'];
  const rows = db.transactions.map(t => {
    const c = db.contacts.find(x => x.id === t.contactId);
    return [
      c?.name || '',
      TYPES[t.type]?.label || t.type,
      t.amount,
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
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.contacts) || !Array.isArray(data.transactions)) {
      throw new Error('Sai định dạng');
    }

    openConfirm({
      title: 'Khôi phục dữ liệu?',
      message: `Bạn sắp thay thế toàn bộ dữ liệu hiện tại bằng <b>${data.contacts.length} người</b> và <b>${data.transactions.length} giao dịch</b> từ file.`,
      confirmText: 'Khôi phục',
      danger: false,
      onConfirm: () => {
        db = {
          contacts: data.contacts,
          transactions: data.transactions,
        };
        save();
        buildNav();
        navigate();
        toast('Đã khôi phục dữ liệu', 'success');
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
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('#modalRoot').innerHTML) {
      closeModal();
    }
  }

  // Don't trigger when typing
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    openTxForm({});
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
  // Theme first (avoid flash)
  applyTheme(getStoredTheme() || 'system');

  // System theme listener
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((getStoredTheme() || 'system') === 'system') applyTheme('system');
  });

  // Load data
  load();

  // Build sidebar + tabbar
  buildNav();

  // Inject static icons
  $$('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (name === 'theme') {
      const actual = document.documentElement.dataset.theme;
      el.innerHTML = icon(actual === 'dark' ? 'sun' : 'moon', 20);
    } else if (name === 'plus') {
      el.innerHTML = icon('plus', 22);
    }
  });

  // Global actions (topbar, sidebar, fab)
  document.body.addEventListener('click', e => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    // Skip if inside #view — handled separately to avoid double-binding
    if ($('#view')?.contains(actionEl)) return;
    handleAction({ currentTarget: actionEl });
  });

  // FAB
  $('#fab').addEventListener('click', () => openTxForm({}));

  // Router
  window.addEventListener('hashchange', navigate);
  if (!location.hash) location.hash = '#/dashboard';
  navigate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
