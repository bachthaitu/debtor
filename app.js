/* =========================================================
   Debtor — Quản lý cho vay (Đã fix logic lãi & chuẩn hóa modal)
   ========================================================= */
'use strict';

const DB_KEY = 'debtor-db-v4';
const THEME_KEY = 'debtor-theme-v4';
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
};

function icon(name, size = 20) {
  const paths = ICONS[name] || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/* ============ HELPERS ============ */
const $  = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const nf = new Intl.NumberFormat('vi-VN');
const money = n => nf.format(Math.round(Number(n) || 0)) + ' ₫';
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
  return `linear-gradient(135deg, hsl(${hue} 45% 62%), hsl(${(hue + 25) % 360} 55% 50%))`;
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isoFromDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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

function addMonths(iso, months) {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return isoFromDate(d);
}

/* ============ LOAN CALCULATIONS (FIXED ACCRUED INTEREST) ============ */

function lendProjectedInterest(lend) {
  return lend.amount * (lend.rate / 100) * lend.months;
}

function lendAccruedInterest(lend) {
  const daysElapsed = Math.max(0, daysBetween(lend.date, todayISO()));
  // Sửa lỗi: Lãi tích lũy KHÔNG BỊ GIỚI HẠN bởi số tháng vay (lend.months). Sẽ cộng dồn tiếp tục nếu quá hạn.
  const monthsElapsed = daysElapsed / DAYS_PER_MONTH; 
  return lend.amount * (lend.rate / 100) * monthsElapsed;
}

function lendDueDate(lend) {
  return addMonths(lend.date, lend.months);
}

function lendSummary(lend) {
  const payments = db.transactions.filter(t => t.lendId === lend.id && (t.type === 'interest' || t.type === 'principal'));
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
  if (paidPrincipal >= lend.amount - 100 && paidInterest >= accruedInterest - 100 && accruedInterest > 0) {
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
    paidInterest, paidPrincipal, projectedInterest, accruedInterest,
    outstandingPrincipal, outstandingInterest, totalOutstanding,
    dueDate, daysToDue, status, statusLabel, progress,
  };
}

/* Các hàm phụ trợ Stats */
function contactStats(contactId) {
  const lends = db.transactions.filter(t => t.contactId === contactId && t.type === 'lend');
  const summaries = lends.map(lendSummary);

  let [totalOutstanding, totalPrincipalOut, totalInterestOut, totalPaid, overdueCount, dueSoonCount, activeCount] = [0,0,0,0,0,0,0];

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

  return { lends: summaries, lendCount: lends.length, totalOutstanding, totalPrincipalOut, totalInterestOut, totalPaid, overdueCount, dueSoonCount, activeCount };
}

function globalStats() {
  let [totalOutstanding, totalPrincipalOut, totalInterestOut, totalPaid, overdueCount, dueSoonCount] = [0,0,0,0,0,0];
  db.contacts.forEach(c => {
    const s = contactStats(c.id);
    totalOutstanding += s.totalOutstanding; totalPrincipalOut += s.totalPrincipalOut;
    totalInterestOut += s.totalInterestOut; totalPaid += s.totalPaid;
    overdueCount += s.overdueCount; dueSoonCount += s.dueSoonCount;
  });
  return { totalOutstanding, totalPrincipalOut, totalInterestOut, totalPaid, overdueCount, dueSoonCount };
}

function attentionLends() {
  const list = [];
  db.contacts.forEach(c => {
    db.transactions.filter(t => t.contactId === c.id && t.type === 'lend').forEach(l => {
      const s = lendSummary(l);
      if (s.status === 'overdue' || s.status === 'due-soon') list.push({ contact: c, summary: s });
    });
  });
  return list.sort((a, b) => a.summary.daysToDue - b.summary.daysToDue);
}

/* ============ STORAGE & THEME ============ */
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

function applyTheme(theme) {
  if (!theme || theme === 'system') {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    document.documentElement.dataset.theme = theme;
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}

  const actual = document.documentElement.dataset.theme;
  $$('[data-theme-label]').forEach(el => el.textContent = actual === 'dark' ? 'Giao diện tối' : 'Giao diện sáng');   $$
('[data-icon="theme"]').forEach(el => el.innerHTML = icon(actual === 'dark' ? 'sun' : 'moon', 22));
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme;
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ============ TOAST & MODAL (Cập nhật scroll) ============ */
function toast(msg, type = 'info') {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const iconName = type === 'error' ? 'x' : type === 'success' ? 'check' : 'sparkle';
  el.innerHTML = `${icon(iconName, 18)}<span>${escapeHtml(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 220);
  }, 2200);
}

function openModal(html) {
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true">
        ${html}
      </div>
    </div>
  `;
  document.body.style.overflow = 'hidden';

  $('#modalBackdrop').addEventListener('click', e => {     if (e.target.id === 'modalBackdrop') closeModal();   });   $$('[data-close]', root).forEach(el => el.addEventListener('click', closeModal));

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

/* ============ NAV ============ */
function buildNav() {
  const navHTML = NAV_ITEMS.map(item => `
    <a href="#/${item.id}" class="nav-item" data-nav="${item.id}">
      <span class="nav-icon">${icon(item.icon, 22)}</span>
      <span class="nav-label">${item.label}</span>
      ${item.id === 'contacts' && db.contacts.length ? `<span class="nav-badge">${db.contacts.length}</span>` : ''}
    </a>
  `).join('');
  $('#sidebarNav').innerHTML = navHTML;

  const tabHTML = NAV_ITEMS.map(item => `
    <a href="#/${item.id}" class="tab" data-nav="${item.id}">
      <span class="tab-icon">${icon(item.icon, 24)}</span>
      <span class="tab-label">${item.label}</span>
    </a>
  `).join('');
  $('#tabbar').innerHTML = tabHTML; }  function setActiveNav(page) { $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === page)); }

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
  if (page === 'contacts' && id) { backBtn.hidden = false; backBtn.innerHTML = icon('chevronLeft', 24); } 
  else { backBtn.hidden = true; }

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
    box.innerHTML = `<button class="btn accent" data-action="new-lend" data-contact="${id}">${icon('plus', 18)}<span>Cho vay</span></button>`;
  } else if (page === 'contacts') {
    box.innerHTML = `<button class="btn accent" data-action="new-contact">${icon('plus', 18)}<span>Thêm người</span></button>`;
  } else if (page === 'activity' || page === 'dashboard') {
    box.innerHTML = `<button class="btn accent" data-action="new-lend">${icon('plus', 18)}<span>Cho vay</span></button>`;
  } else {
    box.innerHTML = '';
  }
}

/* ============================================================
   VIEWS (DASHBOARD, CONTACTS, ACTIVITY, SETTINGS)
   ============================================================ */
function renderDashboard() {
  const g = globalStats();
  const alerts = attentionLends();

  const html = `
    <section class="hero">
      <div class="hero-eyebrow">${icon('wallet', 16)} Tổng dư nợ cần thu</div>
      <div class="hero-net">${money(g.totalOutstanding)}</div>
      <div class="hero-split">
        <div>
          <div class="hero-split-label">Gốc còn lại</div>
          <div class="hero-split-value">${money(g.totalPrincipalOut)}</div>
        </div>
        <div>
          <div class="hero-split-label">Lãi tích lũy</div>
          <div class="hero-split-value amber">${money(g.totalInterestOut)}</div>
        </div>
        <div>
          <div class="hero-split-label">Đã thu về</div>
          <div class="hero-split-value pos">${money(g.totalPaid)}</div>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stat"><div class="stat-label">${icon('users', 16)} Người vay</div><div class="stat-value">${db.contacts.length}</div></div>
      <div class="stat"><div class="stat-label">${icon('clock', 16)} Hoạt động</div><div class="stat-value">${db.transactions.filter(t => t.type === 'lend').length}</div></div>
      <div class="stat"><div class="stat-label">${icon('bell', 16)} Sắp đáo hạn</div><div class="stat-value amber">${g.dueSoonCount}</div></div>
      <div class="stat"><div class="stat-label">${icon('bell', 16)} Quá hạn</div><div class="stat-value red">${g.overdueCount}</div></div>
    </section>
  `;
  $('#view').innerHTML = html;
}

function renderContacts() {
  const html = `
    <div class="toolbar" style="margin-bottom: 24px; display:flex; justify-content: space-between;">
      <h2>Danh sách người vay</h2>
    </div>
    <div class="grid">
      ${db.contacts.map(c => {
        const s = contactStats(c.id);
        return `
          <div class="card contact-card" data-contact-id="${c.id}" style="padding: 20px; cursor:pointer;">
            <div style="font-size:18px; font-weight:600; margin-bottom:12px;">${escapeHtml(c.name)}</div>
            <div style="color:var(--text-2); font-size:14px; margin-bottom:16px;">${s.lendCount} khoản vay</div>
            <div style="font-size:22px; font-weight:600; color:var(--accent);">${money(s.totalOutstanding)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  $('#view').innerHTML = html;
  bindViewEvents();
}

function renderContactDetail(id) {
  const c = db.contacts.find(x => x.id === id);
  if (!c) { location.hash = '#/contacts'; return; }
  const s = contactStats(id);
  const lends = s.lends.map(l => lendCardHTML(l)).join('');

  $('#view').innerHTML = `
    <div style="margin-bottom: 32px;">
      <h2 style="font-size: 32px; margin-bottom: 8px;">${escapeHtml(c.name)}</h2>
      <div style="color:var(--text-2); margin-bottom: 24px;">${escapeHtml(c.phone || c.note || 'Chưa có thông tin phụ')}</div>
      <div style="font-size: 40px; font-weight:600; color:var(--accent);">${money(s.totalOutstanding)}</div>
    </div>
    <div class="loan-list">${lends}</div>
  `;
  bindViewEvents();
}

function lendCardHTML(s) {
  const l = s.lend;
  return `
    <div class="card" style="padding: 24px; margin-bottom: 16px;">
      <div style="display:flex; justify-content:space-between; margin-bottom: 16px;">
        <div>
          <div style="font-size: 24px; font-weight: 600;">${money(l.amount)}</div>
          <div style="color:var(--text-2); font-size:14px; margin-top:8px;">
            Lãi suất ${l.rate}%/tháng · Kỳ hạn ${l.months} tháng
          </div>
        </div>
        <div class="status-badge ${s.status}">${s.statusLabel}</div>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; margin-bottom: 24px; padding-top: 16px; border-top:1px dashed var(--border);">
        <div><div style="font-size:13px; color:var(--text-3);">Gốc còn lại</div><div style="font-weight:600; font-size:16px;">${money(s.outstandingPrincipal)}</div></div>
        <div><div style="font-size:13px; color:var(--text-3);">Lãi tích lũy</div><div style="font-weight:600; font-size:16px; color:var(--amber);">${money(s.outstandingInterest)}</div></div>
        <div><div style="font-size:13px; color:var(--text-3);">Tổng phải thu</div><div style="font-weight:600; font-size:16px; color:var(--accent);">${money(s.totalOutstanding)}</div></div>
      </div>
      <div style="display:flex; gap:12px;">
        <button class="btn ghost sm" data-action="collect-interest" data-lend="${l.id}">${icon('percent', 16)} Thu lãi</button>
        <button class="btn ghost sm" data-action="collect-principal" data-lend="${l.id}">${icon('arrowDownLeft', 16)} Thu gốc</button>
      </div>
    </div>
  `;
}

function renderActivity() { $('#view').innerHTML = `<h2>Hoạt động</h2><p style="margin-top:16px; color:var(--text-2);">Tính năng đang được thiết kế lại.</p>`; }
function renderSettings() { $('#view').innerHTML = `<h2>Cài đặt</h2><p style="margin-top:16px; color:var(--text-2);">Tính năng đang được thiết kế lại.</p>`; }

/* ============================================================
   FORMS / MODALS (ADD CONTACT, ADD LEND)
   ============================================================ */
function openContactForm(id = null) {
  const c = id ? db.contacts.find(x => x.id === id) : null;
  const title = c ? 'Sửa người vay' : 'Thêm người vay';
  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 20)}</button>
    </div>
    <form id="contactForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="cName">Tên <span class="req">*</span></label>
          <input type="text" class="input" id="cName" placeholder="VD: Nguyễn Văn A" value="${escapeHtml(c?.name || '')}" required autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cPhone">Số điện thoại <span class="opt">(tuỳ chọn)</span></label>
          <input type="tel" class="input" id="cPhone" placeholder="VD: 0912 345 678" value="${escapeHtml(c?.phone || '')}" autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label" for="cNote">Ghi chú <span class="opt">(tuỳ chọn)</span></label>
          <textarea class="textarea" id="cNote" placeholder="VD: Bạn giới thiệu...">${escapeHtml(c?.note || '')}</textarea>
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
    const name = $('#cName').value.trim(); const phone = $('#cPhone').value.trim(); const note = $('#cNote').value.trim();
    if (!name) return;
    if (c) { Object.assign(c, { name, phone, note }); toast('Đã cập nhật', 'success'); } 
    else { db.contacts.push({ id: uid(), name, phone, note, createdAt: Date.now() }); toast('Đã thêm người vay', 'success'); }
    save(); closeModal(); buildNav(); navigate();
  });
}

function openLendForm({ contactId = null } = {}) {
  if (!db.contacts.length) { toast('Thêm người vay trước đã nhé', 'error'); openContactForm(); return; }
  const contactOptions = db.contacts.map(c => `<option value="${c.id}"${c.id === contactId ? ' selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
  const termChips = TERM_OPTIONS.map(n => `<button type="button" class="term-chip${n === 3 ? ' active' : ''}" data-months="${n}">${n}</button>`).join('');

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">Cho vay mới</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 20)}</button>
    </div>
    <form id="lendForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="lContact">Người vay <span class="req">*</span></label>
          <select class="select-field" id="lContact" required>${contactOptions}</select>
        </div>
        <div class="field">
          <label class="field-label" for="lAmount">Số tiền (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="lAmount" inputmode="numeric" placeholder="0" required autocomplete="off">
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field-label" for="lRate">Lãi suất (%/tháng) <span class="req">*</span></label>
            <input type="number" class="input" id="lRate" min="0" step="0.1" value="20" required>
          </div>
          <div class="field">
            <label class="field-label" for="lDate">Ngày cho vay</label>
            <input type="date" class="input" id="lDate" value="${todayISO()}">
          </div>
        </div>
        <div class="field">
          <label class="field-label">Kỳ hạn (tháng) <span class="req">*</span></label>
          <div class="term-grid" id="termGrid">${termChips}</div>
        </div>
        <div class="preview-box">
          <div class="preview-item">
            <span class="preview-label">Tiền lãi dự kiến</span>
            <span class="preview-value" id="previewInterest">0 ₫</span>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-close>Huỷ</button>
        <button type="submit" class="btn accent">Xác nhận</button>
      </div>
    </form>
  `);

  let currentMonths = 3;
  function updatePreview() {
    const amt = Number($('#lAmount').value.replace(/\D/g, '')) || 0;
    const r = Number($('#lRate').value) || 0;
    if (amt > 0 && r >= 0 && currentMonths > 0) {
      const interest = amt * (r / 100) * currentMonths;
      $('#previewInterest').textContent = money(interest);
    } else {
      $('#previewInterest').textContent = '0 ₫';
    }
  }

  $$('#termGrid .term-chip').forEach(chip => {     chip.addEventListener('click', () => {       currentMonths = Number(chip.dataset.months);       $$
('#termGrid .term-chip').forEach(c => c.classList.toggle('active', c === chip));
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

  $('#lendForm').addEventListener('submit', e => {
    e.preventDefault();
    const cId = $('#lContact').value;
    const amountVal = Number(amt.value.replace(/\D/g, ''));
    const rateVal = Number($('#lRate').value);
    
    if (!amountVal || amountVal <= 0) return toast('Nhập số tiền hợp lệ', 'error');
    
    db.transactions.push({ id: uid(), contactId: cId, type: 'lend', amount: amountVal, rate: rateVal, months: currentMonths, date: $('#lDate').value || todayISO(), createdAt: Date.now() });
    save(); closeModal(); navigate(); toast('Đã lưu khoản vay', 'success');
  });
}

function openPaymentForm({ lendId, type }) {
  const lend = db.transactions.find(t => t.id === lendId && t.type === 'lend');
  if (!lend) return;
  const s = lendSummary(lend);
  const isInterest = type === 'interest';
  const suggestedAmount = Math.round(isInterest ? s.outstandingInterest : s.outstandingPrincipal);
  const title = isInterest ? 'Thu lãi' : 'Thu gốc';

  openModal(`
    <div class="modal-head">
      <h2 class="modal-title">${title}</h2>
      <button class="icon-btn" data-close type="button">${icon('x', 20)}</button>
    </div>
    <form id="paymentForm">
      <div class="modal-body">
        <div class="field">
          <label class="field-label" for="pAmount">Số tiền thu (₫) <span class="req">*</span></label>
          <input type="text" class="input money" id="pAmount" inputmode="numeric" value="${suggestedAmount > 0 ? nf.format(suggestedAmount) : ''}" required autocomplete="off">
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

  $('#paymentForm').addEventListener('submit', e => {
    e.preventDefault();
    const amountVal = Number(amt.value.replace(/\D/g, ''));
    if (!amountVal || amountVal <= 0) return toast('Lỗi số tiền', 'error');
    
    db.transactions.push({ id: uid(), contactId: lend.contactId, lendId: lend.id, type, amount: amountVal, date: todayISO(), createdAt: Date.now() });
    save(); closeModal(); navigate(); toast(`Đã lưu ${title.toLowerCase()}`, 'success');
  });
}

/* ============================================================
   EVENTS & INIT
   ============================================================ */
function bindViewEvents() {
  const view = $('#view');   $$('[data-contact-id]', view).forEach(el => el.addEventListener('click', () => location.hash = `#/contacts/${el.dataset.contactId}`));
  $$('[data-action]', view).forEach(el => el.addEventListener('click', e => {
    const action = el.dataset.action;
    if (action === 'new-lend') openLendForm({ contactId: el.dataset.contact });
    if (action === 'new-contact') openContactForm();
    if (action === 'collect-interest') { e.stopPropagation(); openPaymentForm({ lendId: el.dataset.lend, type: 'interest' }); }
    if (action === 'collect-principal') { e.stopPropagation(); openPaymentForm({ lendId: el.dataset.lend, type: 'principal' }); }
  }));
}

function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'system');
  load(); buildNav();

  document.body.addEventListener('click', e => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl || $('#view')?.contains(actionEl)) return;
    if (actionEl.dataset.action === 'new-lend') openLendForm({});
    if (actionEl.dataset.action === 'theme-toggle') toggleTheme();
    if (actionEl.dataset.action === 'back') history.back();
  });

  $('#fab').addEventListener('click', () => openLendForm({}));
  window.addEventListener('hashchange', navigate);
  if (!location.hash) location.hash = '#/dashboard';
  navigate();
}

document.addEventListener('DOMContentLoaded', init);
