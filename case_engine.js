/* =========================================================
   CASEFILE — Case Engine
   Pure logic. Consumes CASE_DATA (case_data.js) and a case
   progress object owned by the caller. Does not touch the
   DOM, gameState, or SaveManager. The UI layer (M6-B/C/D)
   supplies the progress object and calls these functions.
   ========================================================= */

'use strict';

const CaseEngine = (() => {

  /* -------------------------------------------------------
     PROGRESS SHAPE
     Every save stores its own progress object. Starting one:
       { caseId, discovered: [], interviewed: [], visited: [],
         chosen: [], accusation: null, resolved: false }
     Nothing else is required. The engine will not mutate the
     progress object except via the returned new object — this
     keeps save semantics clean and future-proof.
     ------------------------------------------------------- */

  function createProgress(caseId) {
    return {
      caseId,
      discovered: [],       // evidence ids the player has
      interviewed: [],      // character ids the player has spoken to
      visited: [],          // location ids the player has entered
      chosen: [],           // dialogue option ids taken
      accusation: null,     // { culpritId, methodId, evidenceIds, score, tierId, resolvedAt }
      resolved: false
    };
  }

  /* -------------------------------------------------------
     LOOKUPS
     ------------------------------------------------------- */
  const byId = (arr, id) => arr.find((x) => x.id === id);

  // Read from window.CASE_DATA if the swap trick set it (CASE-002 active),
  // otherwise fall back to the bare CASE_DATA const (CASE-001).
  function cd() { return (typeof window !== 'undefined' && window.CASE_DATA) || CASE_DATA; }

  function getEvidence(id)   { return byId(cd().evidence, id) || null; }
  function getObject(id)     { return byId(cd().objects, id) || null; }
  function getCharacter(id)  { return byId(cd().characters, id) || null; }
  function getLocation(id)   { return byId(cd().locations, id) || null; }

  /* -------------------------------------------------------
     UNLOCK CHECKING
     ------------------------------------------------------- */
  function hasEvidence(progress, id) {
    return progress.discovered.includes(id);
  }

  function hasAny(progress, ids) {
    return ids.some((id) => hasEvidence(progress, id));
  }

  function hasAll(progress, ids) {
    return ids.every((id) => hasEvidence(progress, id));
  }

  function isLocationUnlocked(progress, locationId) {
    const loc = getLocation(locationId);
    if (!loc) return false;
    if (!loc.unlockRequires || loc.unlockRequires.length === 0) return true;
    return hasAll(progress, loc.unlockRequires);
  }

  function isObjectInspectable(progress, objectId) {
    const obj = getObject(objectId);
    if (!obj) return false;
    if (!obj.requiresEvidence || obj.requiresEvidence.length === 0) return true;
    return hasAll(progress, obj.requiresEvidence);
  }

  /* -------------------------------------------------------
     OBJECT INSPECTION
     Returns { ok, reason?, evidenceId?, alreadyOwned? }
     ------------------------------------------------------- */
  function inspectObject(progress, objectId) {
    const obj = getObject(objectId);
    if (!obj) return { ok: false, reason: 'unknown-object' };
    if (!isObjectInspectable(progress, objectId)) {
      return { ok: false, reason: 'missing-prerequisite' };
    }
    if (!obj.yield) {
      return { ok: true, evidenceId: null };
    }
    const alreadyOwned = hasEvidence(progress, obj.yield);
    return { ok: true, evidenceId: obj.yield, alreadyOwned };
  }

  /* -------------------------------------------------------
     EVIDENCE DISCOVERY (mutation helper for the caller)
     Returns the new progress array so the caller can persist it.
     ------------------------------------------------------- */
  function discoverEvidence(progress, evidenceId) {
    if (!getEvidence(evidenceId)) return progress.discovered;
    if (hasEvidence(progress, evidenceId)) return progress.discovered;
    return progress.discovered.concat([evidenceId]);
  }

  /* -------------------------------------------------------
     CHARACTER DIALOGUE
     Options unlocked if all required evidence is present
     AND the option has not already been chosen.
     ------------------------------------------------------- */
  function getAvailableDialogue(progress, characterId) {
    const ch = getCharacter(characterId);
    if (!ch) return [];
    return ch.dialogue
      .filter((d) => hasAll(progress, d.requiresEvidence || []))
      .filter((d) => !progress.chosen.includes(d.id));
  }

  function chooseDialogue(progress, characterId, optionId) {
    const ch = getCharacter(characterId);
    if (!ch) return { error: 'unknown-character' };
    const opt = byId(ch.dialogue, optionId);
    if (!opt) return { error: 'unknown-option' };
    if (!hasAll(progress, opt.requiresEvidence || [])) {
      return { error: 'missing-prerequisite' };
    }
    if (progress.chosen.includes(optionId)) {
      return { error: 'already-chosen' };
    }

    // Compose the mutation for the caller to persist.
    let discovered = progress.discovered;
    (opt.givesEvidence || []).forEach((evId) => {
      discovered = discoverEvidence({ ...progress, discovered }, evId);
    });
    const interviewed = progress.interviewed.includes(characterId)
      ? progress.interviewed
      : progress.interviewed.concat([characterId]);
    const chosen = progress.chosen.concat([optionId]);

    return {
      ok: true,
      text: opt.text,
      newEvidence: (opt.givesEvidence || []).filter((e) => !hasEvidence(progress, e)),
      next: { ...progress, discovered, interviewed, chosen }
    };
  }

  /* -------------------------------------------------------
     CONNECTIONS
     Two evidence items have a defined connection if one
     lists the other in its linksTo.
     ------------------------------------------------------- */
  function checkConnection(progress, idA, idB) {
    if (idA === idB) return { ok: false, reason: 'same-item' };
    if (!hasEvidence(progress, idA) || !hasEvidence(progress, idB)) {
      return { ok: false, reason: 'not-owned' };
    }
    const a = getEvidence(idA);
    const b = getEvidence(idB);
    const linkFromA = (a.linksTo || []).find((l) => l.with === idB);
    if (linkFromA) return { ok: true, reveals: linkFromA.reveals, pairKey: [idA, idB].sort().join('|') };
    const linkFromB = (b.linksTo || []).find((l) => l.with === idA);
    if (linkFromB) return { ok: true, reveals: linkFromB.reveals, pairKey: [idA, idB].sort().join('|') };
    return { ok: false, reason: 'no-defined-connection' };
  }

  /* -------------------------------------------------------
     ACCUSATION
     ------------------------------------------------------- */
  function evaluateAccusation(progress, accusation) {
    const truth = cd().truth;

    const culpritCorrect = accusation.culpritId === truth.culpritId;
    const method = byId(truth.methodOptions, accusation.methodId);
    const methodCorrect = !!(method && method.correct);

    const evidenceHits = accusation.evidenceIds.filter(
      (id) => truth.proofSet.includes(id)
    );
    const proofCount = evidenceHits.length;
    const culprit = !!culpritCorrect;
    const methodOk = methodCorrect;

    // Pick the first tier whose check passes.
    const tiers = cd().rewardTiers;
    const tier = tiers.find((t) => {
      const c = t.check;
      if (c.culprit !== culprit) return false;
      if (c.method !== methodOk) return false;
      if (proofCount < (c.minProof || 0)) return false;
      return true;
    }) || tiers[tiers.length - 1];

    return {
      culpritCorrect,
      methodCorrect: methodOk,
      proofCount,
      proofTotal: truth.proofSet.length,
      hitEvidence: evidenceHits,
      missedEvidence: truth.proofSet.filter((id) => !evidenceHits.includes(id)),
      tier,
      resolution: culpritCorrect
        ? truth.resolution.correct
        : truth.resolution.wrongCulprit,
      resolvedAt: new Date().toISOString()
    };
  }

  function buildAccusationPayload(culpritId, methodId, evidenceIds) {
    return { culpritId, methodId, evidenceIds: evidenceIds.slice() };
  }

  function summarizeProgress(progress) {
    const data = cd();
    return {
      evidenceFound: progress.discovered.length,
      evidenceTotal: data.evidence.length,
      charactersInterviewed: progress.interviewed.length,
      charactersTotal: data.characters.length,
      locationsVisited: progress.visited.length,
      locationsTotal: data.locations.length,
      canAccuse: progress.discovered.length >= 4,
      resolved: progress.resolved
    };
  }

  return {
    createProgress,
    getEvidence, getObject, getCharacter, getLocation,
    hasEvidence, hasAny, hasAll,
    isLocationUnlocked, isObjectInspectable,
    inspectObject,
    discoverEvidence,
    getAvailableDialogue, chooseDialogue,
    checkConnection,
    evaluateAccusation, buildAccusationPayload,
    summarizeProgress
  };
})();