/* =========================================================
   CASEFILE — People / Contacts UI
   Shows characters from ACTIVE (unresolved) cases, plus
   case clients. Characters from completed cases disappear
   unless they also appear in an active case.
   ========================================================= */

'use strict';

const PeopleUI = (() => {

  function getCaseDataById(id) {
    if (id === 'case_intro_001' && typeof CASE_DATA !== 'undefined') return CASE_DATA;
    if (id === 'case_002' && typeof CASE_DATA_002 !== 'undefined') return CASE_DATA_002;
    if (id === 'case_003' && typeof CASE_DATA_003 !== 'undefined') return CASE_DATA_003;
    if (id === 'case_004' && typeof CASE_DATA_004 !== 'undefined') return CASE_DATA_004;
    return null;
  }

  function isCaseActive(caseId) {
    if (typeof gameState === 'undefined' || !gameState.cases) return false;
    const c = gameState.cases[caseId];
    if (!c || !c.progress) return false;
    return !c.progress.resolved;
  }

  function isInterviewed(caseId, characterId) {
    if (typeof gameState === 'undefined' || !gameState.cases) return false;
    const c = gameState.cases[caseId];
    if (!c || !c.progress) return false;
    return (c.progress.interviewed || []).includes(characterId);
  }

  function isClient(character, caseData) {
    return caseData && caseData.client && character.name === caseData.client;
  }

  function collectContacts() {
    const contacts = [];
    if (typeof gameState === 'undefined' || !gameState.cases) return contacts;

    const activeCaseIds = Object.keys(gameState.cases).filter((id) => isCaseActive(id));

    activeCaseIds.forEach((caseId) => {
      const caseData = getCaseDataById(caseId);
      if (!caseData) return;

      (caseData.characters || []).forEach((character) => {
        const met = isInterviewed(caseId, character.id) || isClient(character, caseData);
        if (!met) return;
        contacts.push({
          id: character.id,
          name: character.name,
          role: character.role,
          caseId: caseId,
          caseCode: caseData.code,
          interviewed: isInterviewed(caseId, character.id)
        });
      });
    });

    // Dedupe: if same character appears in multiple active cases, keep one
    const seen = new Set();
    return contacts.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }

  function render() {
    const container = document.getElementById('people-list');
    if (!container) return;

    const contacts = collectContacts();

    if (contacts.length === 0) {
      container.innerHTML = `
        <p class="muted" style="padding:24px;text-align:center;">
          Nobody yet. Start a case and talk to people — they'll show up here.
        </p>
      `;
      return;
    }

    container.innerHTML = contacts.map((c) => `
      <div class="person-card ${c.interviewed ? 'interviewed' : ''}">
        <div class="person-info">
          <div class="person-name">${escapeHTML(c.name)}</div>
          <div class="person-role">${escapeHTML(c.role)}</div>
          <div class="person-case">${escapeHTML(c.caseCode)}</div>
        </div>
        <div class="person-status">${c.interviewed ? 'Spoken' : 'Client'}</div>
      </div>
    `).join('');
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  return { render };
})();