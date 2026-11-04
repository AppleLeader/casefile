/* =========================================================
   CASEFILE — Save Manager (multi-slot)
   One localStorage key holds a JSON document:
     { version: 2, currentSaveId, saves: { id: slot, ... } }
   Each slot is fully independent: money, cases, cutsceneSeen.
   Storage is behind an adapter so localStorage can later be
   swapped for Capacitor Preferences without touching callers.
   ========================================================= */

'use strict';

const SaveManager = (() => {

  const KEY_V2        = 'casefile_saves_v2';
  const KEY_V1_LEGACY = 'casefile_save_v1';
  const VERSION       = 2;
  const MAX_SLOTS     = 8;

  const storage = {
    read(key)       { try { return localStorage.getItem(key); } catch { return null; } },
    write(key, val) { try { localStorage.setItem(key, val); return true; } catch { return false; } }
  };

  let doc = { version: VERSION, currentSaveId: null, saves: {} };

  function uid() {
    return 'save_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function nowISO() { return new Date().toISOString(); }

  function readDoc() {
    const raw = storage.read(KEY_V2);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  function writeDoc() { storage.write(KEY_V2, JSON.stringify(doc)); }

  /* One-shot import of the milestone-1 single-save key.
     Existing saves are marked as having seen the cutscene,
     because the player was already playing the game. */
  function migrateLegacy() {
    if (storage.read(KEY_V2)) return;
    const raw = storage.read(KEY_V1_LEGACY);
    if (!raw) return;
    let v1 = null;
    try { v1 = JSON.parse(raw); } catch { return; }
    if (!v1 || typeof v1 !== 'object') return;

    const id  = uid();
    const t   = nowISO();
    doc.saves[id] = {
      id,
      name: 'Imported Save',
      createdAt: t,
      updatedAt: t,
      state: Object.assign({ cutsceneSeen: true }, v1)
    };
    doc.currentSaveId = id;
    writeDoc();
  }

  function init() {
    const loaded = readDoc();
    if (loaded && loaded.version === VERSION) doc = loaded;
    else { doc = { version: VERSION, currentSaveId: null, saves: {} }; migrateLegacy(); }
  }

  function listSaves() {
    return Object.values(doc.saves).sort((a, b) =>
      (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }
  function getSave(id)          { return doc.saves[id] || null; }
  function getCurrentSaveId()   { return doc.currentSaveId; }
  function getCurrentSave()     { return doc.currentSaveId ? doc.saves[doc.currentSaveId] || null : null; }

  function createSave(name, initialState) {
    if (Object.keys(doc.saves).length >= MAX_SLOTS)
      return { error: `All ${MAX_SLOTS} slots are in use.` };
    const id  = uid();
    const t   = nowISO();
    doc.saves[id] = {
      id,
      name: name || `Save ${Object.keys(doc.saves).length + 1}`,
      createdAt: t,
      updatedAt: t,
      state: clone(initialState)
    };
    doc.currentSaveId = id;
    writeDoc();
    return { id };
  }

  function saveState(state, id) {
    const target = id || doc.currentSaveId;
    if (!target || !doc.saves[target]) return { error: 'No slot.' };
    doc.saves[target].state     = clone(state);
    doc.saves[target].updatedAt = nowISO();
    writeDoc();
    return { ok: true };
  }

  function setCurrentSave(id) {
    if (!doc.saves[id]) return { error: 'Save not found.' };
    doc.currentSaveId = id;
    writeDoc();
    return { ok: true };
  }

  function deleteSave(id) {
    if (!doc.saves[id]) return { error: 'Save not found.' };
    delete doc.saves[id];
    if (doc.currentSaveId === id) doc.currentSaveId = null;
    writeDoc();
    return { ok: true };
  }

  return {
    init, listSaves, getSave, getCurrentSave, getCurrentSaveId,
    createSave, saveState, setCurrentSave, deleteSave,
    MAX_SLOTS
  };
})();