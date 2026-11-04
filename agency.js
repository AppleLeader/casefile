'use strict';

const Agency = (() => {

  // --- Upgrade Definitions ---
  const UPGRADES = [
    {
      id: 'upg_lamp',
      name: 'Desk Lamp',
      desc: 'A warm light. Reduces investigation time by 20%.',
      cost: 150,
      reqLevel: 1
    },
    {
      id: 'upg_chair',
      name: 'Ergonomic Chair',
      desc: 'Better posture. +10% reputation from cases.',
      cost: 300,
      reqLevel: 2
    },
    {
      id: 'upg_cabinet',
      name: 'Filing Cabinet',
      desc: 'Sorted evidence. Unlocks the Notebook screen.',
      cost: 500,
      reqLevel: 3
    }
  ];

  function getXPForLevel(level) {
    return level * 100; // Level 1 requires 100 XP, Level 2 requires 200 XP, etc.
  }

  function handleLevelUp() {
    if (!gameState) return;
    let xpNeeded = getXPForLevel(gameState.agencyLevel);
    while (gameState.experience >= xpNeeded) {
      gameState.experience -= xpNeeded;
      gameState.agencyLevel += 1;
      alert(`Agency Level Up! You are now Level ${gameState.agencyLevel}.`);
      xpNeeded = getXPForLevel(gameState.agencyLevel);
    }
  }

  function renderAgencyScreen() {
    // 1. Update Greeting based on progress
    const greeting = document.getElementById('agency-greeting');
    const activeCount = (gameState.activeCases || []).length;
    const completedCount = (gameState.completedCases || []).length;
    
    if (activeCount > 0) {
      greeting.textContent = `You have ${activeCount} active case(s). Tap 'Cases' below to investigate.`;
    } else if (completedCount > 0) {
      greeting.textContent = `You've closed ${completedCount} case(s). Keep building your reputation.`;
    } else {
      greeting.textContent = `A quiet office. Check the Cases tab to find work.`;
    }

    // 2. Update basic stats
    handleLevelUp(); // Check if we leveled up since last render
    document.getElementById('active-case-count').textContent = activeCount;
    document.getElementById('completed-case-count').textContent = completedCount;
    document.getElementById('agency-level-val').textContent = gameState.agencyLevel;
    document.getElementById('agency-xp-val').textContent = `${gameState.experience} / ${getXPForLevel(gameState.agencyLevel)}`;

    // 3. Render Upgrades
    const list = document.getElementById('upgrade-list');
    if (!list) return;
    list.innerHTML = '';

    UPGRADES.forEach(upg => {
      const isOwned = (gameState.ownedUpgrades || []).includes(upg.id);
      const canAfford = gameState.money >= upg.cost;
      const levelCheck = gameState.agencyLevel >= upg.reqLevel;

      const el = document.createElement('div');
      el.className = `upgrade-card ${isOwned ? 'owned' : ''}`;
      
      let btnHtml = '';
      if (isOwned) {
        btnHtml = `<span class="upg-owned-text">Owned</span>`;
      } else if (!levelCheck) {
        btnHtml = `<span class="upg-locked-text">Requires Level ${upg.reqLevel}</span>`;
      } else {
        btnHtml = `<button class="upg-buy-btn" data-id="${upg.id}" ${canAfford ? '' : 'disabled'}>Buy ($${upg.cost})</button>`;
      }

      el.innerHTML = `
        <div class="upg-info">
          <div class="upg-name">${upg.name}</div>
          <div class="upg-desc">${upg.desc}</div>
        </div>
        <div class="upg-action">${btnHtml}</div>
      `;
      list.appendChild(el);
    });

    // Wire buttons
    list.querySelectorAll('.upg-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => buyUpgrade(btn.dataset.id));
    });
  }

  function buyUpgrade(id) {
    const upg = UPGRADES.find(u => u.id === id);
    if (!upg) return;
    if (gameState.money < upg.cost) return alert('Not enough money.');
    if (gameState.ownedUpgrades.includes(id)) return;

    gameState.money -= upg.cost;
    gameState.ownedUpgrades.push(id);
    saveGameStateIntoCurrentSlot();
    
    // Call global render to update money in the top bar
    if (typeof renderAll === 'function') renderAll();
    renderAgencyScreen(); // Re-render this screen
  }

  return { renderAgencyScreen };
})();