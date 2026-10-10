# Mecha Customizer Spec — extracted from GENRE_RESEARCH.md §11

> **Provenance:** §11 SYNTHESIS verbatim from `docs/GENRE_RESEARCH.md` (migrated from theyard `research/genre-study-theyard`). Section numbers kept traceable. §11 is the researcher's synthesis/recommendation (not researched fact) — see the doc's own disclaimer.

## 11. SYNTHESIS — concrete recommendations for theyard

> Everything below is **recommendation** (my synthesis of the research above), not
> researched fact.

### A. The modular mecha customizer

- **Slot layout (per mech):** head, torso/core, right arm, left arm, legs, backpack,
  armor plates, ranged weapon, melee weapon — 9–11 slots, mirroring Gundam Breaker 4's
  proven granularity.
- **Dual-mode configs:** every slot takes a part assignment **per mode** (racer mode /
  derby mode, extensible to more). The customizer's live 3D preview **animates the
  transformation** between the two configs — this is the owner's explicit requirement.
- **Constraints:** a tonnage/weight budget (Armored Core-style) plus hardpoint typing
  (MechWarrior-style: e.g., only plow/blade parts in the ram slot, only boosters in
  the engine slot). Constraints create build identity and keep balance tractable.
- **Economy:** parts earned by **breaking them off rivals** in derby events (Gundam
  Breaker loot loop) plus a shop; **full sellback, zero respec penalty** (Armored Core
  VI's rule) so players experiment freely.
- **Expression layer:** Builder's-Parts-style pure-cosmetic slots (horns, spikes,
  plating, decals) + per-part paint/weathering. Zero balance cost, infinite identity.
- **Stats that matter:** per-part contributions to speed, handling, armor/durability,
  ram damage, boost capacity — and the numbers must *visibly* change how the mech
  drives/fights, or the customizer is decoration.

### B. Demolition-derby / racing gameplay

- **Core loop:** FlatOut's nitro-from-carnage — boost/ability meters fill from hits,
  airtime, and environmental destruction. Aggression is fuel.
- **Damage model:** per-part damage states (scratched → cracked → torn off) with
  **handling consequences by location** (Wreckfest's lesson, scoped down from full
  soft-body): damaged leg = worse turning, damaged arm = weaker melee, cracked torso
  armor reveals biomech tissue (the EVA-inspired money shot).
- **Event types:** circuit races, arena deathmatches, figure-8 (built for collisions),
  stunt events, and multi-win-condition events (race / wreck-the-field / objective —
  the Carmageddon format minus its problematic content).
- **AI rivals:** named personalities with grudges and driving styles (FlatOut 2's
  cheapest high-value feature).
- **Scope guardrails:** complete offline single-player first (career + customizer);
  treat online multiplayer as a stretch goal (the AllStars shutdown is the warning).

### C. The transformation mechanic (owner-confirmed core)

- **Design it as a combat verb with a cost:** transform-at-will like Fall of
  Cybertron, but every switch costs something — a momentum dip, a brief vulnerability
  window, or meter spend. Free switching with no tradeoff gets ignored or exploited.
- **Gate the best forms:** a Grimlock-style rage/power meter — deal/take derby damage
  to charge a **Berserk/Breach mode** (restraints-off, EVA-inspired: armor plates shift,
  tissue exposed, bestial movement, big power spike on a timer). This is the
  transformation fantasy the owner named.
- **Racer mode vs. derby mode roles:** racer = speed, handling, slipstream; derby =
  armor, ram damage, melee. Tracks and arenas must *demand* switching (tight
  technical circuit sections → derby-mode shortcuts through destructible barriers;
  open straights → racer mode). This directly answers Fall of Cybertron's critique.
- **Readability:** the switch must read instantly — stance change, unfolding panels,
  glow/color shift, distinct audio. Rivals and spectators know your mode at a glance.
- **Delta check (from §13c):** racer mode must be *dramatically* faster and more
  agile; derby mode *dramatically* tougher and harder-hitting. Rise of the Dark
  Spark's "slightly faster, less mobile" car mode got ignored 80% of the time. If a
  mode isn't obviously the best tool for a situation, the mechanic dies.

### E. Transformation — per-mode customizer, triggers/costs/balancing, technical approach (owner core mechanic)

> Everything in subsection E is **recommendation** (built on the researched patterns
> in §13), not researched fact. Original designs only — inspired by, never copies.

**E1. Per-mode configurations in the modular customizer**
- Data model: each mech carries **2+ mode configs** — `mech.modes.racer.slots`,
  `mech.modes.derby.slots` — every slot (head, torso/core, right arm, left arm,
  legs, backpack, armor plates, ranged weapon, melee weapon) takes a part assignment
  **per mode**. Validate each mode independently: tonnage/weight budget and
  hardpoint typing are checked per mode, so a racer config can't smuggle derby-only
  armor in, and vice versa.
- Mode-exclusive part tags: parts are tagged `racer | derby | both`; e.g., plow/blade
  parts are derby-only, slipstream fairings racer-only. This keeps both modes
  visually and statistically distinct and gives the part library a reason to be
  twice as deep.
- The customizer's live 3D preview **animates the full transformation between the
  player's two configs** (owner requirement) — scrubable, so the player can check
  panel clearance, silhouette change, and readability before committing.
- New Gundam Breaker community tension (§13g) is the warning: free part mixing
  breaks per-part transformation logic. Solve it the way the community suggested —
  **the chassis defines the transformation animation**; parts attach to named
  hardpoints that the animation already moves. No per-part custom transforms.

**E2. Transformation triggers, costs, and balancing (derby/racing)**
- **Input:** single dedicated button (WfC's thumbstick-click proved frictionless),
  transform-at-will.
- **Cost — the mode-switch meter:** every switch costs meter, which refills from
  the nitro-from-carnage loop (§7.1: hits, airtime, destruction). This ties the
  core mechanic into the aggression economy — you transform more by fighting more.
  Meter prevents spam-switching and gives rivals a readable window to punish.
- **Commitment — transition vulnerability:** the switch takes ~0.6–1s (pre-baked
  animation; technical note below). During transition the mech can't attack — it's a
  commitment, not an escape freebie. (Optional later: Devastation-style combo-end
  "attack-transform" with a tight input window for skilled players.)
- **Berserk/Breach mode:** a third, rage-gated form per mech — Grimlock-style rage
  meter built by dealing/taking derby damage; AC-VI-style limited use, ~10s
  duration; restraints-off EVA aesthetics (armor plates shift, tissue exposed,
  bestial movement). Build-chosen, not loadout-chosen: each chassis has exactly one
  Breach configuration.
- **When transformation is tactically useful (design spec, not vibes):**
  - *Derby mode → racer mode:* escape a gang-up, chase a fleeing rival, hit boost
    pads / straight sections, cross the arena faster.
  - *Racer mode → derby mode:* ram through destructible barriers/shortcuts, tank
    a hit, grapple-melee range, shove rivals into walls for style points.
  - *Breach mode:* behind on damage, outnumbered, or final-lap desperation — a
    comeback tool on a timer, never a win button.
- **Level design must demand it (§13h net rule):** every track/arena ships with
  mode-gated opportunities — destructible barrier shortcuts only ram-through in
  derby mode, long straights where racer mode is strictly faster, pickup lanes that
  reward either mode choice. Multi-win-condition events (§7.8) multiply the reasons
  to switch.
- **Anti-patterns, codified:** (1) never script-lock transformation mid-event
  (Dark Spark fury); (2) never reduce combining to QTEs (Mega Battle); (3) never
  let the racer↔derby delta shrink to "slightly faster" (Dark Spark); (4) don't
  story-lock core forms — both modes are available from the first race.

**E3. Technical approach for a small-team build**
- **Transformation = state machine, not simulation.** Two validated configs per
  chassis; one pre-baked transition animation per chassis (0.6–1s), authored once
  and reused for every part loadout — parts ride the chassis's named hardpoints.
  On switch: play animation (masked with flash/particles/audio like Devastation's
  cue), then hot-swap collision volumes, stat profiles, and control scheme.
  This is a **rig + animation** task, affordable for a small team; it is not a
  procedural-mesh-morphing task.
- **Parts only swap in the garage (Armored Core rule):** mid-event "reconfiguration"
  is the transformation state machine only. This keeps balance tractable and the
  animation budget bounded — N chassis × 1 transition animation, not N×M parts ×
  animations.
- **Prototype order:** (1) two configs + instant switch with stat delta, tune the
  delta until each mode is strictly best at its job; (2) add meter cost + transition
  vulnerability; (3) then author the transition animation; (4) Breach mode last.
  Never prototype the animation before the gameplay delta — a beautiful transform
  into a useless mode is the FoC outcome.

### D. Documentation & production next steps (proposed)
   as theyard's next design doc — the research above is its source list.
2. Write the **transformation design** (triggers, costs, mode roles, Berserk gating)
   before any animation work — it drives rig and part requirements.
3. Build the **damage-state art** (armor crack/tissue reveal) early — it's the game's
   signature visual and validates the biomech direction.
4. Prototype **derby contact feel** (per-part hit response + handling effects) before
   content scale — physics quality is the genre's identity (FlatOut 3 lesson).
5. Keep a **part-library content plan**: every part = loot + shop item + expression
   tool. The library is the content moat.

---

