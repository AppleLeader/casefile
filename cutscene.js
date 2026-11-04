/* =========================================================
   CASEFILE — Opening Cinematic
   Controller is finished and bound once. start(onComplete)
   drives the panels and invokes the callback when the scene
   ends (by finishing or by skipping).
   ========================================================= */

'use strict';

const CUTSCENE_CAST = {
  adrian: { name: 'Adrian Vale' },
  marc:   { name: 'Marc Osei' }
};

/* Every panel MAY include an `audio` field:
   { file: 'assets/audio/opening/line_03.mp3', voice: 'adrian' }
   Nothing consumes it yet; the renderer ignores it if absent. */

const CUTSCENE_PANELS = [
  { bg: 'establishing_city', portrait: null,
    speaker: 'narrator',
    text: 'Five in the morning. The city is pretending to be asleep.' },
  { bg: 'establishing_office', portrait: null,
    speaker: 'narrator',
    text: 'Third floor, corner unit. The paint is barely dry and the dust isn\'t from this decade. My name\'s on the door in tape — I keep meaning to get a real sign.' },
  { bg: 'establishing_office', portrait: { who: 'adrian', expr: 'neutral' },
    speaker: 'adrian',
    text: 'Two chairs, one desk, and a lamp I got for free because the guy said it was "on its way out." So am I, buddy. So am I.' },
  { bg: 'office_window', portrait: { who: 'adrian', expr: 'neutral' },
    speaker: 'adrian',
    text: 'Six years at Halloran & Sons. Good money. Bad coffee. I learned how paperwork lies to you, if you let it.' },
  { bg: 'office_window', portrait: { who: 'adrian', expr: 'wry' },
    speaker: 'adrian',
    text: 'Last case I did there, the client got the truth and the firm got the check. I watched them shake hands. Then I went home and I didn\'t sleep.' },
  { bg: 'office_window', portrait: { who: 'adrian', expr: 'resolved' },
    speaker: 'adrian',
    text: 'So. My own place. My own name on the tape. Population: one.' },
  { bg: 'office_door', portrait: null,
    speaker: 'narrator',
    text: 'A knock. Not a client\'s knock. Clients knock the way you knock on a stranger\'s door. Marc knocks like he\'s late for something and knows it.' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'nervous' },
    speaker: 'marc',
    text: 'Hey. Hi. I know it\'s early — I brought pastries, but I left them on my desk, so. Anyway. No pastries.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'wry' },
    speaker: 'adrian',
    text: 'That tracks. Sit down, Marc. You look like you haven\'t blinked since Tuesday.' },
  { bg: 'office_two_shot', portrait: null,
    speaker: 'narrator',
    text: 'He sits like the chair might not be there when he lets go. He\'s an accountant. He\'s never been late for anything in his life.' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'worried' },
    speaker: 'marc',
    text: 'I do the books for a shipping company. Small outfit — fourteen people, nothing fancy. But the last few months... money\'s just been kind of. Leaving.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'focused' },
    speaker: 'adrian',
    text: 'Leaving how?' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'worried' },
    speaker: 'marc',
    text: 'Vendor payments. Same three suppliers, every month, but the numbers keep — not matching. The work\'s real, I called them. The totals just don\'t line up with what we approved.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'focused' },
    speaker: 'adrian',
    text: 'So someone\'s skimming. Changing the numbers after approval, before payment. Small enough that no one checks.' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'sheepish' },
    speaker: 'marc',
    text: 'Yeah. Yeah, that\'s — that\'s what I was afraid of. I brought it to the owner, and he told me to stop making trouble. So I didn\'t bring it to him again.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'thoughtful' },
    speaker: 'adrian',
    text: 'And you came to me.' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'honest' },
    speaker: 'marc',
    text: 'I know a good investigator. Knew one before he had his own office, anyway.' },
  { bg: 'office_two_shot', portrait: null,
    speaker: 'narrator',
    text: 'I lean back. I don\'t quite hide the smile. He sees it. He pretends not to.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'wry' },
    speaker: 'adrian',
    text: 'Flattery. Cheap and effective. What are you paying?' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'relieved' },
    speaker: 'marc',
    text: 'Whatever I can. It\'s a small case, I know. But it\'s real, and — honestly? It\'s all I\'ve got worth your time.' },
  { bg: 'office_two_shot', portrait: null,
    speaker: 'narrator',
    text: 'I look at the window. City\'s awake now. There\'s a place on the wall where a license should hang. It\'s been empty for six weeks.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'resolved' },
    speaker: 'adrian',
    text: 'Alright. I\'ll take it. But we do this my way, Marc. I need the paperwork — all of it. Invoices, approvals, the lot.' },
  { bg: 'office_room', portrait: { who: 'marc', expr: 'relieved' },
    speaker: 'marc',
    text: 'I have copies. In the car. I — I didn\'t want to seem presumptuous.' },
  { bg: 'office_room', portrait: { who: 'adrian', expr: 'wry' },
    speaker: 'adrian',
    text: 'Bring them up. And Marc — next time, bring the pastries too.' },
  { bg: 'office_window', portrait: null,
    speaker: 'narrator',
    text: 'First case of Vale Investigations. A missing ledger, a nervous accountant, and a very quiet fraud.' },
  { bg: 'office_window', portrait: null,
    speaker: 'narrator',
    text: 'Should be straightforward. Nothing ever is.' }
];

/* ---------------------------------------------------------
   ASSET RESOLUTION
   Resolves a bg/portrait key to a real URL, or null if the
   manifest doesn't have it. The renderer falls back to the
   designed CSS placeholder when null.
   --------------------------------------------------------- */

const CutsceneAssets = (() => {
  const cache = { bgs: {}, portraits: {} };

  function bgUrl(key) {
    if (!key) return null;
    if (cache.bgs[key] === undefined) {
      cache.bgs[key] = CUTSCENE_ASSETS.backgrounds[key] || null;
    }
    return cache.bgs[key];
  }

  function bgPosition(key) {
    return CUTSCENE_ASSETS.backgroundFocalPoints[key] || 'center';
  }

  function portraitUrl(who, expr) {
    const bucket = CUTSCENE_ASSETS.portraits[who];
    if (!bucket) return null;
    return bucket[expr] || null;
  }

  /* Probe an image URL. Resolves true if it loads, false if not.
     Never throws. Browsers cache the result, so this is cheap
     to repeat for the same URL. */
  function exists(url) {
    if (!url) return Promise.resolve(false);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload  = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  return { bgUrl, bgPosition, portraitUrl, exists };
})();

const Cutscene = (() => {

  const state = {
    index: 0,
    playing: false,
    typingTimer: null,
    onComplete: null,
    bound: false
  };

  const els = {};
  function $(id) { return document.getElementById(id); }

  function cacheElements() {
    els.screen       = document.querySelector('.screen.cutscene');
    els.stage        = document.querySelector('.cut-stage');
    els.bg           = $('cut-bg');
    els.portraitWrap = $('cut-portrait-wrap');
    els.portrait     = $('cut-portrait');
    els.speaker      = $('cut-speaker');
    els.text         = $('cut-text');
    els.continueBtn  = $('cut-continue');
    els.skipBtn      = $('cut-skip');
    els.progress     = $('cut-progress').firstElementChild;
    els.modalBackdrop= $('modal-backdrop');
    els.modalCancel  = $('modal-cancel');
    els.modalConfirm = $('modal-confirm');
  }

  function setBackground(artKey) {
    const url = CutsceneAssets.bgUrl(artKey);
    const pos = CutsceneAssets.bgPosition(artKey);

    els.bg.classList.add('leaving');
    setTimeout(() => {
      els.bg.dataset.art = artKey;

      if (url) {
        // Probe the file; if it 404s, fall back to the CSS placeholder.
        CutsceneAssets.exists(url).then((ok) => {
          if (ok) {
            els.bg.style.backgroundImage   = `url("${url}")`;
            els.bg.style.backgroundPosition = pos;
            els.bg.classList.add('has-image');
          } else {
            els.bg.style.backgroundImage = '';
            els.bg.classList.remove('has-image');
            console.info('[Cutscene] Missing background:', url, '— using placeholder.');
          }
        });
      } else {
        els.bg.style.backgroundImage = '';
        els.bg.classList.remove('has-image');
      }

      els.bg.classList.remove('kb');
      void els.bg.offsetWidth;
      els.bg.classList.add('kb');
      els.bg.classList.remove('leaving');
    }, 240);
  }

  function setPortrait(portrait) {
    if (!portrait) {
      els.portraitWrap.classList.add('hidden');
      els.portrait.dataset.who  = '';
      els.portrait.dataset.expr = '';
      els.portrait.style.backgroundImage = '';
      return;
    }
    els.portraitWrap.classList.remove('hidden');

    const changed =
      els.portrait.dataset.who  !== portrait.who ||
      els.portrait.dataset.expr !== portrait.expr;
    els.portrait.dataset.who  = portrait.who;
    els.portrait.dataset.expr = portrait.expr;

    const url = CutsceneAssets.portraitUrl(portrait.who, portrait.expr);
    if (url) {
      CutsceneAssets.exists(url).then((ok) => {
        if (ok) {
          els.portrait.style.backgroundImage = `url("${url}")`;
          els.portrait.classList.add('has-image');
        } else {
          els.portrait.style.backgroundImage = '';
          els.portrait.classList.remove('has-image');
          console.info('[Cutscene] Missing portrait:', url, '— using placeholder.');
        }
      });
    } else {
      els.portrait.style.backgroundImage = '';
      els.portrait.classList.remove('has-image');
    }

    if (changed) {
      els.portrait.classList.remove('flash');
      void els.portrait.offsetWidth;
      els.portrait.classList.add('flash');
    }
  }
  function typeText(text) {
    clearInterval(state.typingTimer);
    els.text.textContent = '';
    els.text.classList.add('typing');
    els.continueBtn.disabled = true;
    let i = 0;
    const SPEED_MS = 16;
    state.typingTimer = setInterval(() => {
      els.text.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(state.typingTimer);
        els.text.classList.remove('typing');
        els.continueBtn.disabled = false;
      }
    }, SPEED_MS);
  }

  function finishTyping() {
    const panel = CUTSCENE_PANELS[state.index];
    if (!panel) return;
    clearInterval(state.typingTimer);
    els.text.textContent = panel.text;
    els.text.classList.remove('typing');
    els.continueBtn.disabled = false;
  }

  function renderPanel() {
    const panel = CUTSCENE_PANELS[state.index];
    if (!panel) return;

    setBackground(panel.bg);
    setPortrait(panel.portrait);

    const name = panel.speaker === 'narrator'
      ? 'Narration'
      : (CUTSCENE_CAST[panel.speaker]?.name || '');
    els.speaker.textContent = name;
    els.speaker.classList.toggle('narrator', panel.speaker === 'narrator');

    els.text.classList.toggle('narrator', panel.speaker === 'narrator');
    typeText(panel.text);

    els.progress.style.width =
      (((state.index + 1) / CUTSCENE_PANELS.length) * 100).toFixed(2) + '%';
  }

function advance() {
  if (!state.playing) return;
  if (typeof Sounds !== 'undefined') Sounds.tick();   // ← ADD THIS LINE
  if (els.text.classList.contains('typing')) { finishTyping(); return; }
  state.index++;
  if (state.index >= CUTSCENE_PANELS.length) { finish(); return; }
  renderPanel();
}

  function openSkipModal()   { els.modalBackdrop.hidden = false; }
  function closeSkipModal()  { els.modalBackdrop.hidden = true; }

  function finish() {
    if (!state.playing) return;
    state.playing = false;
    clearInterval(state.typingTimer);
    closeSkipModal();
    const cb = state.onComplete;
    state.onComplete = null;
    if (typeof cb === 'function') cb();
  }

  function bind() {
    if (state.bound) return;
    state.bound = true;
    cacheElements();

    els.continueBtn.addEventListener('click', (e) => { e.stopPropagation(); advance(); });
    els.stage.addEventListener('click', advance);
    els.skipBtn.addEventListener('click', (e) => { e.stopPropagation(); openSkipModal(); });
    els.modalCancel.addEventListener('click', closeSkipModal);
    els.modalConfirm.addEventListener('click', finish);
  }

  /**
   * Begin the cutscene from panel 0.
   * onComplete: called once when the scene ends (finished or skipped).
   */
  function start(onComplete) {
    bind();
    state.index = 0;
    state.playing = true;
    state.onComplete = onComplete || null;
    document.querySelector('.screen.cutscene').classList.add('active');
    document.body.classList.add('in-cutscene');
    renderPanel();

    // Highlight the skip button after 5 seconds
    setTimeout(() => {
      const skipBtn = document.getElementById('cut-skip');
      if (skipBtn && state.playing) {
        skipBtn.classList.add('prominent');
      }
    }, 5000);
  }

  /** Optional: force-close without invoking onComplete (e.g. hard reset). */
  function abort() {
    state.playing = false;
    state.onComplete = null;
    clearInterval(state.typingTimer);
    closeSkipModal();
    document.body.classList.remove('in-cutscene');
  }

  return { start, abort };
})();