/* ═══════════════════════════════════════════
   Budget Management System — index.js
   Features: Delete/Edit, Transaction History,
   Export CSV/PDF, Recurring Expenses,
   Avatar Upload, Animated Counters,
   Mobile Bottom Nav, Theme Fix
   ═══════════════════════════════════════════ */

const API_BASE    = 'http://localhost:8080/api';
const EXPENSE_API = `${API_BASE}/expenses`;
const INCOME_API  = `${API_BASE}/income`;
const BUDGET_API  = `${API_BASE}/budget`;

const CATEGORY_COLORS = {
  Food:'#FFB74D', Rent:'#EF5350', Utilities:'#9575CD',
  Transportation:'#4FC3F7', Entertainment:'#81C784',
  Health:'#E57373', Education:'#64B5F6',
  Shopping:'#F06292', Travel:'#4DB6AC', Other:'#BDBDBD',
};

/* ── State ── */
let expenses      = [];
let incomeEntries = [];
let monthlyBudget = 0;
let recurringList = [];
let categoryChart, monthlyChart;

/* ══════════════════════════════════════
   UTILITIES
══════════════════════════════════════ */
function showToast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icons = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 320);
  }, duration);
}

function setLoading(btn, state) {
  btn.classList.toggle('loading', state);
}

function fmt(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  // BUG FIX: "2025-03-15" parsed as UTC midnight causes off-by-one day
  // Force local date by replacing dashes
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
    return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }
  return dateStr;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* Animated counter — UI improvement */
function animateCounter(el, targetStr) {
  const isRupee = targetStr.startsWith('₹');
  const target  = parseFloat(targetStr.replace(/[^0-9.-]/g,'')) || 0;
  const start   = parseFloat(el.textContent.replace(/[^0-9.-]/g,'')) || 0;
  const duration = 600;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = start + (target - start) * ease;
    el.textContent = isRupee ? `₹${current.toFixed(2)}` : Math.round(current).toString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = targetStr;
  }
  requestAnimationFrame(update);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  const userId   = localStorage.getItem('userId');
  const fullName = localStorage.getItem('fullName');
  if (!userId || !fullName) { window.location.href = 'login.html'; return; }

  // BUG FIX: Theme applied BEFORE any rendering so charts use correct colors
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme, false); // false = don't re-render charts yet

  // Header — show full first name, tooltip shows full name
  document.getElementById('welcomeUser').textContent = fullName.split(' ')[0];
  document.getElementById('welcomeUser').title = fullName;
  document.getElementById('userInitial').textContent  = fullName.charAt(0).toUpperCase();
  document.getElementById('headerDate').textContent   =
    new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // Default dates
  document.getElementById('expenseDate').value = todayISO();
  document.getElementById('incomeDate').value  = todayISO();

  // Load avatar if saved
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) setAvatarImage(savedAvatar);

  // Load recurring from localStorage
  recurringList = JSON.parse(localStorage.getItem('recurringExpenses') || '[]');

  // Load backend data
  await loadAllData(Number(userId));

  // Render everything
  renderDashboard();
  renderSummary();
  renderBudgetGoals();
  renderSettings();
  renderTransactionTable();
  renderRecurringList();

  // Setup
  setupNav();
  setupEventListeners();
  setupFilters();
  setupModal();
  setupMobileMenu();
  setupAvatarUpload();
  setupExport();

  // Check if any recurring expenses should fire today
  checkRecurringExpenses();
});

/* ══════════════════════════════════════
   DATA LOADING
══════════════════════════════════════ */
async function loadAllData(userId) {
  try {
    const [expRes, incRes, budRes] = await Promise.allSettled([
      fetch(`${EXPENSE_API}/user/${userId}`),
      fetch(`${INCOME_API}/user/${userId}`),
      fetch(`${BUDGET_API}/user/${userId}`),
    ]);
    if (expRes.status === 'fulfilled' && expRes.value.ok) expenses = await expRes.value.json();
    if (incRes.status === 'fulfilled' && incRes.value.ok) incomeEntries = await incRes.value.json();
    if (budRes.status === 'fulfilled' && budRes.value.ok) {
      const b = await budRes.value.json();
      if (b && typeof b.amount === 'number' && b.amount > 0) monthlyBudget = b.amount;
    }
  } catch (err) {
    console.error('Data load error:', err);
    showToast('Some data could not be loaded', 'warning');
  }
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function setupNav() {
  const sectionTitles = {
    dashboard:'Dashboard', addExpense:'Add Expense', addIncome:'Add Income',
    transactions:'Transaction History', expenseSummary:'Financial Overview',
    budgetGoals:'Budget & Goals', recurring:'Recurring Expenses',
    profile:'My Profile', settings:'Settings',
  };

  // Sidebar nav
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.section, sectionTitles));
  });

  // Mobile bottom nav
  document.querySelectorAll('.mbn-item[data-section]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.section, sectionTitles));
  });

  document.getElementById('logoutBtn').addEventListener('click', doLogout);
  document.getElementById('logoutBtnSettings')?.addEventListener('click', doLogout);
}

function navigateTo(sectionId, titles) {
  // Update sidebar active
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-section="${sectionId}"]`)?.classList.add('active');
  // Update mobile bottom nav active
  document.querySelectorAll('.mbn-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.mbn-item[data-section="${sectionId}"]`)?.classList.add('active');
  // Show section
  showSection(sectionId);
  if (titles) document.getElementById('headerTitle').textContent = titles[sectionId] || sectionId;
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
  // Re-render if going to transactions or profile
  if (sectionId === 'transactions') renderTransactionTable();
  if (sectionId === 'profile')      renderProfilePage();
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function doLogout() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    window.location.href = 'login.html';
  }
}

/* ══════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════ */
function setupMobileMenu() {
  const btn     = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  btn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

/* ══════════════════════════════════════
   THEME  — BUG FIX: theme correctly
   persists and applies on load
══════════════════════════════════════ */
function applyTheme(theme, rerender = true) {
  document.body.classList.toggle('light', theme === 'light');
  localStorage.setItem('theme', theme);
  const isDark = theme === 'dark';
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.textContent = isDark ? '🌙' : '☀️';
  const lbl = document.getElementById('themeSettingLabel');
  if (lbl) lbl.textContent = isDark ? 'Switch to Light' : 'Switch to Dark';
  if (rerender) renderCharts();
}

function toggleTheme() {
  applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
}

/* ══════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════ */
function setupEventListeners() {
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('themeSettingBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('saveExpense').addEventListener('click', handleAddExpense);
  document.getElementById('saveIncome').addEventListener('click', handleAddIncome);
  document.getElementById('setBudget').addEventListener('click', handleSetBudget);
  document.getElementById('saveRecurring').addEventListener('click', handleAddRecurring);
}

/* ══════════════════════════════════════
   ADD EXPENSE
══════════════════════════════════════ */
async function handleAddExpense() {
  const title       = document.getElementById('expenseTitle').value.trim();
  const amount      = parseFloat(document.getElementById('expenseAmount').value);
  const date        = document.getElementById('expenseDate').value;
  const category    = document.getElementById('expenseCategory').value;
  const description = document.getElementById('expenseDescription').value.trim();
  const btn         = document.getElementById('saveExpense');

  if (!title)                       { showToast('Title is required.', 'error'); return; }
  if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount.', 'error'); return; }
  if (!date)                        { showToast('Date is required.', 'error'); return; }
  if (!category)                    { showToast('Category is required.', 'error'); return; }

  const userId = Number(localStorage.getItem('userId'));
  setLoading(btn, true);
  try {
    const res = await fetch(`${EXPENSE_API}/add`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title, amount, date, category, description, user:{ id:userId } }),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    expenses.push(saved);
    clearForm('expense');
    refreshAll();
    showToast(`Expense "${title}" added!`, 'success');
  } catch (e) {
    showToast('Failed to save expense: ' + e.message, 'error');
  } finally { setLoading(btn, false); }
}

/* ══════════════════════════════════════
   ADD INCOME
══════════════════════════════════════ */
async function handleAddIncome() {
  const source = document.getElementById('incomeSource').value.trim();
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  const date   = document.getElementById('incomeDate').value;
  const btn    = document.getElementById('saveIncome');

  if (!source)                      { showToast('Source is required.', 'error'); return; }
  if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount.', 'error'); return; }
  if (!date)                        { showToast('Date is required.', 'error'); return; }

  const userId = Number(localStorage.getItem('userId'));
  setLoading(btn, true);
  try {
    const res = await fetch(`${INCOME_API}/add`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ source, amount, date, user:{ id:userId } }),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    incomeEntries.push(saved);
    clearForm('income');
    refreshAll();
    showToast(`Income "${source}" added!`, 'success');
  } catch (e) {
    showToast('Failed to save income: ' + e.message, 'error');
  } finally { setLoading(btn, false); }
}

/* ══════════════════════════════════════
   SET BUDGET
══════════════════════════════════════ */
async function handleSetBudget() {
  const amount = parseFloat(document.getElementById('monthlyBudget').value);
  const btn    = document.getElementById('setBudget');
  if (isNaN(amount) || amount <= 0) { showToast('Enter a valid budget amount.', 'error'); return; }
  const userId = Number(localStorage.getItem('userId'));
  setLoading(btn, true);
  try {
    const res = await fetch(`${BUDGET_API}/budget/add`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ amount, user:{ id:userId } }),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    monthlyBudget = saved.amount ?? amount;
    document.getElementById('monthlyBudget').value = '';
    renderBudgetGoals();
    renderDashboard();
    showToast(`Monthly budget set to ${fmt(monthlyBudget)}`, 'success');
  } catch (e) {
    showToast('Failed to save budget: ' + e.message, 'error');
  } finally { setLoading(btn, false); }
}

/* ══════════════════════════════════════
   DELETE EXPENSE / INCOME
══════════════════════════════════════ */
async function handleDelete(id, type) {
  if (!confirm(`Delete this ${type}? This cannot be undone.`)) return;
  try {
    // BUG FIX: Use correct REST endpoint per type
    const url = type === 'expense'
      ? `${EXPENSE_API}/${id}`
      : `${INCOME_API}/${id}`;
    const res = await fetch(url, { method:'DELETE' });
    // 404 is OK — entry may not exist server-side (deleted already)
    if (!res.ok && res.status !== 404) throw new Error('Server error');
    if (type === 'expense') expenses      = expenses.filter(e => e.id !== id);
    else                    incomeEntries = incomeEntries.filter(i => i.id !== id);
    refreshAll();
    showToast(`${type === 'expense' ? 'Expense' : 'Income'} deleted.`, 'success');
  } catch (e) {
    showToast('Failed to delete. Check server.', 'error');
  }
}

/* ══════════════════════════════════════
   EDIT MODAL
══════════════════════════════════════ */
function setupModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', handleSaveEdit);
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editModal')) closeModal();
  });
}

function openEditModal(item, type) {
  document.getElementById('editModal').classList.add('open');
  document.getElementById('modalTitle').textContent = type === 'expense' ? 'Edit Expense' : 'Edit Income';
  document.getElementById('editId').value   = item.id;
  document.getElementById('editType').value = type;
  document.getElementById('editAmount').value = item.amount;
  // BUG FIX: date from server is "2025-03-15", set directly to input
  document.getElementById('editDate').value = item.date ? String(item.date).split('T')[0] : '';

  const titleWrap    = document.getElementById('editTitleWrap');
  const sourceWrap   = document.getElementById('editSourceWrap');
  const categoryWrap = document.getElementById('editCategoryWrap');

  if (type === 'expense') {
    titleWrap.style.display    = '';
    sourceWrap.style.display   = 'none';
    categoryWrap.style.display = '';
    document.getElementById('editTitle').value    = item.title;
    document.getElementById('editCategory').value = item.category;
  } else {
    titleWrap.style.display    = 'none';
    sourceWrap.style.display   = '';
    categoryWrap.style.display = 'none';
    document.getElementById('editSource').value = item.source;
  }
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
}

async function handleSaveEdit() {
  const id     = Number(document.getElementById('editId').value);
  const type   = document.getElementById('editType').value;
  const amount = parseFloat(document.getElementById('editAmount').value);
  const date   = document.getElementById('editDate').value;
  const btn    = document.getElementById('modalSave');

  if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount.', 'error'); return; }
  if (!date)                        { showToast('Date is required.', 'error'); return; }

  const userId = Number(localStorage.getItem('userId'));
  setLoading(btn, true);

  try {
    let body, url;
    if (type === 'expense') {
      const title    = document.getElementById('editTitle').value.trim();
      const category = document.getElementById('editCategory').value;
      if (!title) { showToast('Title is required.', 'error'); setLoading(btn, false); return; }
      url  = `${EXPENSE_API}/${id}`;
      body = { id, title, amount, date, category, user:{ id:userId } };
    } else {
      const source = document.getElementById('editSource').value.trim();
      if (!source) { showToast('Source is required.', 'error'); setLoading(btn, false); return; }
      url  = `${INCOME_API}/${id}`;
      body = { id, source, amount, date, user:{ id:userId } };
    }

    const res = await fetch(url, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();

    if (type === 'expense') {
      const idx = expenses.findIndex(e => e.id === id);
      if (idx > -1) expenses[idx] = updated;
    } else {
      const idx = incomeEntries.findIndex(i => i.id === id);
      if (idx > -1) incomeEntries[idx] = updated;
    }

    closeModal();
    refreshAll();
    showToast('Transaction updated!', 'success');
  } catch (e) {
    showToast('Failed to update. Check server.', 'error');
  } finally { setLoading(btn, false); }
}

/* ══════════════════════════════════════
   TRANSACTION HISTORY TABLE
══════════════════════════════════════ */
function setupFilters() {
  ['filterSearch','filterType','filterCategory','filterFrom','filterTo'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderTransactionTable);
    document.getElementById(id)?.addEventListener('change', renderTransactionTable);
  });
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.getElementById('filterSearch').value   = '';
    document.getElementById('filterType').value     = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterFrom').value     = '';
    document.getElementById('filterTo').value       = '';
    renderTransactionTable();
  });
}

function getFilteredTransactions() {
  const search   = document.getElementById('filterSearch')?.value.toLowerCase() || '';
  const type     = document.getElementById('filterType')?.value || 'all';
  const category = document.getElementById('filterCategory')?.value || 'all';
  const from     = document.getElementById('filterFrom')?.value || '';
  const to       = document.getElementById('filterTo')?.value || '';

  let rows = [];

  if (type !== 'income') {
    expenses.forEach(e => rows.push({ ...e, _type:'expense', _label: e.title }));
  }
  if (type !== 'expense') {
    incomeEntries.forEach(i => rows.push({ ...i, _type:'income', _label: i.source }));
  }

  return rows.filter(r => {
    const dateStr = r.date ? String(r.date).split('T')[0] : '';
    if (search   && !r._label?.toLowerCase().includes(search)) return false;
    if (category !== 'all' && r._type === 'expense' && r.category !== category) return false;
    if (category !== 'all' && r._type === 'income') return false;
    if (from && dateStr < from) return false;
    if (to   && dateStr > to)   return false;
    return true;
  }).sort((a, b) => (String(b.date) > String(a.date) ? 1 : -1));
}

function renderTransactionTable() {
  const rows  = getFilteredTransactions();
  const tbody = document.getElementById('txBody');
  const empty = document.getElementById('txEmpty');
  const count = document.getElementById('txCount');

  count.textContent = `${rows.length} transaction${rows.length !== 1 ? 's' : ''}`;

  if (!rows.length) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = rows.map(r => {
    const dateStr = r.date ? String(r.date).split('T')[0] : '';
    const cat = r._type === 'expense'
      ? `<span class="tx-cat">${r.category || '—'}</span>`
      : `<span class="tx-cat">—</span>`;
    const amtClass = r._type === 'expense' ? 'tx-amount-expense' : 'tx-amount-income';
    const sign     = r._type === 'expense' ? '-' : '+';
    return `<tr>
      <td>${fmtDate(dateStr)}</td>
      <td style="font-weight:600;">${r._label || '—'}</td>
      <td>${cat}</td>
      <td><span class="tx-badge ${r._type}">${r._type === 'expense' ? 'Expense' : 'Income'}</span></td>
      <td class="${amtClass}">${sign}${fmt(r.amount)}</td>
      <td><div class="tx-actions">
        <button class="btn-edit" data-id="${r.id}" data-type="${r._type}" title="Edit">✏️</button>
        <button class="btn-delete" onclick="handleDelete(${r.id}, '${r._type}')" title="Delete">🗑️</button>
      </div></td>
    </tr>`;
  }).join('');
}

// FIX: Edit button previously embedded a double-JSON-stringified transaction
// object directly inside an inline onclick="..." attribute. Any quote
// character inside that stringified JSON (which JSON.stringify always
// produces, since it wraps the value in double quotes) prematurely closed
// the onclick="..." attribute, so the browser silently dropped the rest of
// the handler and the button did nothing. Fixed by storing only the row id
// on the button (data-id) and looking the full record up from the in-memory
// expenses/incomeEntries arrays via one delegated click listener, so no
// object data ever has to be serialized into HTML at all.
document.getElementById('txBody').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-edit');
  if (!btn) return;
  const id   = Number(btn.dataset.id);
  const type = btn.dataset.type;
  const item = type === 'expense'
    ? expenses.find(x => x.id === id)
    : incomeEntries.find(x => x.id === id);
  if (item) openEditModal(item, type);
});

/* ══════════════════════════════════════
   EXPORT CSV / PDF
══════════════════════════════════════ */
function setupExport() {
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    showToast('Go to Transaction History to export', 'info');
    navigateTo('transactions', null);
  });

  document.getElementById('exportCSV')?.addEventListener('click', exportCSV);
  document.getElementById('exportPDF')?.addEventListener('click', exportPDF);
}

function exportCSV() {
  const rows = getFilteredTransactions();
  if (!rows.length) { showToast('No data to export.', 'warning'); return; }

  const headers = ['Date','Title/Source','Category','Type','Amount'];
  const csvRows = [headers.join(',')];
  rows.forEach(r => {
    const dateStr = r.date ? String(r.date).split('T')[0] : '';
    const sign = r._type === 'expense' ? '-' : '+';
    csvRows.push([
      dateStr,
      `"${(r._label || '').replace(/"/g,'""')}"`,
      r.category || '—',
      r._type,
      `"${sign}${r.amount.toFixed(2)}"`,
    ].join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `budget-export-${todayISO()}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('CSV exported!', 'success');
}

function exportPDF() {
  const rows = getFilteredTransactions();
  if (!rows.length) { showToast('No data to export.', 'warning'); return; }

  const fullName = localStorage.getItem('fullName') || 'User';
  const totalIncome   = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const tableRows = rows.map(r => {
    const dateStr = r.date ? String(r.date).split('T')[0] : '';
    const sign = r._type === 'expense' ? '-' : '+';
    const color = r._type === 'expense' ? '#ef5350' : '#4afa9a';
    return `<tr>
      <td>${fmtDate(dateStr)}</td>
      <td>${r._label || '—'}</td>
      <td>${r.category || '—'}</td>
      <td style="text-transform:capitalize;">${r._type}</td>
      <td style="color:${color};font-weight:700;">${sign}₹${r.amount.toFixed(2)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Budget Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin:40px; color:#1a1a2e; }
    h1 { color:#0ea5e9; margin-bottom:4px; }
    .sub { color:#666; margin-bottom:24px; font-size:14px; }
    .summary { display:flex; gap:20px; margin-bottom:28px; }
    .sum-box { padding:14px 20px; border-radius:10px; flex:1; }
    .sum-box.income  { background:#e8fef5; border:1px solid #4afa9a; }
    .sum-box.expense { background:#fff5f5; border:1px solid #ef5350; }
    .sum-box.saving  { background:#f0f4ff; border:1px solid #63d2ff; }
    .sum-label { font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#666; }
    .sum-value { font-size:22px; font-weight:800; margin-top:4px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f4f7ff; padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#666; }
    td { padding:11px 12px; border-bottom:1px solid #eee; }
    tr:hover td { background:#fafafa; }
    .footer { margin-top:30px; font-size:12px; color:#999; text-align:center; }
  </style></head><body>
  <h1>💰 Budget Report</h1>
  <div class="sub">Generated for ${fullName} on ${new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'long',year:'numeric'})}</div>
  <div class="summary">
    <div class="sum-box income"><div class="sum-label">Total Income</div><div class="sum-value" style="color:#22c55e;">₹${totalIncome.toFixed(2)}</div></div>
    <div class="sum-box expense"><div class="sum-label">Total Expenses</div><div class="sum-value" style="color:#ef5350;">₹${totalExpenses.toFixed(2)}</div></div>
    <div class="sum-box saving"><div class="sum-label">Net Savings</div><div class="sum-value" style="color:#0ea5e9;">₹${(totalIncome-totalExpenses).toFixed(2)}</div></div>
  </div>
  <table><thead><tr><th>Date</th><th>Title/Source</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead>
  <tbody>${tableRows}</tbody></table>
  <div class="footer">Budget Management System — Exported ${new Date().toLocaleString('en-IN')}</div>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
  showToast('PDF report opened!', 'success');
}

/* ══════════════════════════════════════
   RECURRING EXPENSES
══════════════════════════════════════ */
function handleAddRecurring() {
  const title    = document.getElementById('recurTitle').value.trim();
  const amount   = parseFloat(document.getElementById('recurAmount').value);
  const category = document.getElementById('recurCategory').value;
  const day      = parseInt(document.getElementById('recurDay').value);
  const desc     = document.getElementById('recurDesc').value.trim();

  if (!title)                       { showToast('Title is required.', 'error'); return; }
  if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount.', 'error'); return; }
  if (!category)                    { showToast('Category is required.', 'error'); return; }
  if (!day || day < 1 || day > 28)  { showToast('Enter a valid day (1–28).', 'error'); return; }

  const entry = { id: Date.now(), title, amount, category, day, description: desc, createdAt: todayISO() };
  recurringList.push(entry);
  localStorage.setItem('recurringExpenses', JSON.stringify(recurringList));

  document.getElementById('recurTitle').value    = '';
  document.getElementById('recurAmount').value   = '';
  document.getElementById('recurCategory').value = '';
  document.getElementById('recurDay').value      = '';
  document.getElementById('recurDesc').value     = '';

  renderRecurringList();
  showToast(`"${title}" added as recurring!`, 'success');
}

function deleteRecurring(id) {
  recurringList = recurringList.filter(r => r.id !== id);
  localStorage.setItem('recurringExpenses', JSON.stringify(recurringList));
  renderRecurringList();
  showToast('Recurring expense removed.', 'info');
}

function renderRecurringList() {
  const container = document.getElementById('recurringList');
  const empty     = document.getElementById('recurEmpty');
  if (!recurringList.length) {
    container.innerHTML = '';
    container.appendChild(empty);
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = recurringList.map(r => `
    <div class="recur-item">
      <div class="recur-info">
        <div class="recur-title">${r.title}</div>
        <div class="recur-meta">${r.category} · Every month on day ${r.day}${r.description ? ' · ' + r.description : ''}</div>
      </div>
      <div class="recur-right">
        <span class="recur-amount">${fmt(r.amount)}</span>
        <button class="btn-delete" onclick="deleteRecurring(${r.id})" title="Remove">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function checkRecurringExpenses() {
  if (!recurringList.length) return;
  const today   = new Date();
  const todayD  = today.getDate();
  const monthKey = `${today.getFullYear()}-${today.getMonth()+1}`;
  const fired    = JSON.parse(localStorage.getItem('recurringFired') || '{}');
  const userId   = Number(localStorage.getItem('userId'));

  for (const r of recurringList) {
    if (r.day === todayD && !fired[`${r.id}-${monthKey}`]) {
      try {
        const date = todayISO();
        const res = await fetch(`${EXPENSE_API}/add`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ title: r.title, amount: r.amount, date, category: r.category, description: r.description || 'Recurring', user:{ id: userId } }),
        });
        if (res.ok) {
          const saved = await res.json();
          expenses.push(saved);
          fired[`${r.id}-${monthKey}`] = true;
          showToast(`🔁 Recurring expense "${r.title}" auto-added!`, 'info', 5000);
        }
      } catch(e) { console.error('Recurring auto-add failed:', e); }
    }
  }
  localStorage.setItem('recurringFired', JSON.stringify(fired));
  if (Object.keys(fired).length) refreshAll();
}

/* ══════════════════════════════════════
   AVATAR UPLOAD — UI Improvement
══════════════════════════════════════ */
function setupAvatarUpload() {
  // Settings page avatar
  document.getElementById('avatarInput')?.addEventListener('change', (e) => handleAvatarFile(e.target.files[0]));
  // Profile page avatar
  document.getElementById('avatarInputProfile')?.addEventListener('change', (e) => handleAvatarFile(e.target.files[0]));
  // Remove avatar button
  document.getElementById('removeAvatarBtn')?.addEventListener('click', removeAvatar);
}

function handleAvatarFile(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    localStorage.setItem('userAvatar', dataUrl);
    setAvatarImage(dataUrl);
    showToast('Profile photo updated!', 'success');
    // Show remove button
    const removeBtn = document.getElementById('removeAvatarBtn');
    if (removeBtn) removeBtn.style.display = '';
  };
  reader.readAsDataURL(file);
}

function removeAvatar() {
  if (!confirm('Remove your profile photo?')) return;
  localStorage.removeItem('userAvatar');
  const fullName = localStorage.getItem('fullName') || 'U';
  const initial  = fullName.charAt(0).toUpperCase();
  // Reset all avatar elements back to initials
  const userInitial  = document.getElementById('userInitial');
  const profileAvLg  = document.getElementById('profileAvatarLg');
  const profileAvSm  = document.getElementById('profileAvatar');
  if (userInitial) userInitial.innerHTML = initial;
  if (profileAvLg) profileAvLg.innerHTML = initial;
  if (profileAvSm) profileAvSm.textContent = initial;
  // Hide remove button
  const removeBtn = document.getElementById('removeAvatarBtn');
  if (removeBtn) removeBtn.style.display = 'none';
  showToast('Profile photo removed.', 'info');
}

function setAvatarImage(dataUrl) {
  const img = `<img src="${dataUrl}" alt="avatar" />`;
  const els = ['userInitial','profileAvatarLg','profileAvatar'];
  els.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = img; });
  const removeBtn = document.getElementById('removeAvatarBtn');
  if (removeBtn) removeBtn.style.display = '';
}

/* ══════════════════════════════════════
   REFRESH ALL
══════════════════════════════════════ */
function refreshAll() {
  renderDashboard();
  renderSummary();
  renderBudgetGoals();
  renderTransactionTable();
}

function clearForm(type) {
  if (type === 'expense') {
    document.getElementById('expenseTitle').value       = '';
    document.getElementById('expenseAmount').value      = '';
    document.getElementById('expenseDate').value        = todayISO();
    document.getElementById('expenseCategory').value    = '';
    document.getElementById('expenseDescription').value = '';
  } else {
    document.getElementById('incomeSource').value = '';
    document.getElementById('incomeAmount').value = '';
    document.getElementById('incomeDate').value   = todayISO();
  }
}

/* ══════════════════════════════════════
   RENDER DASHBOARD — with animated counters
══════════════════════════════════════ */
function renderDashboard() {
  const total       = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const savings     = totalIncome - total;

  const now          = new Date();
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  const monthlyExp = expenses.filter(e => {
    const d = e.date ? new Date(String(e.date).split('T')[0] + 'T00:00:00') : null;
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((s, e) => s + e.amount, 0);

  // BUG FIX: Only compute budget remaining if a budget has actually been set
  // When monthlyBudget === 0 (not set), do NOT show negative value
  const budgetLeft = monthlyBudget > 0 ? monthlyBudget - monthlyExp : null;

  animateCounter(document.getElementById('totalAmount'),     fmt(total));
  animateCounter(document.getElementById('dashTotalIncome'), fmt(totalIncome));
  animateCounter(document.getElementById('dashSavings'),     fmt(savings));

  document.getElementById('numberOfExpenses').textContent =
    `${expenses.length} transaction${expenses.length !== 1 ? 's' : ''}`;

  // Budget remaining card
  const budgetLeftEl   = document.getElementById('dashBudgetLeft');
  const budgetLeftCard = budgetLeftEl.closest('.stat-card');
  const budgetSubEl    = budgetLeftCard.querySelector('.stat-sub');

  if (budgetLeft === null) {
    // No budget set — show neutral state
    budgetLeftEl.textContent   = 'Not Set';
    budgetLeftEl.className     = 'stat-value';
    budgetLeftEl.style.color   = 'var(--text-muted)';
    budgetLeftCard.className   = 'stat-card c4';
    if (budgetSubEl) budgetSubEl.textContent = 'Set a budget first';
  } else if (budgetLeft < 0) {
    animateCounter(budgetLeftEl, fmt(budgetLeft));
    budgetLeftEl.className   = 'stat-value danger';
    budgetLeftEl.style.color = '';
    budgetLeftCard.className = 'stat-card cdanger';
    if (budgetSubEl) budgetSubEl.textContent = 'Over budget!';
  } else {
    animateCounter(budgetLeftEl, fmt(budgetLeft));
    budgetLeftEl.className   = 'stat-value green';
    budgetLeftEl.style.color = '';
    budgetLeftCard.className = 'stat-card c4';
    if (budgetSubEl) budgetSubEl.textContent = 'This month';
  }

  // Date range — BUG FIX: sort by actual date string, not JS Date (avoids timezone shift)
  const sorted = [...expenses].sort((a, b) => String(a.date) > String(b.date) ? 1 : -1);
  document.getElementById('firstExpenseDate').textContent =
    sorted.length ? fmtDate(sorted[0].date) : '—';
  document.getElementById('lastExpenseDate').textContent =
    sorted.length ? fmtDate(sorted[sorted.length-1].date) : '—';

  renderCharts();
}

/* ══════════════════════════════════════
   CHARTS
══════════════════════════════════════ */
function getChartTextColor() {
  return document.body.classList.contains('light') ? '#4b5563' : '#7a8aaa';
}
function getChartGridColor() {
  return document.body.classList.contains('light') ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
}

function renderCharts() {
  renderCategoryChart();
  renderMonthlyChart();
}

function renderCategoryChart() {
  const totals = {};
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(c => CATEGORY_COLORS[c] || '#888');

  const canvas = document.getElementById('categoryChart');
  const empty  = document.getElementById('categoryEmpty');
  if (!labels.length) {
    canvas.style.display = 'none'; empty.style.display = 'flex';
    document.getElementById('categoryList').innerHTML = ''; return;
  }
  canvas.style.display = ''; empty.style.display = 'none';
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(canvas, {
    type:'doughnut',
    data:{ labels, datasets:[{ data, backgroundColor:colors, borderWidth:2, borderColor:'transparent' }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` } } },
      animation:{ duration:600, easing:'easeOutQuart' }
    }
  });

  const list = document.getElementById('categoryList');
  list.innerHTML = '';
  const total = data.reduce((a, b) => a + b, 0);
  labels.forEach((cat, i) => {
    const pct  = total > 0 ? ((data[i]/total)*100).toFixed(1) : 0;
    const item = document.createElement('div');
    item.className = 'cat-item';
    item.innerHTML = `<div class="cat-name"><span class="cat-dot" style="background:${colors[i]}"></span>${cat}<span style="color:var(--text-muted);font-size:11px;margin-left:4px;">(${pct}%)</span></div><span class="cat-amount">${fmt(data[i])}</span>`;
    list.appendChild(item);
  });
}

function renderMonthlyChart() {
  const totals = new Array(12).fill(0);
  expenses.forEach(e => {
    // BUG FIX: parse date without timezone shift
    const dateStr = e.date ? String(e.date).split('T')[0] : null;
    if (dateStr) {
      const parts = dateStr.split('-');
      const month = parseInt(parts[1]) - 1;
      if (month >= 0 && month <= 11) totals[month] += e.amount;
    }
  });

  const canvas = document.getElementById('monthlyChart');
  const empty  = document.getElementById('monthlyEmpty');
  if (!totals.some(v => v > 0)) {
    canvas.style.display = 'none'; empty.style.display = 'flex'; return;
  }
  canvas.style.display = ''; empty.style.display = 'none';

  const textColor = getChartTextColor();
  const gridColor = getChartGridColor();
  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(canvas, {
    type:'bar',
    data:{
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets:[{ label:'Expenses (₹)', data:totals,
        backgroundColor: totals.map((_, i) => i === new Date().getMonth() ? '#63d2ff' : 'rgba(99,210,255,0.35)'),
        borderRadius:8, borderSkipped:false }]
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx => ` ${fmt(ctx.parsed.y)}` } } },
      scales:{
        x:{ grid:{ color:gridColor }, ticks:{ color:textColor, font:{ size:11 } } },
        y:{ beginAtZero:true, grid:{ color:gridColor }, ticks:{ color:textColor, callback: v => `₹${v}` } }
      },
      animation:{ duration:600, easing:'easeOutCubic' }
    }
  });
}

/* ══════════════════════════════════════
   SUMMARY + BUDGET GOALS
══════════════════════════════════════ */
function renderSummary() {
  const totalIncome   = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const savings       = totalIncome - totalExpenses;
  animateCounter(document.getElementById('summaryTotalIncome'),   fmt(totalIncome));
  animateCounter(document.getElementById('summaryTotalExpenses'), fmt(totalExpenses));
  const savingsEl = document.getElementById('summarySavings');
  animateCounter(savingsEl, fmt(savings));
  savingsEl.className = `stat-value ${savings >= 0 ? 'green' : 'danger'}`;
}

function renderBudgetGoals() {
  const now = new Date();
  const cm  = now.getMonth();
  const cy  = now.getFullYear();

  const monthlyIncome = incomeEntries
    .filter(i => { const d = i.date ? new Date(String(i.date).split('T')[0]+'T00:00:00') : null; return d && d.getMonth()===cm && d.getFullYear()===cy; })
    .reduce((s, i) => s + i.amount, 0);

  const monthlyExp = expenses
    .filter(e => { const d = e.date ? new Date(String(e.date).split('T')[0]+'T00:00:00') : null; return d && d.getMonth()===cm && d.getFullYear()===cy; })
    .reduce((s, e) => s + e.amount, 0);

  const remaining = monthlyBudget > 0 ? monthlyBudget - monthlyExp : null;
  const pct       = monthlyBudget > 0 ? Math.min((monthlyExp/monthlyBudget)*100, 100) : 0;
  const isOver    = remaining !== null && remaining < 0;

  animateCounter(document.getElementById('currentMonthlyIncome'),   fmt(monthlyIncome));
  animateCounter(document.getElementById('currentMonthlyExpenses'), fmt(monthlyExp));

  const budgetDisplayEl = document.getElementById('displayBudget');
  if (monthlyBudget > 0) {
    animateCounter(budgetDisplayEl, fmt(monthlyBudget));
  } else {
    budgetDisplayEl.textContent = 'Not Set';
    budgetDisplayEl.style.color = 'var(--text-muted)';
  }

  const remEl   = document.getElementById('budgetRemaining');
  const remCard = document.getElementById('budgetRemainingCard');
  if (remaining === null) {
    remEl.textContent   = 'Not Set';
    remEl.className     = 'stat-value';
    remEl.style.color   = 'var(--text-muted)';
    remCard.className   = 'stat-card c4';
  } else {
    remEl.style.color   = '';
    animateCounter(remEl, fmt(remaining));
    remEl.className   = `stat-value ${isOver ? 'danger' : 'green'}`;
    remCard.className = `stat-card ${isOver ? 'cdanger' : 'c4'}`;
  }

  const fill = document.getElementById('budgetBarFill');
  fill.style.width = `${pct}%`;
  fill.className   = `budget-bar-fill${isOver ? ' over' : ''}`;
  document.getElementById('budgetUsedPct').textContent = `${pct.toFixed(1)}% used${isOver ? ' ⚠️ Over budget!' : ''}`;
  document.getElementById('budgetUsedAmt').textContent = `${fmt(monthlyExp)} / ${fmt(monthlyBudget)}`;

  if (isOver) showToast('⚠️ You have exceeded your monthly budget!', 'warning', 5000);
}

/* ══════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════ */
function renderProfilePage() {
  const fullName = localStorage.getItem('fullName') || '—';
  const email    = localStorage.getItem('email')    || '—';

  // Hero card
  const el = (id) => document.getElementById(id);
  if (el('profileHeroName'))  el('profileHeroName').textContent  = fullName;
  if (el('profileHeroEmail')) el('profileHeroEmail').textContent = email;

  // Stats
  const totalIncome   = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const savings       = totalIncome - totalExpenses;
  if (el('profileTotalIncome'))   animateCounter(el('profileTotalIncome'),   fmt(totalIncome));
  if (el('profileTotalExpenses')) animateCounter(el('profileTotalExpenses'), fmt(totalExpenses));
  if (el('profileSavings')) {
    animateCounter(el('profileSavings'), fmt(savings));
    el('profileSavings').className = `stat-value ${savings >= 0 ? 'green' : 'danger'}`;
  }
  if (el('profileTxCount')) el('profileTxCount').textContent = expenses.length + incomeEntries.length;

  // Details
  if (el('profileDetailName'))  el('profileDetailName').textContent  = fullName;
  if (el('profileDetailEmail')) el('profileDetailEmail').textContent = email;
  if (el('profileMemberSince')) {
    // Show today as "member since" approximation (actual join date would come from backend)
    el('profileMemberSince').textContent = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' });
  }
  if (el('profileBudget')) {
    el('profileBudget').textContent = monthlyBudget > 0 ? fmt(monthlyBudget) + ' / month' : 'Not set';
  }

  // Avatar
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    setAvatarImage(savedAvatar);
  } else {
    const initial = fullName.charAt(0).toUpperCase();
    if (el('profileAvatarLg')) el('profileAvatarLg').textContent = initial;
    if (el('removeAvatarBtn')) el('removeAvatarBtn').style.display = 'none';
  }
}

/* ══════════════════════════════════════
   SETTINGS
══════════════════════════════════════ */
function renderSettings() {
  const fullName = localStorage.getItem('fullName') || '—';
  const email    = localStorage.getItem('email')    || '—';
  document.getElementById('userFullName').textContent = fullName;
  document.getElementById('userEmail').textContent    = email;
  document.getElementById('profileName').textContent  = fullName;
  document.getElementById('profileEmail').textContent = email;

  // Set initials on profile avatar (if no uploaded image)
  const savedAvatar = localStorage.getItem('userAvatar');
  if (!savedAvatar) {
    document.getElementById('profileAvatar').textContent = fullName.charAt(0).toUpperCase();
  }

  const isLight = document.body.classList.contains('light');
  const lbl = document.getElementById('themeSettingLabel');
  if (lbl) lbl.textContent = isLight ? 'Switch to Dark' : 'Switch to Light';
}