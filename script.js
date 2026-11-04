/* =========================================================
   CASEFILE — Main script
   Milestone 4: save-slot aware boot, cutscene integration,
   menu dispatch, agency rendering.
   ========================================================= */

'use strict';
/* Expose the case data globals on window so case_ui.js can swap them.
   Top-level consts are not on window by default (same issue we hit
   with gameState), so we assign them explicitly. */
window.CASE_DATA = typeof CASE_DATA !== 'undefined' ? CASE_DATA : window.CASE_DATA;
window.CASE_DATA_002 = typeof CASE_DATA_002 !== 'undefined' ? CASE_DATA_002 : window.CASE_DATA_002;

/* ---------------------------------------------------------
   1. DEFAULT STATE FOR A FRESH SAVE
   --------------------------------------------------------- */

function createDefaultState() {
  return {
    money: 450,
    reputation: 5,
    experience: 0,
    agencyLevel: 1,

    activeCases: [],
    completedCases: [],
    ownedUpgrades: [],

    clues: [],
    employees: [],
    contacts: [],

    // NEW: the cases map. Every save starts with an empty map.
    cases: {},

    cutsceneSeen: false,
    lastSaved: null
  };
}

/* ---------------------------------------------------------
   2. LIVE GAME STATE (projection of current save)
   --------------------------------------------------------- */

let gameState = createDefaultState();

// Expose gameState on window so other modules (case_ui.js, etc.)
// can read/write it. Getter/setter keeps window.gameState pointing
// at the live object even after gameState is reassigned by
// loadGameStateFromSave().
Object.defineProperty(window, 'gameState', {
  get() { return gameState; },
  set(v) { gameState = v; }
});

function loadGameStateFromSave(save) {
  const base = createDefaultState();
  gameState = Object.assign(base, save.state || {});
  if (!gameState.cases) gameState.cases = {};
}

function saveGameStateIntoCurrentSlot() {
  const id = SaveManager.getCurrentSaveId();
  if (!id) return;
  gameState.lastSaved = new Date().toISOString();
  SaveManager.saveState(gameState, id);
  flashSaveIndicator();
}

let saveIndicatorTimer = null;
function flashSaveIndicator() {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  el.classList.add('visible');
  if (saveIndicatorTimer) clearTimeout(saveIndicatorTimer);
  saveIndicatorTimer = setTimeout(() => el.classList.remove('visible'), 1400);
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveGameStateIntoCurrentSlot, 350);
}

window.addEventListener('pagehide', saveGameStateIntoCurrentSlot);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveGameStateIntoCurrentSlot();
});

/* ---------------------------------------------------------
   3. RENDERING
   --------------------------------------------------------- */

function renderStatusBar() {
  document.getElementById('stat-money').textContent = `$${gameState.money}`;
  document.getElementById('stat-reputation').textContent = gameState.reputation;
  document.getElementById('stat-level').textContent = gameState.agencyLevel;
  if (typeof updateCasesBadge === 'function') updateCasesBadge();
}

function renderAgencyScreen() {
  document.getElementById('active-case-count').textContent    = gameState.activeCases.length;
  document.getElementById('completed-case-count').textContent = gameState.completedCases.length;
}

function renderAll() {
  renderStatusBar();
  
  // Call the new Agency rendering
  if (typeof Agency !== 'undefined' && typeof Agency.renderAgencyScreen === 'function') {
    Agency.renderAgencyScreen();
  }
}

/* ---------------------------------------------------------
   4. NAVIGATION
   --------------------------------------------------------- */

function showScreen(name) {
  const target = document.querySelector(`.screen[data-screen="${name}"]`);
  if (!target) { console.warn('[Nav] Unknown screen:', name); return; }

  document.querySelectorAll('.screen').forEach((el) =>
    el.classList.toggle('active', el === target));
  document.querySelectorAll('.nav-btn').forEach((btn) =>
    btn.classList.toggle('active', btn.dataset.target === name));

  // The cutscene is the only screen that hides the app chrome.
  document.body.classList.toggle('in-cutscene', name === 'cutscene');

  document.getElementById('screens').scrollIntoView({ block: 'start' });
}

function bindNavigation() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof Sounds !== 'undefined') Sounds.click();   // ← ADD THIS LINE

      const target = btn.dataset.target;

      if (document.body.classList.contains('no-active-game')) return;

      if (target === 'notebook') {
        if (typeof CaseBoard !== 'undefined' && typeof CaseBoard.open === 'function') {
          CaseBoard.open();
        } else {
          showScreen('notebook');
        }
      } else if (target === 'people') {
        showScreen('people');
        if (typeof PeopleUI !== 'undefined' && typeof PeopleUI.render === 'function') {
          PeopleUI.render();
        }
      } else if (target === 'progress') {
        showScreen('progress');
        if (typeof ProgressUI !== 'undefined' && typeof ProgressUI.render === 'function') {
          ProgressUI.render();
        }
        // Detect newly unlocked achievements and show toasts
const STORAGE_KEY = 'casefile_seen_achievements';
let seen = [];
try { seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}

ACHIEVEMENTS.forEach((a) => {
  if (a.check(gameState) && !seen.includes(a.id)) {
    if (typeof window.CASEFILE_showToast === 'function') {
      window.CASEFILE_showToast('Achievement Unlocked', a.name);
    }
    seen.push(a.id);
  }
});
localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
      } else {
        showScreen(target);
      }
    });
  });
}

/* ---------------------------------------------------------
   5. CUTSCENE BRIDGE
   Runs the cinematic for the current save, marks
   cutsceneSeen on completion, and lands on agency.
   --------------------------------------------------------- */

function runOpeningCutscene() {
  // Ensure we're on the cutscene screen before starting the
  // controller so panel #1 renders against a visible stage.
  showScreen('cutscene');

  Cutscene.start(() => {
    gameState.cutsceneSeen = true;
    saveGameStateIntoCurrentSlot();
    showScreen('agency');
    renderAll();
  });
}

/* ---------------------------------------------------------
   6. NEW GAME FLOW
   Creates a slot, loads it, and immediately runs the cutscene.
   The agency screen is never shown between creation and cutscene.
   --------------------------------------------------------- */

function createNewGameAndStart() {
  const fresh = createDefaultState();
  const result = SaveManager.createSave(null, fresh);
  if (result.error) {
    alert(result.error);
    return;
  }
  const slot = SaveManager.getSave(result.id);
  loadGameStateFromSave(slot);
  renderAll();
    document.body.classList.remove('no-active-game');
  runOpeningCutscene();
}

/* ---------------------------------------------------------
   7. LOAD EXISTING SAVE
   Routes to cutscene if not yet seen, otherwise agency.
   --------------------------------------------------------- */

function loadSaveAndEnter(id) {
  const slot = SaveManager.getSave(id);
  if (!slot) { console.warn('[Load] Slot not found:', id); return; }
  SaveManager.setCurrentSave(id);
  loadGameStateFromSave(slot);
  renderAll();
    document.body.classList.remove('no-active-game');
  if (slot.state && slot.state.cutsceneSeen) {
    showScreen('agency');
  } else {
    runOpeningCutscene();
  }
}

/* ---------------------------------------------------------
   8. SAVES SCREEN
   --------------------------------------------------------- */

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderSavesList() {
  const list = document.getElementById('saves-list');
  if (!list) return;
  list.innerHTML = '';

  const saves = SaveManager.listSaves();
  const currentId = SaveManager.getCurrentSaveId();

  if (saves.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'saves-empty';
    empty.textContent = 'No saves yet. Create one from the menu.';
    list.appendChild(empty);
    return;
  }

  saves.forEach((slot) => {
    const st = slot.state || {};
    const el = document.createElement('div');
    el.className = 'save-slot' + (slot.id === currentId ? ' current' : '');

    const head = document.createElement('div');
    head.className = 'save-slot-head';
    head.innerHTML = `
      <span class="save-slot-name">${escapeHTML(slot.name || 'Save')}</span>
      ${slot.id === currentId ? '<span class="save-slot-badge">Active</span>' : ''}
    `;

    const meta = document.createElement('div');
    meta.className = 'save-slot-meta';
    meta.innerHTML = `
      <span>Level <strong>${st.agencyLevel ?? 1}</strong></span>
      <span>Funds <strong>$${st.money ?? 0}</strong></span>
      <span>Active <strong>${(st.activeCases || []).length}</strong></span>
      <span>Completed <strong>${(st.completedCases || []).length}</strong></span>
      <span style="grid-column: 1 / -1;">Last played <strong>${formatDate(slot.updatedAt)}</strong></span>
    `;

    const actions = document.createElement('div');
    actions.className = 'save-slot-actions';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'slot-btn primary';
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => {
      loadSaveAndEnter(slot.id);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'slot-btn danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => confirmDeleteSave(slot.id, slot.name));

    actions.appendChild(loadBtn);
    actions.appendChild(delBtn);

    el.appendChild(head);
    el.appendChild(meta);
    el.appendChild(actions);
    list.appendChild(el);
  });
}

/* ---------------------------------------------------------
   9. MODALS
   --------------------------------------------------------- */

function confirmNewGame() {
  const hasSaves = SaveManager.listSaves().length > 0;
  const textEl = document.getElementById('newgame-modal-text');
  textEl.textContent = hasSaves
    ? 'A new save slot will be created and the opening story will begin. Your existing saves will not be affected.'
    : 'A new save slot will be created and the opening story will begin.';
  document.getElementById('newgame-modal').hidden = false;
}

function closeNewGameModal() {
  document.getElementById('newgame-modal').hidden = true;
}

let pendingDeleteId = null;
function confirmDeleteSave(id, name) {
  pendingDeleteId = id;
  document.getElementById('delete-modal-text').textContent =
    `"${name || 'This save'}" will be permanently removed. This cannot be undone.`;
  document.getElementById('delete-modal').hidden = false;
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('delete-modal').hidden = true;
}

/* ---------------------------------------------------------
   10. UTIL
   --------------------------------------------------------- */

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* ---------------------------------------------------------
   11. MENU ACTION DISPATCHER (called by menu.js)
   --------------------------------------------------------- */

window.CASEFILE_handleMenuAction = function (action) {
  switch (action) {
    case 'saves':
      renderSavesList();
      showScreen('saves');
      break;
    case 'new-game':
      confirmNewGame();
      break;
    case 'about':
      document.getElementById('about-modal').hidden = false;
      break;
    case 'settings':
      alert('Settings will be available in a future update.');
      break;
    case 'support':
      document.getElementById('support-modal').hidden = false;
      break;
    default:
      console.info('[Menu] Unhandled action:', action);
  }
};

/* ---------------------------------------------------------
   12. WIRING
   --------------------------------------------------------- */

function bindModalControls() {
  document.getElementById('newgame-cancel').addEventListener('click', closeNewGameModal);
  document.getElementById('newgame-confirm').addEventListener('click', () => {
    closeNewGameModal();
    createNewGameAndStart();
  });

  document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm').addEventListener('click', () => {
    // ... existing delete logic ...
  });

  document.getElementById('saves-back').addEventListener('click', () => {
    // ... existing saves-back logic ...
  });

    const newSlotBtn = document.getElementById('saves-new');
  if (newSlotBtn) {
    newSlotBtn.addEventListener('click', () => {
      if (typeof confirmNewGame === 'function') {
        confirmNewGame();
      } else {
        alert('New Game function is missing!');
      }
    });
  }

  // ... other existing listeners ...

  ['newgame-modal', 'delete-modal', 'modal-backdrop'].forEach((id) => {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        if (id === 'newgame-modal')   closeNewGameModal();
        if (id === 'delete-modal')    closeDeleteModal();
        if (id === 'modal-backdrop')  document.getElementById('modal-backdrop').hidden = true;
      }
    });
    const supportCancel = document.getElementById('support-cancel');
if (supportCancel) {
  supportCancel.addEventListener('click', () => {
    document.getElementById('support-modal').hidden = true;
  });
}

const supportOpen = document.getElementById('support-open');
if (supportOpen) {
  supportOpen.addEventListener('click', () => {
    window.open('https://ko-fi.com/gamesbyapple', '_blank');
    document.getElementById('support-modal').hidden = true;
  });
}
  });

  // === NEW: About modal wiring ===
  const aboutClose = document.getElementById('about-close');
  if (aboutClose) {
    aboutClose.addEventListener('click', () => {
      document.getElementById('about-modal').hidden = true;
    });
  }

  const aboutBackdrop = document.getElementById('about-modal');
  if (aboutBackdrop) {
    aboutBackdrop.addEventListener('click', (e) => {
      if (e.target === aboutBackdrop) aboutBackdrop.hidden = true;
    });
  }
}

/* ---------------------------------------------------------
   13. BOOT
   Decides where to land based on the current save:
     - no saves at all          → jump to Saved Games so the
                                  player can make one
     - current save, cutscene
       not yet seen             → run the cutscene
     - current save, cutscene
       already seen             → agency
     - saves exist but no
       current pointer          → Saved Games
   --------------------------------------------------------- */

function bootRoute() {
  const saves = SaveManager.listSaves();
  const currentId = SaveManager.getCurrentSaveId();

  if (saves.length === 0 || !currentId) {
    document.body.classList.add('no-active-game');
    renderSavesList();
    showScreen('saves');
    return;
  }

  const current = SaveManager.getCurrentSave();
  if (!current) {
    document.body.classList.add('no-active-game');
    renderSavesList();
    showScreen('saves');
    return;
  }

  document.body.classList.remove('no-active-game');
  loadGameStateFromSave(current);
  renderAll();

  if (current.state && current.state.cutsceneSeen) {
    showScreen('agency');
  } else {
    runOpeningCutscene();
  }
}

/* ---------------------------------------------------------
   14. INIT
   --------------------------------------------------------- */

function init() {
  if (typeof CASE_DATA_003 !== 'undefined' && !gameState.cases['case_003']) {
  // We don't auto-create it. It becomes available when reputation reaches 20.
}
    setTimeout(() => {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.classList.add('fade-out');
      setTimeout(() => loading.remove(), 900);
    }
  }, 2000);
  SaveManager.init();
  bindNavigation();
  bindModalControls();

  if (window.CASEFILE_Menu && typeof window.CASEFILE_Menu.bind === 'function') {
    // menu.js self-binds on DOMContentLoaded; calling bind() here is
    // harmless because menu.js guards with dataset.menuBound.
    window.CASEFILE_Menu.bind();
  }
  if (window.CaseUI && typeof CaseUI.renderCasesScreen === 'function') {
    CaseUI.renderCasesScreen();
  }
  bootRoute();
}

document.addEventListener('DOMContentLoaded', init);

/* ---------------------------------------------------------
   15. DEBUG HOOK (console-only)
   --------------------------------------------------------- */

function updateCasesBadge() {
  const badge = document.getElementById('cases-badge');
  if (!badge) return;

  // A case is "new" if it just became unlocked (reputation crossed its threshold)
  // and the player hasn't started it yet.
  let hasNewCase = false;
  const reputation = gameState.reputation || 0;
  const cases = [
    { data: typeof CASE_DATA !== 'undefined' ? CASE_DATA : null, id: 'case_intro_001' },
    { data: typeof CASE_DATA_002 !== 'undefined' ? CASE_DATA_002 : null, id: 'case_002' },
    { data: typeof CASE_DATA_003 !== 'undefined' ? CASE_DATA_003 : null, id: 'case_003' }
  ];

  cases.forEach((c) => {
    if (!c.data || !c.data.unlockReputation) return;
    if (reputation < c.data.unlockReputation) return;
    const cs = gameState.cases && gameState.cases[c.id];
    // If case not started and unlocked, it's "new"
    if (!cs || !cs.progress || (cs.progress.discovered || []).length === 0) {
      hasNewCase = true;
    }
  });

  badge.hidden = !hasNewCase;
}

window.CASEFILE = {
  get state() { return gameState; },
  get saves() { return SaveManager.listSaves(); },
  get current() { return SaveManager.getCurrentSave(); },

  addMoney(amount) {
    gameState.money += amount;
    renderAll();
    scheduleSave();
  },

  newGame() { createNewGameAndStart(); },

  loadSave(id) { loadSaveAndEnter(id); },

  resetAll() {
    if (!confirm('Delete ALL saves and start fresh? This cannot be undone.')) return;
    SaveManager.listSaves().forEach((s) => SaveManager.deleteSave(s.id));
    localStorage.removeItem('casefile_saves_v2');
    location.reload();
  }
};
window.CASEFILE_showToast = function(message, subtitle) {
  const existing = document.getElementById('achievement-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'achievement-toast';
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="toast-icon">★</div>
    <div class="toast-body">
      <div class="toast-title">${message}</div>
      ${subtitle ? `<div class="toast-subtitle">${subtitle}</div>` : ''}
    </div>
  `;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};
