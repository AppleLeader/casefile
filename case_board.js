/* =========================================================
   CASEFILE — Evidence Board
   Cards are auto-placed, immovable, and clickable for a
   short explanation. Two taps connect two cards if the case
   defines a relationship between them.

   Layout storage: board.cards is now just an order-preserving
   map of "card was placed at this slot". The player can't
   drag cards, so the position is deterministic — derived from
   the order in which evidence was discovered. This means the
   board survives refresh without needing saved x/y coords.
   ========================================================= */

'use strict';

const CaseBoard = (() => {

  const CARD_W = 130;
  const CARD_H = 80;

  /* ---------------- Progress helpers ---------------- */

  function getProgress() {
    return (typeof CaseUI !== 'undefined' && typeof CaseUI.getProgress === 'function')
      ? CaseUI.getProgress()
      : null;
  }

  function commit(progress) {
    if (typeof CaseUI !== 'undefined' && typeof CaseUI.commitProgress === 'function') {
      CaseUI.commitProgress(progress);
    }
  }

  function ensureBoard(progress) {
    if (!progress.board) progress.board = { connections: [] };
    if (!Array.isArray(progress.board.connections)) progress.board.connections = [];
    return progress.board;
  }

  /* ---------------- Grid position ----------------
     Cards are laid out in a fixed grid, in the order they
     were discovered. No drag. No re-arrange. The board is
     stable and predictable.                              */

  function gridPosition(index, containerWidth) {
    // Fallback if width is somehow 0 or undefined
    const width = (containerWidth && containerWidth > 100) ? containerWidth : 340;
    const padding = 12;
    const gap = 10;
    
    // Calculate how many columns fit. We cap it at 3 so it doesn't get too spread out on PC.
    const cols = Math.min(3, Math.max(2, Math.floor((width - padding * 2 + gap) / (CARD_W + gap))));
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    const totalGridWidth = cols * CARD_W + (cols - 1) * gap;
    
    // Center the grid, but never let it go past the left padding
    const startX = Math.max(padding, (width - totalGridWidth) / 2);
    
    return {
      x: startX + col * (CARD_W + gap),
      y: padding + row * (CARD_H + gap + 10)
    };
  }

  /* ---------------- Rendering ---------------- */

  function render() {
    const container = document.querySelector('.screen[data-screen="board"]');
    if (!container) return;
    const progress = getProgress();
    if (!progress) {
      container.innerHTML = '<p class="muted" style="padding:20px;">No case loaded.</p>';
      return;
    }

    const board = ensureBoard(progress);
    const discovered = progress.discovered.slice();

    // Get the active case's data (the global CASE_DATA is swapped to the active case)
    const activeCaseData = CaseUI.getCaseData ? CaseUI.getCaseData(CaseUI.getActiveCaseId()) : CASE_DATA;
    const caseEvidence = activeCaseData.evidence || [];
    const orderedEvidence = caseEvidence.filter((e) => discovered.includes(e.id));

    // Measure the window, not the container.
    // The board sits inside #app which is capped at 480px max-width.
    // Subtract 28px for side margins (14px each).
    const appWidth = Math.min(480, window.innerWidth);
    const canvasWidth = appWidth - 28;

    // Compute how many rows and columns we need
    const cols = Math.max(2, Math.floor((canvasWidth - 24 + 10) / (CARD_W + 10)));
    const rows = Math.ceil(orderedEvidence.length / cols);
    const requiredHeight = Math.max(320, 24 + rows * (CARD_H + 20) + 24);

    const cardsHtml = orderedEvidence.map((ev, i) => {
      const pos = gridPosition(i, canvasWidth);
      const categoryClass = `cat-${ev.category || 'document'}`;
      const connected = board.connections.some(([a, b]) => a === ev.id || b === ev.id);
      const connectedClass = connected ? 'has-connection' : '';
      // Deterministic rotation, ±3 degrees, based on card id
      const hash = ev.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const rotation = ((hash % 7) - 3) * 0.9;
      return `
        <div class="evidence-card ${categoryClass} ${connectedClass}"
             data-evidence-id="${ev.id}"
             style="left:${pos.x}px; top:${pos.y}px; --card-rotation: ${rotation}deg;">
          <div class="card-label">${escapeHTML(ev.name)}</div>
        </div>
      `;
    }).join('');

    const missingCount = caseEvidence.length - orderedEvidence.length;

    // Connection lines between cards (using centered positions)
    const lines = board.connections.map(([idA, idB]) => {
      const ia = orderedEvidence.findIndex((e) => e.id === idA);
      const ib = orderedEvidence.findIndex((e) => e.id === idB);
      if (ia < 0 || ib < 0) return '';
      const pa = gridPosition(ia, canvasWidth);
      const pb = gridPosition(ib, canvasWidth);
      const ax = pa.x + CARD_W / 2, ay = pa.y + CARD_H / 2;
      const bx = pb.x + CARD_W / 2, by = pb.y + CARD_H / 2;
      const cx = (ax + bx) / 2;
      const cy = Math.max(ay, by) + 30 + Math.abs(ax - bx) * 0.1;
      return `<path d="M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}"
                    stroke="#7a2f2a" stroke-width="2.5" fill="none"
                    stroke-dasharray="4 3" opacity="0.8" />`;
    }).join('');

    container.innerHTML = `
      <div class="detail-header">
        <button class="back-btn" id="board-back" type="button">‹ Case</button>
        <h2 class="detail-title">Evidence Board</h2>
      </div>
      <p class="board-hint">
        Tap a card to see what it means. Tap one card, then another, to see if they connect.
      </p>
      <div class="board-tray">
        <span class="tray-label">Evidence found: ${orderedEvidence.length} / ${caseEvidence.length}</span>
        ${missingCount > 0
          ? `<span class="tray-note">${missingCount} more to find.</span>`
          : `<span class="tray-note all-found">All evidence found.</span>`}
      </div>
      <div class="board-canvas" style="min-height: ${requiredHeight}px;">
        <svg class="board-lines" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${requiredHeight}">${lines}</svg>
        ${cardsHtml || '<p class="muted" style="padding:20px;">Nothing on the board yet. Examine objects at locations to find evidence.</p>'}
      </div>
      <div class="board-footer">
        <button class="slot-btn" id="board-clear" type="button">Clear connections</button>
      </div>
      <div class="board-msg-slot" id="board-msg-slot"></div>
    `;

    document.getElementById('board-back').addEventListener('click', () => {
      if (typeof CaseUI !== 'undefined' && typeof CaseUI.renderCaseDetail === 'function') {
        CaseUI.renderCaseDetail();
        showScreen('case-detail');
      } else {
        showScreen('cases');
      }
    });

    document.getElementById('board-clear').addEventListener('click', () => {
      progress.board.connections = [];
      commit(progress);
      render();
    });

    wireCards(progress, orderedEvidence);
  }

  /* ---------------- Card interaction ----------------
     Tap = select (first) or connect (second).
     Long-press does nothing; the board is tap-only.
     Right column with the "explain" behaviour is achieved by
     showing the explanation in a footer panel instead of a modal. */

  let selectedCardId = null;

  function wireCards(progress, orderedEvidence) {
    document.querySelectorAll('.evidence-card').forEach((card) => {
      const id = card.dataset.evidenceId;
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCardTap(id, card, progress);
      });
    });

    // Tap blank board area = deselect
    const canvas = document.querySelector('.board-canvas');
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        if (e.target === canvas || e.target.classList.contains('board-lines')) {
          deselectAll();
          showExplanation('');
        }
      });
    }
  }

  function handleCardTap(id, card, progress) {
    // First tap on this card: show explanation + select
    if (selectedCardId === null) {
      selectCard(id);
      showExplanation(explainText(id));
      return;
    }
    // Second tap on same card: deselect
    if (selectedCardId === id) {
      deselectAll();
      showExplanation('');
      return;
    }
    // Second tap on a different card: try to connect
    const a = selectedCardId;
    const b = id;
    deselectAll();

    const result = CaseEngine.checkConnection(progress, a, b);
    if (!result.ok) {
      showExplanation(reasonText(result.reason));
      return;
    }
    const board = ensureBoard(progress);
    const exists = board.connections.some((c) => c[2] === result.pairKey);
    if (exists) {
      showExplanation('These two are already connected.');
      return;
    }
    board.connections.push([a, b, result.pairKey]);
    commit(progress);
    showExplanation(result.reveals);
    render();
  }

  function selectCard(id) {
    deselectAll();
    selectedCardId = id;
    const el = document.querySelector(`.evidence-card[data-evidence-id="${id}"]`);
    if (el) el.classList.add('selected');
  }

  function deselectAll() {
    selectedCardId = null;
    document.querySelectorAll('.evidence-card.selected').forEach((el) =>
      el.classList.remove('selected'));
  }

  function showExplanation(text) {
    const slot = document.getElementById('board-msg-slot');
    if (!slot) return;
    if (!text) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = `<div class="board-msg">${escapeHTML(text)}</div>`;
  }

  function explainText(id) {
    const ev = CaseEngine.getEvidence(id);
    if (!ev) return '';
    // Just the short description. The full "relevance" is
    // shown in the accusation screen or the notebook later.
    const found = ev.foundAt === 'interview'
      ? ' (from an interview)'
      : (CaseEngine.getLocation(ev.foundAt)?.name || '');
    return `${ev.name} — found at ${found}. ${ev.description}`;
  }

  function reasonText(reason) {
    switch (reason) {
      case 'same-item':              return 'Pick two different pieces of evidence.';
      case 'not-owned':              return 'You don\'t have both of these yet.';
      case 'no-defined-connection':  return 'These two don\'t connect.';
      default:                       return 'Those can\'t be connected.';
    }
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  /* ---------------- Public API ---------------- */

function open() {
  // Ensure we're on the active case's data before rendering.
  if (typeof CaseUI !== 'undefined' && typeof CaseUI.setActiveCase === 'function') {
    CaseUI.setActiveCase(CaseUI.getActiveCaseId());
  }
  render();
  showScreen('board');
}

  return { open };
})();