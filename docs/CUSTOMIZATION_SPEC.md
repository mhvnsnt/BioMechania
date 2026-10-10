# BioMechania Customization + Skins/Textures — System Spec

> **Owner direction (2026-10-10, binding):** each character has its OWN weapons
> and parts — every character ships with a distinct part kit. AND players can
> customize on top: **swap parts across slots** + **reskin with skins/textures**.
> So: unique character kits AND a universal part-swap + skin/texture layer.
>
> **Status:** spec only, no implementation. Nothing here is canon gameplay until
> the owner approves the spec.
>
> **Provenance:** builds on `docs/MECHA_CONTRACT.md` (contract v2, 7 slots,
> N modes), `docs/MECHA_CUSTOMIZER_SPEC.md` (§11 synthesis — garage rules),
> the ConcreteDragon texture-variant system (`docs/TEXTURE_VARIANTS.md`,
> tint × texture multiply, style-not-power), and the Bannon 7-item
> customization suite (manifests, per-character saved builds, non-destructive
> decal overlays, live 3D preview).

---

## 0. Vocabulary

- **Character kit** — the set of parts designed for one character: one full
  7-slot part set per mode (racer / combat / breach), all original designs
  for that character. The kit is the character's identity: "scout's parts
  look like scout's."
- **Garage / MechaBay** — the existing `src/components/mecha-bay.tsx` UI,
  extended by this spec.
- **Swap** — equipping a part from a different character's kit into a slot.
- **Skin** — a full appearance package: material variants + texture maps +
  optional decals, applied over parts. Style-only, never stats.
- **Paint job** — a mech-wide skin preset (one tap to re-theme the whole mech).
- **Decal/emblem** — a small overlay graphic (number, stripe, sigil) on a
  per-slot basis. Non-destructive — never writes to the base mesh.

---

## 1. Part-swap rules

### 1.1 Slot compatibility (the hard rules)

The 7-slot system is the law: `head`, `torso`, `arms`, `legs`, `shoulders`,
`backpack`, `weapon`. Swaps obey the existing contract, extended:

1. **Slot match is mandatory.** A part only equips into its own slot —
   a head part never goes in the weapon slot. (Existing validation:
   "part slot matches build slot.")
2. **Mode tags are mandatory.** Parts carry a `modes` array (`racer`,
   `combat`, both). A racer-only aero part is rejected in combat mode and
   vice versa — checked per mode, independently. (Existing validation.)
3. **Socket contract.** The torso is the root of the hierarchy. A swapped
   torso must carry every `REQUIRED_TORSO_SOCKETS` node
   (`socket_head`, `socket_arm_l/r`, `socket_leg_l/r`, `socket_shoulder_l/r`,
   `socket_back`); the arm part must carry `socket_weapon_r` for the weapon
   mount (fallback: torso's `socket_arm_r`). If a socket is missing, the swap
   is rejected with a named reason ("missing socket_back") — never a silent
   fail or a floating part.
4. **Pair slots stay paired.** `arms` / `legs` / `shoulders` ship one part id
   covering both sides (GLB carries both halves). No single-arm equipping —
   this keeps the silhouette symmetric and the part library bounded.

### 1.2 Cross-character swaps

- **Any owned part can go in any matching slot, from any character's kit.**
  Scout's `weapon-scrapblade` fits any character's weapon slot; bruiser's
  `arms-bruiser` fits any arms slot.
- **The kit is the default, not a cage.** New mechs load their character's
  full kit (identity preserved); swapping is opt-in experimentation.
- **Torso swaps are allowed but re-validate the whole build.** The torso is
  the chassis: swapping it changes socket positions, so every attached part
  re-runs socket validation. If a part no longer mounts cleanly, it's flagged
  (not silently unequipped — the player sees exactly what broke and why).
- **Breach sets are character-locked by design.** Each character's breach
  form is its signature rage form (built per the parts lane, 7
  breach-exclusive parts per character). Breach parts swap freely *within*
  the character's own breach kit across... nothing — a character has one
  breach set. Cross-character breach swaps are **not allowed**: the breach
  form is the character's identity peak, and the transform animation is
  authored per chassis (see §1.4).

### 1.3 Stat effects

- **Unchanged formula, recomputed live.** Per mode: `armor = Σ armor`,
  `power = Σ power`, `weight = Σ weight`,
  `speed = max(0, Σ speed − 0.25 × weight)`. (Existing `stats.ts`.)
- **Every swap updates the stat bars immediately** in the customizer —
  the player sees the tradeoff before committing (Armored Core's rule:
  constraints create build identity).
- **No hidden stats.** Every number shown is a number the game uses.
- **Skins never touch stats** (style-not-power law, §2).

### 1.4 Transform-integrity rules (what breaks a transformation)

Per `MECHA_CUSTOMIZER_SPEC.md` §E: **the chassis defines the transformation
animation; parts ride named hardpoints the animation already moves.** No
per-part custom transforms. From this, the integrity rules:

1. **Every slot must be filled in every mode** — a missing part in any mode
   blocks the build from saving ("combat mode: legs slot empty"). Existing
   validation.
2. **Mode-tag violations block the build** — a part that doesn't list the
   mode it's equipped in fails validation with the part named.
3. **Socket failures block the build** — torso missing a required socket,
   or arm missing `socket_weapon_r` while a weapon is equipped.
4. **Transition preview is the proof.** The customizer's live 3D preview
   animates the full transformation between the player's mode configs
   (owner requirement, §E1) — scrubable, so the player checks panel
   clearance and readability before committing. If the preview shows parts
   clipping or floating, the build is *flagged* (warning, not a block) —
   because hardpoint mounts are authored, this should be rare; when it
   happens it's a parts-lane bug, not a player error.
5. **Parts only swap in the garage** (Armored Core rule, §E3). Mid-event
   "reconfiguration" is the transformation state machine only — never a
   part swap. This keeps the animation budget at N chassis × 1 transition,
   not N×M parts × animations.

### 1.5 Unlock / ownership

- **Parts are earned, not bought into power.** Primary loop: break parts off
  rivals in derby events (Gundam Breaker loot loop — `GENRE_RESEARCH.md`
  §11A). Secondary: in-game shop for credits.
- **Full sellback, zero respec penalty** (Armored Core VI's rule) — players
  experiment freely; the garage never punishes curiosity.
- **Character kits unlock with the character.** You own the character, you
  own its kit. Individual cross-character parts unlock via loot/shop.
- **Ownership is per-part-id, stored in the player profile** (see §4), not
  per-build — one unlock, equippable on every mech that has the slot.
- **No pay-to-win.** If monetization ever touches parts, it touches
  *cosmetics* (skins, §2) — never stat-bearing parts. (Owner's free-first
  stance makes this a standing rule, not a suggestion.)

---

## 2. Skin / texture system

### 2.1 Design principles

- **Style-not-power.** Skins never affect stats, hitboxes, or abilities.
  (ConcreteDragon's binding rule.)
- **Tint × texture multiply.** Final pixel = texture map × tint color —
  the proven ConcreteDragon pattern (`docs/TEXTURE_VARIANTS.md`). Tint is a
  per-skin color; the texture map carries the painted detail (panel lines,
  wear, biomech veining).
- **CC0-clean or owned.** Only CC0 / public-domain / owner-made textures.
  Source logged in the asset manifest. (ConcreteDragon's binding rule.)
- **Character Look Law.** Every skin must carry the biomech design language
  in the same style — ribbed organic plating over mechanical frames,
  demolition-derby grit — never flat untextured parts. (ConcreteDragon's
  binding rule, adapted.)

### 2.2 Material variants

Parts are built with the builder's `M()` (standard Principled BSDF) and
`E()` (emissive) materials (`tools/mecha-parts/build_parts.py`). Skins
operate as **material parameter overrides**, not new materials:

- **Base variant** — the part's authored look (the builder's palette:
  industrial derby grit, no EVA purple/green).
- **Skin variants** — named parameter sets applied at load time in the
  viewer: `{ baseColor tint, metallic, roughness, emission color/strength }`.
  Same material slots, different numbers. Zero new shaders, zero new draw
  calls.
- **Emissive is a first-class skin channel.** Breach glow, eye lenses, soul
  sigils — the `E()` materials expose `emission color + strength` per skin,
  so a "molten" skin can run the whole mech hot without touching geometry.

### 2.3 Texture slots (per skin)

Each skin may provide up to three maps, applied per part where the part's
UVs support it:

| Slot | Channel | Purpose |
|---|---|---|
| `albedo` | base color × tint | painted detail: panel lines, wear, biomech veining |
| `roughness` | roughness | matte vs. polished zones (scuffed armor vs. chrome trim) |
| `emissive` | emission mask | glow zones that follow the skin's palette (under-glow, vents) |

- Maps are **1024×1024 max** (512 for common-tier, §2.6 performance budget).
- sRGB for albedo/emissive; linear for roughness (ConcreteDragon's
  plumbing rule).
- A skin may ship **fewer** than three maps — missing slots fall back to
  the part's authored values. Tint-only skins (no maps) are the cheapest
  tier and the most numerous.

### 2.4 Decal / emblem layer

- **Non-destructive overlay** (Bannon face-paint pattern): decals are
  separate conformed meshes / projected quads — the base mesh is never
  written.
- **Per-slot placement.** Each of the 7 slots accepts one decal (number
  roundel, hazard stripe, clan sigil, kill tally).
- **Player emblems** are drawn from a curated set (no free text on mechs —
  moderation is out of scope; preset emblems only).
- **Character signature decals are kit-locked** — scout's sigil stays on
  scout's kit unless the player owns that character (identity protection).

### 2.5 How skins compose with parts

- **Scope options:** a skin applies at one of three scopes —
  (a) **single part** (this arm only), (b) **single slot** (both arms),
  (c) **whole mech** (all slots, all modes). Whole-mech = "paint job."
- **Resolution order:** part scope > slot scope > mech scope > base
  authored look. The most specific assignment wins; everything else falls
  through.
- **Per-mode skins.** Skins are stored per mode config — racer mode can run
  a different paint job than combat mode (transformation readability:
  the color shift is part of the mode read).
- **Swapped parts keep their skins.** A part carries its own part-scope
  skin assignments across builds — put bruiser's arm on scout's chassis
  and the arm keeps bruiser's paint unless you repaint it.

### 2.6 Rarity tiers

| Tier | Source | Texture budget |
|---|---|---|
| **Stock** | character kit default | authored look, no skin |
| **Common** | shop, cheap | tint-only, no maps |
| **Rare** | derby loot, event rewards | tint + albedo 512 |
| **Epic** | boss/rival takedowns, achievements | tint + albedo + roughness 1024 |
| **Legendary** | one-offs, owner drops | full 3-map 1024 + exclusive decal + emissive theme |

- Rarity is **drop-rate and flex**, never power. (Style-not-power.)
- Legendary skins are **never sold** — earned or gifted only. Scarcity is
  the product.

### 2.7 Performance budget

- **Skins add zero draw calls.** Material parameter overrides only; texture
  maps reuse the part's existing material slots.
- **Texture memory cap:** 256 MB total for the skin library on target
  hardware; LRU eviction for non-equipped skins.
- **Max 64 active skins** in the player library; the garage pages the rest.
- **Decals:** one overlay mesh per slotted decal, max 7 per mech —
  trivial geometry, batched where the renderer allows.
- **No runtime texture painting.** All maps are authored or generated
  offline; the client only multiplies and assigns.

---

## 3. MechaBay UI/UX for the customizer

> **Human-perspective law applies in full:** touch targets are human-sized,
> one screen one job, glanceable hierarchy, breathing room, built for thumbs
> on a phone. The existing `mecha-bay.tsx` is dense desktop UI — the
> customizer screens below are its replacement pattern, not its extension.

### 3.1 Screen map (one screen, one job)

| Screen | Job | Key controls |
|---|---|---|
| **Garage** | pick a mech | big mech cards (3D thumb + name + mode stats), "New build" button |
| **Build** | swap parts per mode | mode tabs (RACER / COMBAT / BREACH) → slot rows → part picker sheet |
| **Paint** | skins + decals | scope switch (part/slot/mech) → skin grid → tint picker → decal picker |
| **Preview** | verify the build | live 3D, scrubable transform animation, stat bars, damage-state toggle |
| **Share** | export the build | share code, copy link, QR — see §4 |

- **Bottom-tab navigation**, thumb-reachable. No nested hamburger menus.
- **The 3D preview is persistent** — a collapsible viewport pinned above
  every screen, so every choice is seen on the mech instantly.
- **Part picker = bottom sheet**, not a dropdown: big part cards with 3D
  thumbnails, stat deltas (+2 armor / −1 speed) in plain language, ownership
  badge (owned / loot source / shop price). One tap equips.

### 3.2 Interaction rules

- **Every destructive action confirms** (sell part, delete build) — one
  confirm, no double-modals.
- **Every stat change previews** — bars animate to the new values before
  the player commits the swap.
- **Transform scrubber** on the Preview screen: drag through the 24-frame
  transition; the player watches panel clearance themselves (owner
  requirement from §E1).
- **Empty states teach.** No parts for a slot yet? The slot shows where to
  earn one ("Break arms off rivals in derby events") — a tutorial that
  never feels like one.
- **Offline-first.** The whole customizer works with no connection; sharing
  (§4) is the only network feature.

---

## 4. Persistence + sharing

### 4.1 Local persistence (extends existing `storage.ts`)

- **Store version bumps to v2** (`biomechania.mechs.v2`). v1 builds migrate
  forward automatically (kit defaults fill new fields).
- **Extended build record:**

```ts
type CustomizedBuild = MechBuild & {
  skins: Record<MechMode, Record<Slot | "mech", SkinAssignment>>;
  decals: Record<MechMode, Record<Slot, DecalId | null>>;
  paintJobs: Record<MechMode, PaintJobId | null>; // whole-mech presets
};
type PlayerProfile = {
  ownedParts: PartId[];      // cross-character unlocks
  ownedSkins: SkinId[];      // includes rarity tier
  credits: number;           // shop currency (earned in-game)
};
```

- **Zero-loss saves.** Every screen autosaves to localStorage on change
  (existing `subscribeMechs` event pattern); the explicit Save button
  names/snapshots a build.

### 4.2 Sharing

- **Share codes** (Bannon's DNA-recipe pattern): a build — parts, skins,
  decals, transform config — serializes to a short code. Paste a code to
  import; missing parts/skins show as "not owned" placeholders the player
  can hunt down (loot chase, not a paywall).
- **No accounts required** for local play and code sharing. If a future
  online layer arrives, codes become URLs — the format is already portable.
- **Showcase:** an in-garage "featured builds" row (curated by the owner)
  teaches new players what good builds look like.

---

## 5. Implementation phases (smallest shippable slice first)

> Each phase ships to the player. No phase starts until the previous one is
> merged and the owner has seen it.

### Phase 1 — Cross-character part swap (the core verb)
- Extend `mecha-bay.tsx` (or its replacement screens, §3) with the part
  picker bottom sheet: any owned part, any matching slot, per mode.
- Socket + mode-tag validation with named failure reasons.
- Live stat-bar recompute per swap.
- Breach kits stay character-locked (no UI for breach swaps).
- **Shippable:** players can already build wild cross-character mechs.

### Phase 2 — Tint skins (the cheapest expression)
- Tint-only skin tier: per-skin color + material parameter overrides
  (metallic/roughness/emission) applied at load in the viewer.
- Paint screen with scope switch (part/slot/mech); per-mode paint jobs.
- Style-not-power enforced in code (skins excluded from `stats.ts`).
- **Shippable:** every mech repaintable in seconds, zero new textures.

### Phase 3 — Texture maps + decals
- Albedo/roughness/emissive map support per §2.3; skin registry +
  asset-manifest pattern (ConcreteDragon's `TEXVARIANTS` pattern).
- Non-destructive decal overlay layer, per-slot, preset emblems.
- Rarity tiers + loot/shop wiring for skin acquisition.
- **Shippable:** the full expression layer.

### Phase 4 — Sharing + showcase
- Share-code serialize/import; "not owned" placeholder flow.
- Featured builds row in the garage.
- **Shippable:** builds travel between players.

### Explicitly out of scope (not this system)
- Mid-event part swapping (garage-only rule, §1.4.5).
- Free-text decals or player-uploaded textures (moderation out of scope).
- Trading or marketplace (economy decision the owner hasn't made).
- Stat-bearing skins (banned by the style-not-power law, permanently).

---

## 6. Open owner calls

1. **Breach cross-character policy** — this spec locks breach kits to their
   character. If the owner later wants breach part mixing, the transform
   animation must be re-authored per combination (expensive) — flagging now
   so it's a deliberate reversal, not drift.
2. **Legendary skin sources** — "owner drops" is a placeholder; the owner
   decides what earns a Legendary.
3. **Monetization boundary** — this spec assumes cosmetics-only IF money
   ever touches the system. The owner's free-first stance is recorded;
   any change needs his explicit call.
