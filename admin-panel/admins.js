// ══════════════════════════════════════════
//  MANAGE ADMINS MODULE
// ══════════════════════════════════════════

const ASSIGNABLE = [
  { role:'cafeteria_admin', label:'Cafeteria Admin', color:'var(--accent3)', bg:'rgba(245,158,11,0.15)' },
  { role:'library_admin',   label:'Library Admin',   color:'var(--accent)',  bg:'rgba(124,58,237,0.15)' },
  { role:'super_admin',     label:'Super Admin',     color:'var(--danger)',  bg:'rgba(239,68,68,0.15)'  },
  { role:'student',         label:'Revoke (Student)',color:'var(--muted)',   bg:'rgba(107,107,138,0.15)' },
];

async function loadAdmins() {
  const el = $('adminsList');
  const empty = $('adminsEmpty');
  el.innerHTML = `<div class="skeleton-line"></div><div class="skeleton-line" style="width:70%;margin-top:10px;"></div>`;
  try {
    const snap = await db.collection('users')
      .where('role','in',['cafeteria_admin','library_admin','super_admin'])
      .get();

    if (snap.empty) { el.innerHTML = ''; empty.style.display = ''; return; }
    empty.style.display = 'none';
    el.innerHTML = snap.docs.map(d => {
      const u = { uid: d.id, ...d.data() };
      return renderAdminUserCard(u);
    }).join('');
  } catch(e) {
    el.innerHTML = `<p style="color:var(--danger)">${e.message}</p>`;
  }
}

async function searchAdminUser() {
  const roll = $('adminSearchInput').value.trim().toUpperCase();
  const resultEl = $('adminSearchResult');
  if (!roll) return;

  resultEl.innerHTML = `<div class="skeleton-line"></div>`;
  try {
    const email = rollToEmail(roll);
    const snap = await db.collection('users').where('email','==', email).limit(1).get();
    if (snap.empty) {
      resultEl.innerHTML = `
        <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:14px 18px;">
          <span style="color:var(--danger);font-size:14px;">No user found with roll number <strong>${escHtml(roll)}</strong></span>
        </div>`;
      return;
    }
    const d = snap.docs[0];
    const u = { uid: d.id, ...d.data() };
    resultEl.innerHTML = `
      <div style="margin-bottom:8px;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Search Result</div>
      ${renderAdminUserCard(u)}`;
  } catch(e) {
    resultEl.innerHTML = `<p style="color:var(--danger);font-size:13px;">${e.message}</p>`;
  }
}

function renderAdminUserCard(u) {
  const roleLabel = { super_admin:'Super Admin', cafeteria_admin:'Cafeteria Admin', library_admin:'Library Admin', student:'Student' };
  const roleCls   = { super_admin:'role-super_admin', cafeteria_admin:'role-cafeteria_admin', library_admin:'role-library_admin', student:'role-student' };
  const initials  = (u.alias || u.email || 'U').slice(0,2).toUpperCase();

  const assignBtns = ASSIGNABLE
    .filter(r => r.role !== u.role)
    .map(r => `
      <button class="role-assign-btn" 
        style="color:${r.color};border-color:${r.color};background:${r.bg};"
        onclick="assignRole('${u.uid}','${r.role}','${escHtml(u.alias||u.email||u.uid)}')">
        ${r.label}
      </button>`).join('');

  return `
    <div class="admin-user-card" id="user-card-${u.uid}">
      <div class="avatar" style="width:44px;height:44px;font-size:15px;">${initials}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-size:15px;font-weight:600;">${escHtml(u.alias || u.email || u.uid)}</span>
          <span class="admin-role-chip ${roleCls[u.role]||'role-student'}">${roleLabel[u.role]||u.role}</span>
        </div>
        ${u.email ? `<div style="font-size:12px;color:var(--muted);margin-top:4px;">${escHtml(u.email)}</div>` : ''}
        <div class="role-buttons">${assignBtns}</div>
      </div>
    </div>`;
}

async function assignRole(uid, newRole, displayName) {
  const roleLabel = { super_admin:'Super Admin', cafeteria_admin:'Cafeteria Admin', library_admin:'Library Admin', student:'Revoke (Student)' };
  $('confirmTitle').textContent = 'Confirm Role Change';
  $('confirmMsg').textContent   = `Assign "${roleLabel[newRole]}" to ${displayName}?`;
  $('confirmOkBtn').textContent = 'Confirm';
  $('confirmOkBtn').onclick     = async () => {
    closeConfirm();
    try {
      const now = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('users').doc(uid).update({ role: newRole });
      await db.collection('admin_roles').doc(uid).set({
        role: newRole,
        grantedBy: currentUser.uid,
        grantedAt: now
      });
      showToast(`Role updated to "${roleLabel[newRole]}".`, 'success');
      loadAdmins();
      // Re-render search result if visible
      const resultEl = $('adminSearchResult');
      if (resultEl.innerHTML.includes(uid)) searchAdminUser();
    } catch(e) { showToast(e.message, 'error'); }
  };
  $('confirmModal').classList.add('open');
}


// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════

function loadDashboard() {
  updateDashboardStats();
}

function updateDashboardStats() {
  // Menu stats
  const total = menuItems.length;
  const avail = menuItems.filter(i => i.available).length;
  $('statMenuVal').textContent   = total;
  $('statMenuCount').textContent = `${avail} available`;

  // Library stats
  const ltotal = libraryItems.length;
  const lavail = libraryItems.filter(i => i.available).length;
  $('statLibVal').textContent   = ltotal;
  $('statLibCount').textContent = `${lavail} available`;

  // Recent menu items
  const recent = [...menuItems].slice(0, 5);
  $('recentMenuList').innerHTML = recent.length === 0
    ? `<p style="color:var(--muted);font-size:13px;">No items yet.</p>`
    : recent.map(item => `
        <div class="recent-item" onclick="switchScreen('cafeteria', document.querySelector('[data-screen=cafeteria]'))">
          <div class="recent-item-emoji" style="background:${catBg(item.category)}">${CAT_EMOJI[item.category]||'🍴'}</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;">${escHtml(item.name)}</div>
            <div style="font-size:12px;color:var(--muted);">₹${Number(item.price).toFixed(2)} · ${item.category}</div>
          </div>
          <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:${item.available?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.12)'};color:${item.available?'var(--accent4)':'var(--danger)'}">
            ${item.available?'Available':'Unavailable'}
          </span>
        </div>`).join('');

  // Admin count (super_admin only)
  if (currentRole === 'super_admin') {
    db.collection('users')
      .where('role','in',['cafeteria_admin','library_admin','super_admin'])
      .get().then(s => {
        $('statAdminVal').textContent = s.size;
        $('statAdminCount').textContent = s.size + ' total';
      }).catch(() => {});
  }
}
