/* =========================================================
   CASEFILE — Case UI (multi-case support)
   Renders the Cases screen, case detail, location view,
   and object inspection modal. Supports two cases:
   CASE-001 (case_intro_001) and CASE-002 (case_002).

   Uses a "swap" trick to point window.CASE_DATA at the
   currently active case's data before rendering, then
   restores it. This lets the engine work without changes.
   ========================================================= */

'use strict';

const CaseUI = (() => {

  // Active case id. Default to CASE-001 for backwards compat.
  let activeCaseId = 'case_intro_001';

  // Reference to the "real" CASE_DATA (CASE-001), never mutated.
  const CASE_DATA_PRIMARY = typeof CASE_DATA !== 'undefined' ? CASE_DATA : null;

  function getCaseData(id) {
  if (id === 'case_intro_001' && CASE_DATA_PRIMARY) return CASE_DATA_PRIMARY;
  if (id === 'case_002' && typeof CASE_DATA_002 !== 'undefined') return CASE_DATA_002;
  if (id === 'case_003' && typeof CASE_DATA_003 !== 'undefined') return CASE_DATA_003;
  if (id === 'case_004' && typeof CASE_DATA_004 !== 'undefined') return CASE_DATA_004;
  
  return CASE_DATA_PRIMARY;
  }

  // Swap window.CASE_DATA to the active case. Call at the start of any
  // render path that goes through CaseEngine.
  function swapToActiveCase() {
    const cd = getCaseData(activeCaseId);
    if (cd) window.CASE_DATA = cd;
  }

  // Restore to CASE-001 (used after finishing with CASE-002 work).
  function restorePrimaryCase() {
    if (CASE_DATA_PRIMARY) window.CASE_DATA = CASE_DATA_PRIMARY;
  }

  function setActiveCase(id) {
    activeCaseId = id;
    swapToActiveCase();
  }

  function getActiveCaseId() { return activeCaseId; }

  /* ---------------- Progress helpers ---------------- */

  function getProgress() {
    if (typeof gameState === 'undefined' || !gameState) return null;
    if (!gameState.cases) gameState.cases = {};
    const id = activeCaseId;
    if (!gameState.cases[id]) {
      gameState.cases[id] = {
        status: 'available',
        progress: CaseEngine.createProgress(id)
      };
    }
    return gameState.cases[id].progress;
  }

  function getCaseStatus(id) {
    if (typeof gameState === 'undefined' || !gameState) return 'available';
    const cs = gameState.cases && gameState.cases[id];
    if (!cs) return 'available';
    return cs.status || 'available';
  }

  function getCaseProgressSummary(id) {
    if (typeof gameState === 'undefined' || !gameState) return null;
    const cs = gameState.cases && gameState.cases[id];
    if (!cs) return null;
    return cs.progress;
  }
    function getActiveCaseId() {
    if (typeof gameState === 'undefined' || !gameState.cases) return null;
    for (const id in gameState.cases) {
      const c = gameState.cases[id];
      if (!c.progress) continue;
      if (c.progress.resolved) continue;
      // Active = has evidence found (started) and not resolved
      if ((c.progress.discovered || []).length > 0) return id;
    }
    return null;
  }

  function commitProgress(progress) {
    if (typeof gameState === 'undefined' || !gameState) return;
    if (!gameState.cases) gameState.cases = {};
    const id = activeCaseId;
    if (!gameState.cases[id]) {
      gameState.cases[id] = { status: 'active', progress };
    } else {
      gameState.cases[id].progress = progress;
      if (gameState.cases[id].status === 'available') {
        gameState.cases[id].status = 'active';
      }
    }
    syncActiveCases();
    if (typeof saveGameStateIntoCurrentSlot === 'function') {
      saveGameStateIntoCurrentSlot();
    }
    if (typeof renderStatusBar === 'function') {
      renderStatusBar();
    }
  }

  function syncActiveCases() {
    if (typeof gameState === 'undefined' || !gameState || !gameState.cases) return;
    const active = [];
    const completed = [];
    Object.keys(gameState.cases).forEach((id) => {
      const c = gameState.cases[id];
      const cd = getCaseData(id);
      const title = cd ? cd.title : id;
      if (c.status === 'completed' || (c.progress && c.progress.resolved)) {
        completed.push({ id, title });
      } else if (c.status === 'active' || (c.progress && c.progress.discovered && c.progress.discovered.length > 0)) {
        active.push({ id, title });
      }
    });
    gameState.activeCases = active;
    gameState.completedCases = completed;
  }

  function markVisited(locationId) {
    const p = getProgress();
    if (!p) return;
    if (!p.visited.includes(locationId)) {
      p.visited = p.visited.concat([locationId]);
      commitProgress(p);
    }
  }

  /* ---------------- Cases list screen ---------------- */

  function renderCasesScreen() {
    const container = document.querySelector('.screen[data-screen="cases"]');
    if (!container) return;

    const allCases = [];
    if (CASE_DATA_PRIMARY) allCases.push(CASE_DATA_PRIMARY);
    if (typeof CASE_DATA_002 !== 'undefined') allCases.push(CASE_DATA_002);
    if (typeof CASE_DATA_003 !== 'undefined') allCases.push(CASE_DATA_003);
    if (typeof CASE_DATA_004 !== 'undefined') allCases.push(CASE_DATA_004);

    const reputation = (gameState && gameState.reputation) || 0;

    // Sort: uncompleted first, then completed. Within uncompleted:
    //   active (in progress) first, then available (not started), then locked.
    // Within completed: most recently completed first (by updatedAt of the case).
    allCases.sort((a, b) => {
      const aCs = gameState.cases && gameState.cases[a.id];
      const bCs = gameState.cases && gameState.cases[b.id];
      const aResolved = !!(aCs && aCs.progress && aCs.progress.resolved);
      const bResolved = !!(bCs && bCs.progress && bCs.progress.resolved);

      // Completed cases go to the bottom
      if (aResolved !== bResolved) return aResolved ? 1 : -1;

      // Both completed: no further sort needed (could sort by completion time)
      if (aResolved && bResolved) return 0;

      // Both uncompleted: active (has discovered evidence) before available
      const aActive = !!(aCs && aCs.progress && (aCs.progress.discovered || []).length > 0);
      const bActive = !!(bCs && bCs.progress && (bCs.progress.discovered || []).length > 0);
      if (aActive !== bActive) return aActive ? -1 : 1;

      // Within same category, keep original order
      return 0;
    });

    const cardsHtml = allCases.map((cd) => {
      const status = getCaseStatus(cd.id);
      const progress = getCaseProgressSummary(cd.id);
      const isCompleted = status === 'completed' || (progress && progress.resolved);
      const isLocked = cd.unlockReputation && reputation < cd.unlockReputation;
      const isActive = progress && !isCompleted && (progress.discovered || []).length > 0;

      let statusLabel = 'New';
      let buttonLabel = 'Start investigation';
      if (isCompleted) { statusLabel = 'Closed'; buttonLabel = 'Review case'; }
      else if (isActive) { statusLabel = 'Active'; buttonLabel = 'Continue investigation'; }
      else if (isLocked) { statusLabel = 'Locked'; buttonLabel = null; }

      return `
        <div class="case-card ${isCompleted ? 'completed' : (isLocked ? 'locked' : 'active')}">
          <div class="case-card-head">
            <span class="case-code">${escapeHTML(cd.code)}</span>
            <span class="case-status">${statusLabel}</span>
          </div>
          <h3 class="case-name">${escapeHTML(cd.title)}</h3>
          <p class="case-client">Client: ${escapeHTML(cd.client)}</p>
          <p class="case-brief">${escapeHTML(cd.brief)}</p>
          ${isLocked
            ? `<p class="case-locked-hint">Unlocks at Reputation ${cd.unlockReputation}. You have ${reputation}.</p>`
            : (progress
                ? `<div class="case-progress">
                     <span>Evidence ${(progress.discovered || []).length} / ${(cd.evidence || []).length}</span>
                     <span>Interviews ${(progress.interviewed || []).length} / ${(cd.characters || []).length}</span>
                   </div>`
                : '')}
          ${buttonLabel
            ? `<button class="case-open-btn" data-open-case="${cd.id}" type="button">${buttonLabel}</button>`
            : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="cases-header">
        <h2 class="cases-title">Cases</h2>
      </div>
      ${cardsHtml}
    `;

    container.querySelectorAll('[data-open-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.openCase;
        const currentActiveId = getActiveCaseId();

        // If they're opening the case they're already on, no confirmation needed
        if (currentActiveId === targetId) {
          setActiveCase(targetId);
          openCase();
          return;
        }

        // If there's another active case, ask to abandon it
        if (currentActiveId && currentActiveId !== targetId) {
          const currentCase = getCaseData(currentActiveId);
          const currentName = currentCase ? currentCase.title : currentActiveId;
          const confirmed = confirm(
            `You're currently working on "${currentName}".\n\n` +
            `Starting this new case will abandon your progress on "${currentName}".\n\n` +
            `Continue?`
          );
          if (!confirmed) return;

          // Reset the current active case (preserve rewarded flag if it was set)
          const wasRewarded = gameState.cases[currentActiveId].rewarded === true;
          gameState.cases[currentActiveId] = {
            status: 'active',
            progress: CaseEngine.createProgress(currentActiveId),
            rewarded: wasRewarded
          };
        }

        setActiveCase(targetId);
        openCase();
      });
    });
  }

  /* ---------------- Case detail (locations) ---------------- */

  function openCase() {
    swapToActiveCase();
    renderCaseDetail();
    showScreen('case-detail');
  }

  function renderCaseDetail() {
    swapToActiveCase();
    const container = document.querySelector('.screen[data-screen="case-detail"]');
    if (!container) return;
    const p = getProgress();
    if (!p) { container.innerHTML = '<p class="muted">No case loaded.</p>'; return; }

    const cd = getCaseData(activeCaseId);
    if (!cd) { container.innerHTML = '<p class="muted">Case data missing.</p>'; return; }

    const locationsHtml = (cd.locations || []).map((loc) => {
      const unlocked = CaseEngine.isLocationUnlocked(p, loc.id);
      const visited = p.visited.includes(loc.id);
      return `
        <button class="location-card ${unlocked ? '' : 'locked'} ${visited ? 'visited' : ''}"
                data-location-id="${loc.id}"
                ${unlocked ? '' : 'disabled'}>
          <span class="loc-name">${escapeHTML(loc.name)}</span>
          <span class="loc-tag">${unlocked ? escapeHTML(loc.tagline) : 'Locked — evidence required'}</span>
          ${visited ? '<span class="loc-badge">Visited</span>' : ''}
        </button>
      `;
    }).join('');

    const resolvedBanner = p.resolved
      ? `<div class="case-resolved-banner">★ CASE CLOSED — ${escapeHTML(cd.truth.resolution.correct.substring(0, 90))}...</div>`
      : '';

    container.innerHTML = `
      <div class="detail-header">
        <button class="back-btn" id="detail-back" type="button">‹ Cases</button>
        <h2 class="detail-title">${escapeHTML(cd.title)}</h2>
      </div>
      ${resolvedBanner}
      <div class="locations-list">${locationsHtml}</div>
      <button class="accuse-btn" id="accuse-btn" type="button">${p.resolved ? 'Review the accusation' : 'Submit final accusation'}</button>
      ${p.resolved ? `<button class="reset-case-btn" id="reset-case-btn" type="button">Replay this case</button>` : ''}
      ${!p.resolved ? `<button class="hint-btn" id="case-hint-btn" type="button">Where should I look?</button><div id="case-hint-text" class="hint-text" hidden></div>` : ''}
    `;

    document.getElementById('detail-back').addEventListener('click', () => {
      restorePrimaryCase();
      activeCaseId = 'case_intro_001';
      renderCasesScreen();
      showScreen('cases');
    });

    document.querySelectorAll('.location-card:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => openLocation(btn.dataset.locationId));
    });

    document.getElementById('accuse-btn').addEventListener('click', () => {
      if (typeof CaseAccusation !== 'undefined' && typeof CaseAccusation.open === 'function') {
        CaseAccusation.open();
      } else {
        alert('Accusation system not loaded.');
      }
    });
        const resetBtn = document.getElementById('reset-case-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!confirm('Replay this case? This will erase your progress on it.')) return;
        const wasRewarded = gameState.cases[activeCaseId].rewarded === true;
        gameState.cases[activeCaseId] = {
          status: 'active',
          progress: CaseEngine.createProgress(activeCaseId),
          rewarded: wasRewarded
        };
        if (typeof saveGameStateIntoCurrentSlot === 'function') saveGameStateIntoCurrentSlot();
        renderCaseDetail();
      });
    }
        const caseHintBtn = document.getElementById('case-hint-btn');
    if (caseHintBtn) {
      caseHintBtn.addEventListener('click', () => {
        const hints = generateHints(activeCaseId, p);
        document.getElementById('case-hint-text').textContent = hints;
        document.getElementById('case-hint-text').hidden = false;
      });
    }
  }

  /* ---------------- Location view ---------------- */

  function openLocation(locationId) {
    swapToActiveCase();
    markVisited(locationId);
    renderLocationView(locationId);
    showScreen('location');
  }

  function renderLocationView(locationId) {
    swapToActiveCase();
    const container = document.querySelector('.screen[data-screen="location"]');
    if (!container) return;
    const loc = CaseEngine.getLocation(locationId);
    const p = getProgress();
    const cd = getCaseData(activeCaseId);
    if (!loc || !p || !cd) return;

    const objects = (cd.objects || []).filter((o) => o.location === locationId);

    // Simple character-location rule per case
    const charLocations = {
      'case_intro_001': {
        char_marc: 'loc_office',
        char_dana: 'loc_company',
        char_trask: 'loc_company',
        char_reyes: 'loc_warehouse',
        char_lian: 'loc_warehouse'
      },
      'case_002': {
        char_petrov: 'loc_petrov_apt',
        char_neighbor: 'loc_hallway',
        char_super: 'loc_hallway'
      },
      'case_003': {
        char_elise: 'loc_varga_home',
        char_lila:  'loc_coffee_shop',
        char_cole:  'loc_iris_apartment'
      },
            'case_004': {
        char_mira:    'loc_apartment',
        char_tomas:   'loc_tomas_flat',
        char_adel:    'loc_apartment',
        char_dominik: 'loc_apartment',
        char_bauer:   'loc_apartment'
      },
    };
    const mapping = charLocations[activeCaseId] || {};
    const characters = (cd.characters || []).filter((c) => mapping[c.id] === locationId);

    const objectChips = objects.map((o) => {
      const inspectable = CaseEngine.isObjectInspectable(p, o.id);
      return `
        <button class="object-chip ${inspectable ? '' : 'locked'}"
                data-object-id="${o.id}">
          ${escapeHTML(o.name)}${inspectable ? '' : ' 🔒'}
        </button>
      `;
    }).join('');

    const charChips = characters.map((c) => `
      <button class="object-chip char" data-character-id="${c.id}">
        ${escapeHTML(c.name)}
      </button>
    `).join('');

    container.innerHTML = `
      <div class="detail-header">
        <button class="back-btn" id="loc-back" type="button">‹ Locations</button>
        <h2 class="detail-title">${escapeHTML(loc.name)}</h2>
      </div>
      <p class="loc-tagline">${escapeHTML(loc.tagline)}</p>
      <h3 class="section-title">Examine</h3>
      <div class="chip-grid">${objectChips || '<p class="muted">Nothing to examine here yet.</p>'}</div>
      <h3 class="section-title">Talk to</h3>
      <div class="chip-grid">${charChips || '<p class="muted">Nobody here right now.</p>'}</div>
    `;

    document.getElementById('loc-back').addEventListener('click', () => {
      renderCaseDetail();
      showScreen('case-detail');
    });

    document.querySelectorAll('.object-chip[data-object-id]').forEach((btn) => {
      btn.addEventListener('click', () => inspectObject(btn.dataset.objectId));
    });

    document.querySelectorAll('.object-chip[data-character-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (typeof CaseInterview !== 'undefined' && typeof CaseInterview.open === 'function') {
          CaseInterview.open(btn.dataset.characterId, locationId);
        } else {
          alert('Interview system not loaded.');
        }
      });
    });
  }

  /* ---------------- Object inspection modal ---------------- */

  function inspectObject(objectId) {
    swapToActiveCase();
    const p = getProgress();
    const obj = CaseEngine.getObject(objectId);
    if (!p || !obj) return;
    const result = CaseEngine.inspectObject(p, objectId);
    if (!result.ok) {
      const needed = (obj.needsFirst || obj.requiresEvidence || []).map((id) => {
        const ev = CaseEngine.getEvidence(id);
        return ev ? ev.name : id;
      });
      const hint = needed.length
        ? `You need to look at something else first — specifically: ${needed.join(', ')}.`
        : 'You need to find something else first.';
      showInspectModal('Not ready yet', hint, null);
      return;
    }

    let evidenceHtml = '';
    if (result.evidenceId && !result.alreadyOwned) {
      const ev = CaseEngine.getEvidence(result.evidenceId);
      p.discovered = CaseEngine.discoverEvidence(p, result.evidenceId);
      commitProgress(p);
      if (typeof Sounds !== 'undefined') Sounds.evidence();   // ← ADD THIS LINE
      evidenceHtml = `
        <div class="ev-found">
          <div class="ev-found-label">Evidence found</div>
          <div class="ev-found-name">${escapeHTML(ev.name)}</div>
          <div class="ev-found-body">${escapeHTML(ev.description)}</div>
        </div>
      `;
    } else if (result.evidenceId && result.alreadyOwned) {
      const ev = CaseEngine.getEvidence(result.evidenceId);
      evidenceHtml = `<p class="muted">Already recorded: ${escapeHTML(ev.name)}</p>`;
    }

    showInspectModal(obj.name, obj.description, evidenceHtml);
  }

  function showInspectModal(title, body, extraHtml) {
    let backdrop = document.getElementById('inspect-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'inspect-modal';
      backdrop.className = 'modal-backdrop';
      backdrop.hidden = true;
      backdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <h3 class="modal-title" id="inspect-title"></h3>
          <p class="modal-text" id="inspect-body"></p>
          <div id="inspect-extra"></div>
          <div class="modal-actions">
            <button class="modal-btn solid" id="inspect-close" type="button">Close</button>
          </div>
        </div>
      `;
      document.getElementById('app').appendChild(backdrop);
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.hidden = true;
      });
      document.getElementById('inspect-close').addEventListener('click', () => {
        backdrop.hidden = true;
      });
    }
    document.getElementById('inspect-title').textContent = title;
    document.getElementById('inspect-body').textContent = body;
    document.getElementById('inspect-extra').innerHTML = extraHtml || '';
    backdrop.hidden = false;
  }

  /* ---------------- Util ---------------- */

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  /* Re-render the cases screen whenever the Cases nav button is pressed. */
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.nav-btn');
    if (navBtn && navBtn.dataset.target === 'cases') {
      restorePrimaryCase();
      activeCaseId = 'case_intro_001';
      renderCasesScreen();
    }
  });

function generateHints(caseId, progress) {
  const cd = getCaseData(caseId);
  if (!cd) return 'Case data not found.';

  const hints = [];
  const visited = progress.visited || [];
  const discovered = progress.discovered || [];
  const interviewed = progress.interviewed || [];

  // Hint 1: unvisited locations
  const unvisitedLocations = (cd.locations || []).filter((loc) => {
    if (visited.includes(loc.id)) return false;
    if (loc.unlockRequires && loc.unlockRequires.length > 0) {
      // Only mention if the unlock requirements are met (i.e., it's actually available)
      return loc.unlockRequires.every((reqId) => discovered.includes(reqId));
    }
    return true;
  });

  if (unvisitedLocations.length > 0) {
    hints.push(`You haven't visited: ${unvisitedLocations.map((l) => l.name).join(', ')}.`);
  }

  // Hint 2: unexamined objects at visited locations
  const unexaminedObjects = (cd.objects || []).filter((obj) => {
    if (!visited.includes(obj.location)) return false;
    if (!obj.yield) return false;
    if (discovered.includes(obj.yield)) return false;
    // Only mention if prerequisites are met
    if (obj.needsFirst || obj.requiresEvidence) {
      const prereqs = obj.needsFirst || obj.requiresEvidence;
      return prereqs.every((reqId) => discovered.includes(reqId));
    }
    return true;
  });

  if (unexaminedObjects.length > 0) {
    hints.push(`You haven't examined: ${unexaminedObjects.map((o) => o.name).join(', ')}.`);
  }

  // Hint 3: uninterviewed characters
  const unInterviewed = (cd.characters || []).filter((c) =>
    !interviewed.includes(c.id)
  );

  if (unInterviewed.length > 0) {
    hints.push(`You haven't talked to: ${unInterviewed.map((c) => c.name).join(', ')}.`);
  }

  if (hints.length === 0) {
    return 'You seem to have explored everything. Try submitting an accusation — or review your evidence board for connections you might have missed.';
  }

  return hints.join(' ');
}

  /* ---------------- Public API ---------------- */

  return {
    renderCasesScreen,
    renderCaseDetail,
    renderLocationView,
    openCase,
    openLocation,
    getProgress,
    commitProgress,
    setActiveCase,
    getActiveCaseId
  };
})();