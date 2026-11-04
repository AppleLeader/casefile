/* =========================================================
   CASEFILE — Three-Dot Options Menu
   Self-contained. Binds on DOMContentLoaded. Verifies its
   own preconditions and reports precise diagnostics if the
   HTML or CSS is not what it expects.

   Menu actions are dispatched to window.CASEFILE_handleMenuAction
   if it exists; otherwise a console warning is printed. This
   keeps menu.js independent from script.js's game flow.
   ========================================================= */

'use strict';

(function () {
  const TAG = '[Menu]';

  // ---- Elements resolved lazily so this file can be loaded
  //      before or after DOMContentLoaded without issue. ----
  let toggle   = null;
  let dropdown = null;
  let bound    = false;

  function resolveElements() {
    toggle   = document.getElementById('menu-toggle');
    dropdown = document.getElementById('menu-dropdown');
  }

  function diagnoseIfMissing() {
    const problems = [];
    if (!toggle)   problems.push('missing #menu-toggle');
    if (!dropdown) problems.push('missing #menu-dropdown');
    if (problems.length) {
      console.error(TAG, 'Cannot bind —', problems.join(', '),
        '. Check index.html.');
      return false;
    }
    return true;
  }

    function open() {
    if (!dropdown || !toggle) return;

    // Make it measurable before we compute position.
    dropdown.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');

    // Measure both elements in their current state.
    const t = toggle.getBoundingClientRect();
    const d = dropdown.getBoundingClientRect();

    const MARGIN = 8;                        // min gap from viewport edges
    const GAP    = 6;                        // gap between button and menu
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;

    // Preferred horizontal position: right-aligned to the button.
    let left = t.right - d.width;

    // Clamp horizontally so the menu never leaves the screen.
    if (left + d.width > vw - MARGIN) left = vw - MARGIN - d.width;
    if (left < MARGIN)                left = MARGIN;

    // Preferred vertical position: below the button.
    let top = t.bottom + GAP;

    // If it wouldn't fit below, place it above the button instead.
    if (top + d.height > vh - MARGIN) {
      const above = t.top - GAP - d.height;
      top = above >= MARGIN ? above : Math.max(MARGIN, vh - MARGIN - d.height);
    }

    // Apply. Using left/top (not right) so clamping is unambiguous.
    dropdown.style.left  = `${Math.round(left)}px`;
    dropdown.style.top   = `${Math.round(top)}px`;
    dropdown.style.right = 'auto';
  }

  function close() {
    if (!dropdown) return;
    dropdown.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function isOpen() {
    return dropdown && !dropdown.hidden;
  }

  // ---- Event handlers ----

  function onToggleClick(e) {
    // stopPropagation prevents the document-level outside-click
    // handler from immediately re-closing the menu on the same click.
    e.stopPropagation();
    e.preventDefault();
    isOpen() ? close() : open();
  }

  function onDropdownClick(e) {
    // Clicks inside the dropdown must not bubble to the document
    // handler and close the menu before the item's handler runs.
    e.stopPropagation();
  }

  function onItemClick(e) {
    const btn    = e.currentTarget;
    const action = btn.dataset.menuAction;
    close();
    if (action && typeof window.CASEFILE_handleMenuAction === 'function') {
      try { window.CASEFILE_handleMenuAction(action); }
      catch (err) { console.error(TAG, 'Handler threw for', action, err); }
    } else {
      console.info(TAG, 'No handler for action:', action);
    }
  }

  function onDocumentClick() {
    if (isOpen()) close();
  }

  function onDocumentKey(e) {
    if (e.key === 'Escape' && isOpen()) close();
  }

  // ---- Binding ----

  function bind() {
    if (bound) return;

    resolveElements();
    if (!diagnoseIfMissing()) return;

    // Idempotency guard: if index.html somehow got double-included
    // this script, we don't double-bind.
    if (toggle.dataset.menuBound === '1') {
      bound = true;
      return;
    }
    toggle.dataset.menuBound = '1';

    toggle.addEventListener('click', onToggleClick);
    dropdown.addEventListener('click', onDropdownClick);

    dropdown.querySelectorAll('.menu-item').forEach((btn) => {
      btn.addEventListener('click', onItemClick);
    });

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onDocumentKey);

    bound = true;
    console.info(TAG, 'Bound to #menu-toggle.');
  }

  // ---- Lifecycle ----

  function boot() {
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    // Script was loaded after DOM was ready (e.g. deferred or injected).
    boot();
  }

  // Expose for manual testing / debugging in the console.
  window.CASEFILE_Menu = { open, close, isOpen, bind };
})();