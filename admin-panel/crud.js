// ══════════════════════════════════════════
//  CAFETERIA MODULE
// ══════════════════════════════════════════

const CAT_EMOJI = { breakfast:'🌅', lunch:'☀️', snack:'🍿', dinner:'🌙', drinks:'🧃' };
const CATEGORIES = ['breakfast','lunch','snack','dinner','drinks'];

function startMenuListener() {
  if (menuUnsub) menuUnsub();
  menuUnsub = db.collection('cafeteria_menu')
    .orderBy('createdAt','desc')
    .onSnapshot(snap => {
      menuItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderMenu();
      updateDashboardStats();
    }, () => {});
}

function setCafFilter(val, el) {
  cafFilter = val;
  document.querySelectorAll('#screen-cafeteria .lf-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderMenu();
}

function renderMenu() {
  const list = cafFilter === 'all' ? menuItems : menuItems.filter(i => i.category === cafFilter);
  const grid = $('cafeteriaGrid');
  const empty = $('cafeteriaEmpty');

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map(item => `
    <div class="food-card">
      <div class="food-img" style="background:${catBg(item.category)};">
        ${CAT_EMOJI[item.category] || '🍴'}
        <span class="food-avail ${item.available ? 'avail-yes' : 'avail-no'}">
          ${item.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <div class="food-info">
        <div class="food-name">${escHtml(item.name)}</div>
        <div class="food-price">₹${Number(item.price).toFixed(2)}</div>
        <div class="food-cat">${CAT_EMOJI[item.category] || ''} ${item.category}${item.description ? ' · ' + escHtml(item.description).slice(0,40) : ''}</div>
        <div class="food-actions">
          <button class="food-btn food-btn-edit"   onclick="openMenuModal('${item.id}')">✏️ Edit</button>
          <button class="food-btn food-btn-delete" onclick="confirmDeleteMenu('${item.id}','${escHtml(item.name)}')">🗑️</button>
        </div>
      </div>
    </div>`).join('');
}

function catBg(cat) {
  const m = { breakfast:'rgba(245,158,11,0.12)', lunch:'rgba(6,182,212,0.12)',
    snack:'rgba(124,58,237,0.12)', dinner:'rgba(16,185,129,0.12)', drinks:'rgba(239,68,68,0.12)' };
  return m[cat] || 'var(--surface2)';
}

function openMenuModal(id) {
  const item = id ? menuItems.find(i => i.id === id) : null;
  editingId = id || null;
  modalMode = id ? 'edit-menu' : 'add-menu';
  $('modalTitle').textContent = id ? 'Edit Menu Item' : 'Add Menu Item';

  const selCat = item?.category || 'lunch';
  $('modalBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Name *</label>
      <input id="mName" class="input" type="text" placeholder="e.g. Paneer Butter Masala" value="${escHtml(item?.name||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Price (₹) *</label>
      <input id="mPrice" class="input" type="number" min="0" placeholder="0" value="${item?.price||''}">
    </div>
    <div class="form-group">
      <label class="form-label">Category *</label>
      <div class="chip-group">
        ${CATEGORIES.map(c=>`<div class="chip${c===selCat?' selected':''}" data-cat="${c}" onclick="selectChip(this,'cat')">${CAT_EMOJI[c]} ${c}</div>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea id="mDesc" class="input" placeholder="Short description…">${escHtml(item?.description||'')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Available</label>
      <div class="toggle-row">
        <label class="toggle"><input type="checkbox" id="mAvail" ${item?.available !== false ? 'checked' : ''}><span class="toggle-slider"></span></label>
        <span style="font-size:13px;color:var(--muted);">Show as available in app</span>
      </div>
    </div>`;
  $('itemModal').classList.add('open');
  setTimeout(() => $('mName').focus(), 100);
}

function confirmDeleteMenu(id, name) {
  $('confirmTitle').textContent = 'Delete Menu Item';
  $('confirmMsg').textContent = `Remove "${name}" from the menu? This cannot be undone.`;
  $('confirmOkBtn').onclick = () => { closeConfirm(); deleteMenu(id); };
  $('confirmModal').classList.add('open');
}

async function deleteMenu(id) {
  try {
    await db.collection('cafeteria_menu').doc(id).delete();
    showToast('Menu item deleted.', 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

// ══════════════════════════════════════════
//  LIBRARY MODULE
// ══════════════════════════════════════════

const TYPE_EMOJI  = { book:'📖', pdf:'📄', journal:'📰', announcement:'📣' };
const TYPE_COLOR  = { book:'var(--accent)', pdf:'var(--accent2)', journal:'var(--accent4)', announcement:'var(--accent3)' };
const TYPE_BG     = { book:'rgba(124,58,237,0.15)', pdf:'rgba(6,182,212,0.15)', journal:'rgba(16,185,129,0.15)', announcement:'rgba(245,158,11,0.15)' };
const LIB_TYPES   = ['book','pdf','journal','announcement'];

function startLibListener() {
  if (libUnsub) libUnsub();
  libUnsub = db.collection('library')
    .orderBy('addedAt','desc')
    .onSnapshot(snap => {
      libraryItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderLibrary();
      updateDashboardStats();
    }, () => {});
}

function setLibFilter(val, el) {
  libFilter = val;
  document.querySelectorAll('#screen-library .lf-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderLibrary();
}

function renderLibrary() {
  const list = libFilter === 'all' ? libraryItems : libraryItems.filter(i => i.type === libFilter);
  const el = $('libraryList');
  const empty = $('libraryEmpty');

  if (list.length === 0) { el.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  el.innerHTML = list.map(item => `
    <div class="lib-item">
      <div class="lib-emoji" style="background:${TYPE_BG[item.type]}">${TYPE_EMOJI[item.type]||'📄'}</div>
      <div class="lib-info">
        <div class="lib-title">${escHtml(item.title)}</div>
        <div class="lib-meta">${item.author ? escHtml(item.author)+' · ' : ''}${item.type}</div>
        ${item.description ? `<div class="lib-desc">${escHtml(item.description)}</div>` : ''}
        <span class="lib-badge" style="background:${TYPE_BG[item.type]};color:${TYPE_COLOR[item.type]}">
          ${TYPE_EMOJI[item.type]} ${item.type}
        </span>
        ${!item.available ? `<span class="lib-badge" style="background:rgba(239,68,68,0.12);color:var(--danger);margin-left:6px;">Unavailable</span>` : ''}
      </div>
      <div class="lib-actions">
        <button class="lib-btn lib-btn-edit"   onclick="openLibModal('${item.id}')">✏️ Edit</button>
        <button class="lib-btn lib-btn-delete" onclick="confirmDeleteLib('${item.id}','${escHtml(item.title)}')">🗑️ Delete</button>
      </div>
    </div>`).join('');
}

function openLibModal(id) {
  const item = id ? libraryItems.find(i => i.id === id) : null;
  editingId = id || null;
  modalMode = id ? 'edit-lib' : 'add-lib';
  $('modalTitle').textContent = id ? 'Edit Resource' : 'Add Library Resource';
  const selType = item?.type || 'book';

  $('modalBody').innerHTML = `
    <div class="form-group">
      <label class="form-label">Title *</label>
      <input id="lTitle" class="input" type="text" placeholder="e.g. Introduction to Algorithms" value="${escHtml(item?.title||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Type *</label>
      <div class="chip-group">
        ${LIB_TYPES.map(t=>`<div class="chip${t===selType?' selected':''}" data-cat="${t}" onclick="selectChip(this,'cat')">${TYPE_EMOJI[t]} ${t}</div>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Author / Source</label>
      <input id="lAuthor" class="input" type="text" placeholder="Author name" value="${escHtml(item?.author||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea id="lDesc" class="input" placeholder="Short description…">${escHtml(item?.description||'')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Available</label>
      <div class="toggle-row">
        <label class="toggle"><input type="checkbox" id="lAvail" ${item?.available !== false ? 'checked' : ''}><span class="toggle-slider"></span></label>
        <span style="font-size:13px;color:var(--muted);">Show as available</span>
      </div>
    </div>`;
  $('itemModal').classList.add('open');
  setTimeout(() => $('lTitle').focus(), 100);
}

function confirmDeleteLib(id, title) {
  $('confirmTitle').textContent = 'Delete Resource';
  $('confirmMsg').textContent = `Remove "${title}"? This cannot be undone.`;
  $('confirmOkBtn').onclick = () => { closeConfirm(); deleteLib(id); };
  $('confirmModal').classList.add('open');
}

async function deleteLib(id) {
  try {
    await db.collection('library').doc(id).delete();
    showToast('Resource deleted.', 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

// ── SHARED CHIP SELECTOR ──
function selectChip(el, group) {
  el.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ── MODAL SAVE DISPATCHER ──
async function handleModalSave() {
  const btn = $('modalSaveBtn');
  btn.textContent = 'Saving…'; btn.disabled = true;
  try {
    if (modalMode === 'add-menu' || modalMode === 'edit-menu') await saveMenuItem();
    else if (modalMode === 'add-lib' || modalMode === 'edit-lib') await saveLibItem();
    closeModal();
    showToast('Saved successfully!', 'success');
  } catch(e) {
    showToast(e.message || 'Save failed.', 'error');
  } finally {
    btn.textContent = 'Save'; btn.disabled = false;
  }
}

async function saveMenuItem() {
  const name  = $('mName').value.trim();
  const price = parseFloat($('mPrice').value);
  const catEl = document.querySelector('#modalBody .chip.selected[data-cat]');
  if (!name) throw new Error('Name is required.');
  if (isNaN(price) || price < 0) throw new Error('Enter a valid price.');
  const category = catEl ? catEl.dataset.cat : 'lunch';
  const available = $('mAvail').checked;
  const description = $('mDesc').value.trim() || null;
  const now = firebase.firestore.FieldValue.serverTimestamp();
  const payload = { name, price, category, available, description, updatedAt: now };

  if (editingId) {
    await db.collection('cafeteria_menu').doc(editingId).update(payload);
  } else {
    await db.collection('cafeteria_menu').add({ ...payload, createdAt: now });
  }
}

async function saveLibItem() {
  const title  = $('lTitle').value.trim();
  const typeEl = document.querySelector('#modalBody .chip.selected[data-cat]');
  if (!title) throw new Error('Title is required.');
  const type        = typeEl ? typeEl.dataset.cat : 'book';
  const author      = $('lAuthor').value.trim() || null;
  const description = $('lDesc').value.trim()  || null;
  const available   = $('lAvail').checked;
  const now = firebase.firestore.FieldValue.serverTimestamp();
  const payload = { title, type, author, description, available, updatedAt: now };

  if (editingId) {
    await db.collection('library').doc(editingId).update(payload);
  } else {
    await db.collection('library').add({ ...payload, addedAt: now });
  }
}

// ── UTIL ──
function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
