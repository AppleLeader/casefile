'use strict';

const CaseAccusation = (() => {

  function getCaseData() {
    return (typeof window !== 'undefined' && window.CASE_DATA) || CASE_DATA;
  }
  let selectedCulprit = null;
  let selectedMethod = null;
  let selectedEvidence = [];

  function getProgress() {
    return (typeof CaseUI !== 'undefined' && typeof CaseUI.getProgress === 'function')
      ? CaseUI.getProgress()
      : null;
  }

  function open() {
    // Sync the active case data (same trick as the board and interview screens)
    if (typeof CaseUI !== 'undefined' && typeof CaseUI.setActiveCase === 'function') {
      CaseUI.setActiveCase(CaseUI.getActiveCaseId());
    }
    const progress = getProgress();
    if (!progress) { alert('No case loaded.'); return; }
    selectedCulprit = null;
    selectedMethod = null;
    selectedEvidence = [];
    render(progress);
    showScreen('accusation');
  }
  function render(progress) {
    const container = document.querySelector('.screen[data-screen="accusation"]');
    if (!container) return;

    const characters = getCaseData().characters.map((c) => `
      <button class="accuse-pick ${selectedCulprit === c.id ? 'picked' : ''}" data-culprit="${c.id}">
        ${escapeHTML(c.name)}
      </button>
    `).join('');

    // Shuffle method options so the correct answer isn't always first
const shuffledMethods = [...getCaseData().truth.methodOptions];
for (let i = shuffledMethods.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffledMethods[i], shuffledMethods[j]] = [shuffledMethods[j], shuffledMethods[i]];
}

const methods = shuffledMethods.map((m) => `
      <button class="accuse-pick ${selectedMethod === m.id ? 'picked' : ''}" data-method="${m.id}">
        ${escapeHTML(m.label)}
      </button>
    `).join('');

    const evidence = getCaseData().evidence
      .filter((e) => progress.discovered.includes(e.id))
      .map((e) => `
        <button class="accuse-pick small ${selectedEvidence.includes(e.id) ? 'picked' : ''}" data-evidence="${e.id}">
          ${escapeHTML(e.name)}
        </button>
      `).join('');

    container.innerHTML = `
      <div class="detail-header">
        <button class="back-btn" id="accuse-back">‹ Case</button>
        <h2 class="detail-title">Final Accusation</h2>
      </div>
      <div class="accuse-body">
        <h3 class="section-title">${['case_002', 'case_003'].includes(getCaseData().id) ? 'Who is responsible?' : 'Who committed the fraud?'}</h3>
        <div class="accuse-grid">${characters}</div>
        <h3 class="section-title">How?</h3>
        <div class="accuse-grid">${methods}</div>
        <h3 class="section-title">Evidence (select all that support your case)</h3>
        <div class="accuse-grid">${evidence || '<p class="muted">No evidence found.</p>'}</div>
        <button class="hint-btn" id="hint-btn" type="button">Need a hint?</button>
<div id="hint-text" class="hint-text" hidden></div>
        <button class="accuse-btn" id="accuse-submit">Submit Accusation</button>
      </div>
    `;

    document.getElementById('accuse-back').addEventListener('click', () => {
      CaseUI.renderCaseDetail();
      showScreen('case-detail');
    });

    container.querySelectorAll('[data-culprit]').forEach((b) => b.addEventListener('click', () => {
      selectedCulprit = b.dataset.culprit; render(progress);
    }));
    container.querySelectorAll('[data-method]').forEach((b) => b.addEventListener('click', () => {
      selectedMethod = b.dataset.method; render(progress);
    }));
    container.querySelectorAll('[data-evidence]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.evidence;
      if (selectedEvidence.includes(id)) selectedEvidence = selectedEvidence.filter((x) => x !== id);
      else selectedEvidence.push(id);
      render(progress);
    }));

    document.getElementById('accuse-submit').addEventListener('click', () => submit(progress));
      const hintBtn = document.getElementById('hint-btn');
    const hintText = document.getElementById('hint-text');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        const cd = getCaseData();
        const hint = {
          'case_intro_001': 'Look closely at who signed the approval sheet. Then ask yourself who was supposed to be out that week.',
          'case_002': 'The parrot didn\'t fly out. Check what the window box was doing.',
          'case_003': 'The photo has a date on it. Is that date actually when she left?',
          'case_004': 'The money matters more than the money. Juno was losing it, and someone close to her was gaining it. And check the river camera — but ask Mr. Bauer whose camera it actually is.',
        }[cd.id] || 'Look at the evidence again. Something doesn\'t match.';
        hintText.textContent = hint;
        hintText.hidden = false;
      });
    }
  }

  function submit(progress) {
    if (!selectedCulprit) { alert('Pick a culprit first.'); return; }
    if (!selectedMethod) { alert('Pick a method first.'); return; }
    if (selectedEvidence.length === 0) { alert('Select at least one piece of evidence.'); return; }

    const payload = CaseEngine.buildAccusationPayload(selectedCulprit, selectedMethod, selectedEvidence);
    const result = CaseEngine.evaluateAccusation(progress, payload);

    progress.accusation = result;
    progress.resolved = true;
    progress.status = 'completed';

    if (typeof Sounds !== 'undefined') {   // ← ADD THESE 4 LINES
      if (result.culpritCorrect) Sounds.solved();
      else Sounds.fail();
    }

    // Rewards & Case Completion
    if (result.tier) {
      if (typeof gameState !== 'undefined') {
        const cd = getCaseData();
        const caseRecord = gameState.cases[cd.id];

        // Only award rewards if this case has never been rewarded before.
        // A "rewarded" flag prevents repeat farming via replays.
        const alreadyRewarded = caseRecord && caseRecord.rewarded === true;

        if (!alreadyRewarded) {
          gameState.money += result.tier.money;
          gameState.reputation += result.tier.reputation;
          gameState.experience += result.tier.xp;

          gameState.activeCases = gameState.activeCases.filter(c => c.id !== cd.id);
          gameState.completedCases.push({
            id: cd.id,
            title: cd.title,
            result: result.culpritCorrect ? 'win' : 'loss'
          });

          // Mark as rewarded so replays don't pay out again
          if (caseRecord) caseRecord.rewarded = true;
        }
      }
    }

    const wasFirstCompletion = !alreadyRewarded;
    CaseUI.commitProgress(progress);
    renderResolution(result, wasFirstCompletion);
  }

  function renderResolution(result) {
    const container = document.querySelector('.screen[data-screen="accusation"]');
    if (!container) return;

    const cd = getCaseData();
    const caseRecord = gameState.cases[cd.id];
    const wasRewarded = caseRecord && caseRecord.rewarded;

    // If this was a replay (already rewarded), don't show reward numbers
  const rewardsHtml = wasFirstCompletion
    ? `<div class="resolution-rewards">
         <span>+ $${result.tier.money}</span>
         <span>+ ${result.tier.reputation} Reputation</span>
         <span>+ ${result.tier.xp} XP</span>
       </div>`
    : `<p class="resolution-replayed">Replay — no additional rewards.</p>`;
    container.innerHTML = `
      <div class="detail-header">
        <h2 class="detail-title">${result.culpritCorrect ? 'Case Closed' : 'Case Closed — Wrong Conclusion'}</h2>
      </div>
      <div class="accuse-body">
        <p class="resolution-tier">${result.tier.label}</p>
        <p class="resolution-text">${escapeHTML(result.resolution)}</p>
        ${rewardsHtml}
        <button class="accuse-btn" id="resolution-done">Back to Agency</button>
      </div>
    `;

    document.getElementById('resolution-done').addEventListener('click', () => {
      if (typeof renderAll === 'function') renderAll();
      showScreen('agency');
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  return { open };
})();