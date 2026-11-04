/* =========================================================
   CASEFILE — Interview UI (multi-case support)
   Renders the character interview screen. Works for both
   CASE-001 (case_intro_001) and CASE-002 (case_002).
   ========================================================= */

'use strict';

const CaseInterview = (() => {

  const ACCENTS = {
    // CASE-001
    char_marc:   '#4a5a44',
    char_dana:   '#b9905a',
    char_reyes:  '#2a2823',
    char_lian:   '#7a2f2a',
    char_trask:  '#d9ceb8',
    // CASE-002
    char_petrov:   '#7a2f2a',
    char_neighbor: '#4a6278',
    char_super:    '#4a5a44'
  };

  const QUESTION_LABELS = {
    // --- CASE-001 ---
    marc_intro_1:       'Tell me what you\'ve found.',
    marc_about_dana:    'What can you tell me about Dana?',
    marc_about_reyes:   'And Reyes, the foreman?',
    marc_about_lian:    'What about Lian in dispatch?',
    marc_about_trask:   'What kind of man is Trask?',
    marc_have_list:     'I have the payment list.',

    dana_first:             'Start from the beginning.',
    dana_about_warehouse:   'Where would you look first?',
    dana_alibi:             'Where were you when bill 4417 went through?',
    dana_deflect_log:       'Your name is on the sign-off sheet for 4417.',
    dana_deflect_storage:   'The storage fees are all initialed DW.',
    dana_hostile:           'Dana — I found the receipts in the storage unit.',

    reyes_first:        'Tell me about the paperwork here.',
    reyes_complained:   'You complained about the storage fees.',
    reyes_about_bay4:   'Bay 4. Has anything ever been stored there?',
    reyes_about_dana:   'Who handles the storage billing?',
    reyes_about_note:   'What is this note in your handwriting?',

    lian_first:       'Dana said to look at dispatch.',
    lian_override:    'Did anyone override dispatch on the Halcyon bills?',
    lian_storage:     'Were those storage crates ever scheduled?',
    lian_softens:     'Reyes told me you\'d been told to take it to Trask.',

    trask_first:            'Tell me about how the company handles payments.',
    trask_authority:        'Who can approve a bill besides you?',
    trask_uncomfortable:    'Dana says she was out sick when 4417 was signed.',

    // --- CASE-002 ---
    petrov_intro:       'Tell me what happened to the parrot.',
    petrov_value:       'Why did you mention the price so often?',
    petrov_suspects:    'Who do you think might have taken him?',
    petrov_admission:   'I found your parrot. He\'s fine. He\'s been through something.',

    neighbor_first:       'I need to ask you a few questions.',
    neighbor_deflect:     'This phone has your texts on it.',
    neighbor_confession:  'I found him in the window box.',

    super_first:          'Where were you Sunday night?',
    super_about_neighbor: 'What have you heard from the woman in 4B?',
    
    // --- CASE-003 ---
    elise_intro:      'What can you tell me about Iris?',
    elise_about_cole: 'Who is Cole?',
    elise_about_photo:'Why do you keep looking at the photo?',
    elise_pressed:    'Why would Iris not trust you?',
    elise_honest:     'You called her the night before she left.',

    lila_first:      'Did Iris tell you anything?',
    lila_about_cole: 'Have you seen Cole around?',
    lila_about_cabin:'Where is this cabin?',

    cole_first:      'Tell me what you know.',
    cole_car_pressed:'Your car was outside her building that night.',
    cole_honest:     'Iris told you she was leaving.',

        // CASE-004
    mira_intro:        'Tell me what happened.',
    mira_about_juno:   'What kind of person was she?',
    mira_about_money:  'Did Juno ever mention money going missing?',
    mira_about_car:    'Why did you wash your car at 4 AM?',
    mira_shut_down:    'You want me to stop looking.',
    mira_break:        'You know something, don\'t you.',

    tomas_first:           'Tell me about Juno.',
    tomas_about_last_night:'Where were you the night she disappeared?',
    tomas_about_mira:      'What do you think of Mira?',
    tomas_about_dominik:   'Did you know Dominik was staying there?',

    adel_first:        'Did Juno seem different lately?',
    adel_about_mira:   'Did you ever meet Mira?',
    adel_about_dominik:'Did Juno mention Dominik?',

    dominik_first:      'Where were you the night she disappeared?',
    dominik_about_night:'Walk me through that night.',
    dominik_about_mira: 'What kind of person is Mira?',

    bauer_first:        'Do you keep keys to the apartments?',
    bauer_about_river:  'Why were you at the river this morning?',
    bauer_about_camera: 'Whose camera is by the river?'
  };

  let currentCharacterId = null;
  let originLocationId = null;

  function open(characterId, originLocation) {
    // Ensure the active case data is synced before we look anything up.
    if (typeof CaseUI !== 'undefined' && typeof CaseUI.getActiveCaseId === 'function') {
      CaseUI.setActiveCase(CaseUI.getActiveCaseId());
    }
    const ch = CaseEngine.getCharacter(characterId);
    if (!ch) {
      console.warn('[Interview] Unknown character:', characterId);
      return;
    }
    currentCharacterId = characterId;
    originLocationId = originLocation || null;
    render(characterId);
    showScreen('interview');
  }

  function render(characterId) {
    const container = document.querySelector('.screen[data-screen="interview"]');
    if (!container) return;
    const ch = CaseEngine.getCharacter(characterId);
    const p = CaseUI.getProgress();
    if (!ch || !p) return;

    const accent = ACCENTS[characterId] || 'var(--brass)';
    const alreadyInterviewed = p.interviewed.includes(characterId);
    const available = CaseEngine.getAvailableDialogue(p, characterId);

    // Used = questions asked and already in p.chosen, mapped from THIS character.
    const usedOptions = ch.dialogue.filter((d) => p.chosen.includes(d.id));

    const optionsHtml = available.map((opt) => `
      <button class="dialogue-option" data-option-id="${opt.id}" type="button">
        <span class="option-arrow">▸</span>
        <span class="option-text">${escapeHTML(shortenQuestion(opt.id))}</span>
      </button>
    `).join('');

    const usedHtml = usedOptions.map((d) => {
      const isNew = d.givesEvidence && d.givesEvidence.length > 0;
      return `
        <div class="dialogue-used ${isNew ? 'gave-evidence' : ''}">
          <div class="used-question">${escapeHTML(shortenQuestion(d.id))}</div>
          <div class="used-reply">${escapeHTML(d.text)}</div>
        </div>
      `;
    }).join('');

    const noMoreHtml = (available.length === 0)
      ? `<p class="interview-exhausted">You've asked everything you know how to ask.${alreadyInterviewed ? '' : ' Maybe find more evidence first.'}</p>`
      : '';

    container.innerHTML = `
      <div class="detail-header" style="border-bottom: 3px solid ${accent};">
        <button class="back-btn" id="interview-back" type="button">‹ Back</button>
        <div class="interview-heading">
          <h2 class="detail-title">${escapeHTML(ch.name)}</h2>
          <div class="interview-role">${escapeHTML(ch.role)}</div>
        </div>
      </div>
      <p class="interview-intro">${escapeHTML(ch.intro)}</p>
      <div class="interview-body">
        ${available.length > 0 ? `
          <h3 class="section-title">Ask about</h3>
          <div class="dialogue-options">${optionsHtml}</div>
        ` : ''}
        ${usedHtml ? `
          <h3 class="section-title">What they've told you</h3>
          <div class="dialogue-used-list">${usedHtml}</div>
        ` : ''}
        ${noMoreHtml}
        <button class="interview-finish" id="interview-finish" type="button">Finish interview</button>
      </div>
    `;

    function returnToOrigin() {
      if (originLocationId && typeof CaseUI !== 'undefined' && typeof CaseUI.openLocation === 'function') {
        CaseUI.openLocation(originLocationId);
      } else if (typeof CaseUI !== 'undefined' && typeof CaseUI.renderCaseDetail === 'function') {
        CaseUI.renderCaseDetail();
        showScreen('case-detail');
      } else {
        showScreen('cases');
      }
    }

    document.getElementById('interview-back').addEventListener('click', returnToOrigin);
    document.getElementById('interview-finish').addEventListener('click', returnToOrigin);

    container.querySelectorAll('.dialogue-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const optionId = btn.dataset.optionId;
        if (!optionId) return;

        const result = CaseEngine.chooseDialogue(p, characterId, optionId);
        if (result.error) {
          console.warn('[Interview] chooseDialogue error:', result.error);
          return;
        }
        try {
          CaseUI.commitProgress(result.next);
        } catch (err) {
          console.error('[Interview] commitProgress threw:', err);
          return;
        }
        render(characterId);
      });
    });
  }

  function shortenQuestion(optionId) {
    return QUESTION_LABELS[optionId] || 'Ask about this.';
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  return { open };
})();