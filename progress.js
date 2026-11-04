'use strict';

const ProgressUI = (() => {

  const ACHIEVEMENTS = [
    { id: 'first_case',   name: 'First Case Solved',      desc: 'Close your first investigation.',                check: (s) => (s.completedCases || []).length >= 1 },
    { id: 'two_cases',    name: 'Two for Two',            desc: 'Close two investigations.',                      check: (s) => (s.completedCases || []).length >= 2 },
    { id: 'level_2',      name: 'Getting Somewhere',      desc: 'Reach Agency Level 2.',                          check: (s) => (s.agencyLevel || 1) >= 2 },
    { id: 'level_3',      name: 'Small Business',         desc: 'Reach Agency Level 3.',                          check: (s) => (s.agencyLevel || 1) >= 3 },
    { id: 'rep_10',       name: 'A Good Name',            desc: 'Reach Reputation 10.',                           check: (s) => (s.reputation || 0) >= 10 },
    { id: 'rep_20',       name: 'Talk of the Town',       desc: 'Reach Reputation 20.',                           check: (s) => (s.reputation || 0) >= 20 },
    { id: 'all_ev_001',   name: 'Thorough',               desc: 'Find every piece of evidence in CASE-001.',      check: (s) => {
        if (typeof CASE_DATA === 'undefined') return false;
        const c = s.cases && s.cases['case_intro_001'];
        return c && c.progress && c.progress.discovered && c.progress.discovered.length >= CASE_DATA.evidence.length;
      } },
    { id: 'all_ev_002',   name: 'Bird Watcher',           desc: 'Find every piece of evidence in CASE-002.',      check: (s) => {
        if (typeof CASE_DATA_002 === 'undefined') return false;
        const c = s.cases && s.cases['case_002'];
        return c && c.progress && c.progress.discovered && c.progress.discovered.length >= CASE_DATA_002.evidence.length;
      } },
    { id: 'buy_upgrade',  name: 'Interior Decorator',     desc: 'Buy your first office upgrade.',                 check: (s) => (s.ownedUpgrades || []).length >= 1 },
    { id: 'five_k',       name: 'Five Figures',           desc: 'Earn $5,000 in total money.',                    check: (s) => (s.money || 0) >= 5000 }
  ];

  function render() {
    if (typeof gameState === 'undefined') return;
    const container = document.querySelector('.screen[data-screen="progress"]');
    if (!container) return;

    // Basic stats
    const level = gameState.agencyLevel || 1;
    const reputation = gameState.reputation || 0;
    const xp = gameState.experience || 0;
    const completed = (gameState.completedCases || []).length;
    const active = (gameState.activeCases || []).length;

    document.getElementById('prog-level').textContent = level;
    document.getElementById('prog-reputation').textContent = reputation;
    document.getElementById('prog-xp').textContent = xp;
    document.getElementById('prog-cases-completed').textContent = completed;
    document.getElementById('prog-cases-active').textContent = active;

    // XP bar (matches Agency.getXPForLevel formula: level * 100)
    const xpNeeded = level * 100;
    const pct = Math.min(100, (xp / xpNeeded) * 100);
    document.getElementById('prog-xp-bar').style.width = pct + '%';
    document.getElementById('prog-xp-label').textContent = `${xp} / ${xpNeeded} XP to next level`;

    // Total evidence + interviews across all cases
    let totalEvidence = 0;
    let totalInterviews = 0;
    if (gameState.cases) {
      Object.values(gameState.cases).forEach((c) => {
        if (c.progress) {
          totalEvidence += (c.progress.discovered || []).length;
          totalInterviews += (c.progress.interviewed || []).length;
        }
      });
    }
    document.getElementById('prog-evidence-total').textContent = totalEvidence;
    document.getElementById('prog-interviews-total').textContent = totalInterviews;

    // Achievements
    const list = document.getElementById('prog-achievements');
    list.innerHTML = ACHIEVEMENTS.map((a) => {
      const unlocked = a.check(gameState);
      return `
        <div class="achievement ${unlocked ? 'unlocked' : ''}">
          <div class="achievement-badge">${unlocked ? '★' : '☆'}</div>
          <div class="achievement-info">
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  return { render };
})();