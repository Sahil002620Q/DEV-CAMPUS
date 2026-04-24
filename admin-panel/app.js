// ── STATE ──
let currentUser = null;
let currentRole = 'student';
let currentScreen = 'dashboard';
let menuItems = [];
let libraryItems = [];
let cafFilter = 'all';
let libFilter = 'all';
let modalMode = null; // 'add-menu' | 'edit-menu' | 'add-lib' | 'edit-lib'
let editingId = null;
let menuUnsub = null;
let libUnsub = null;

// ── HELPERS ──
function rollToEmail(roll) {
  return roll.replace(/\s+/g,'').toLowerCase() + '@campus.local';
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, 3200);
}

function $(id) { return document.getElementById(id); }

// ── AUTH ──
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    await loadUserRole(user.uid);
    showApp();
  } else {
    currentUser = null;
    currentRole = 'student';
    showLogin();
  }
});

async function loadUserRole(uid) {
  try {
    const snap = await db.collection('user').doc(uid).get();
    currentRole = snap.exists ? (snap.data().role || 'student') : 'student';
  } catch { currentRole = 'student'; }
}

async function handleLogin() {
  const emailRaw = $('loginRoll').value.trim().toLowerCase();
  const pass     = $('loginPassword').value;
  const errEl    = $('loginError');
  const btn      = document.querySelector('.login-card .btn');

  errEl.style.display = 'none';
  if (!emailRaw || pass.length < 4) {
    errEl.textContent = 'Enter your admin email and password (min 4 chars).';
    errEl.style.display = 'block'; return;
  }

  // Accept either a full email OR a roll number (auto-append domain)
  const email = emailRaw.includes('@') ? emailRaw : rollToEmail(emailRaw.toUpperCase());

  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (e) {
    errEl.textContent = e.message || 'Sign in failed. Check your credentials.';
    errEl.style.display = 'block';
    btn.textContent = 'Sign In →'; btn.disabled = false;
  }
}

function handleSignOut() {
  if (menuUnsub) menuUnsub();
  if (libUnsub) libUnsub();
  auth.signOut();
}

// ── SHOW / HIDE ──
function showLogin() {
  $('loginScreen').style.display = 'flex';
  $('appShell').style.display = 'none';
  $('loginRoll').value = '';
  $('loginPassword').value = '';
  const btn = document.querySelector('.login-card .btn');
  if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }
}

function showApp() {
  $('loginScreen').style.display = 'none';
  $('appShell').style.display = 'flex';
  applyRoleVisibility();
  loadDashboard();
  startMenuListener();
  startLibListener();
  $('sidebarName').textContent = currentUser.email?.split('@')[0]?.toUpperCase() || '—';
  $('sidebarAvatar').textContent = (currentUser.email || 'A').slice(0,2).toUpperCase();
  const roleLabels = { super_admin:'Super Admin', cafeteria_admin:'Cafeteria Admin', library_admin:'Library Admin', student:'Student' };
  $('sidebarRole').textContent = roleLabels[currentRole] || currentRole;
}

function applyRoleVisibility() {
  const isSuper = currentRole === 'super_admin';
  const isCaf   = currentRole === 'cafeteria_admin' || isSuper;
  const isLib   = currentRole === 'library_admin'   || isSuper;

  $('cafNavLabel').style.display  = isCaf ? '' : 'none';
  $('cafNavItem').style.display   = isCaf ? '' : 'none';
  $('libNavLabel').style.display  = isLib ? '' : 'none';
  $('libNavItem').style.display   = isLib ? '' : 'none';
  $('adminNavLabel').style.display = isSuper ? '' : 'none';
  $('adminNavItem').style.display  = isSuper ? '' : 'none';
  $('statAdminCard').style.display = isSuper ? '' : 'none';

  // Build quick cards
  const cards = [];
  if (isCaf) cards.push({ emoji:'🍽️', label:'Cafeteria Menu', screen:'cafeteria', cls:'c-amber' });
  if (isLib) cards.push({ emoji:'📚', label:'Library',        screen:'library',   cls:'c-purple' });
  if (isSuper) cards.push({ emoji:'👤', label:'Manage Admins', screen:'admins',  cls:'c-cyan' });
  const qc = $('quickCards');
  qc.innerHTML = cards.map(c => `
    <div class="quick-card" onclick="switchScreen('${c.screen}', document.querySelector('[data-screen=${c.screen}]'))">
      <div class="stat-icon ${c.cls}" style="width:52px;height:52px;font-size:24px;border-radius:14px;">${c.emoji}</div>
      <div style="font-size:13px;font-weight:600;">${c.label}</div>
    </div>`).join('');
}

// ── NAVIGATION ──
function switchScreen(name, el) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const s = $('screen-' + name);
  if (s) s.classList.add('active');
  if (el) el.classList.add('active');
  currentScreen = name;

  const titles = { dashboard:'Dashboard', cafeteria:'Cafeteria Menu', library:'Library Resources', admins:'Manage Admins' };
  $('topbarTitle').textContent = titles[name] || name;

  const showAdd = name === 'cafeteria' || name === 'library';
  $('addBtn').style.display = showAdd ? 'flex' : 'none';

  if (name === 'admins') loadAdmins();
}

function openAddModal() {
  if (currentScreen === 'cafeteria') openMenuModal(null);
  else if (currentScreen === 'library') openLibModal(null);
}

function closeModal() {
  $('itemModal').classList.remove('open');
  editingId = null; modalMode = null;
}

function closeConfirm() { $('confirmModal').classList.remove('open'); }

// Close modals on overlay click
$('itemModal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
$('confirmModal').addEventListener('click', function(e) { if (e.target === this) closeConfirm(); });
