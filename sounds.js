/* =========================================================
   CASEFILE — Sound effects
   Small synthesized tones, no external files.
   ========================================================= */

'use strict';

const Sounds = (() => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;

  function ensureCtx() {
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function beep(freq, duration, volume, type) {
    try {
      const c = ensureCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch (e) { /* silent fail */ }
  }

  // UI click — short high tick
  function click() {
    beep(880, 0.06, 0.08, 'square');
  }

  // Question advance — subtle tick
  function tick() {
    beep(660, 0.08, 0.06, 'sine');
  }

  // Evidence found — two-note rise
  function evidence() {
    beep(523, 0.12, 0.1, 'sine');
    setTimeout(() => beep(784, 0.15, 0.1, 'sine'), 100);
  }

  // Case solved — four-note arpeggio
  function solved() {
    beep(523, 0.15, 0.12, 'sine');
    setTimeout(() => beep(659, 0.15, 0.12, 'sine'), 120);
    setTimeout(() => beep(784, 0.2, 0.12, 'sine'), 240);
    setTimeout(() => beep(1046, 0.3, 0.12, 'sine'), 380);
  }

  // Wrong accusation — low descending tone
  function fail() {
    beep(330, 0.2, 0.1, 'triangle');
    setTimeout(() => beep(262, 0.3, 0.1, 'triangle'), 160);
  }

  return { click, tick, evidence, solved, fail };
})();
