# Transformation Mechanics — extracted from GENRE_RESEARCH.md §13

> **Provenance:** §13 verbatim from `docs/GENRE_RESEARCH.md` (migrated from theyard `research/genre-study-theyard`). Section numbers kept traceable. IP rule from the source: design *patterns* to learn from, not designs to copy — BioMechania's mechs and forms are original.

## 13. Transformation mechanics in mecha games — researched

> Everything in §13 is **researched fact** (summarized from the sources listed at the
> end), distinct from the recommendations in §11. IP rule: these are design
> *patterns* to learn from, not designs to copy — theyard's mechs and forms must be
> original.

### 13a. Transformers: War for Cybertron (2010) — transform-at-will done right

- **Input:** a single thumbstick click switches between robot and vehicle modes
  near-instantly; reviewers report flipping back and forth *multiple times within the
  same fight* because the switch was fast and frictionless (Escapist review).
- **Mode roles differed by character class** (WorthPlaying review): slower
  characters' vehicle form carried a **backup reserve of more powerful ammunition**
  (robot ammo runs dry → vehicle gun takes over); fast characters used vehicle form
  as a run/mobility replacement; flying vehicles were tactical only in open spaces.
- **Vehicle trade-offs:** smaller target profile, speed, heavy weaponry — but lower
  firing rate and damage than robot mode in the sequel (GameSpy, Capsule Computers).
- **Ammo economy link:** vehicle weapons served as a fallback when robot-mode ammo
  ran out, giving transformation a concrete tactical purpose (GameFAQs/GameSpy
  reviews).
- Takeaway: near-instant switching + per-mode asymmetric roles + ammo/energy economy
  coupling made transformation a real decision, not decoration.

### 13b. Transformers: Fall of Cybertron (2012) — the bolted-on warning, deepened

- Vehicle mode dealt reduced damage at a lower firing rate; reviewers estimated
  ~80% of playtime stayed in robot mode (Capsule Computers, Nintendo Life coverage
  of the same formula in the sequel).
- Vortex was the standout exception: **three forms** (robot / helicopter / jet),
  each with a clear job — helicopter hovers and strafes, jet repositions fast,
  robot clears rooms on foot (GameSpot's D.I.C.E. demo coverage).
- The Eurogamer critique (§3) stands: transformation was bolted-on where levels
  were tight corridors; only the rare open/flying segments demanded it.

### 13c. Transformers: Rise of the Dark Spark (2014) — anti-patterns to avoid

- Nintendo Life review: ~80% of the campaign spent in robot mode; ground vehicles
  were "a slightly-faster, less mobile version of their robot form" — **the mode
  delta was too small to matter**.
- Some scripted segments **forbade transformation entirely** ("the game will inform
  you that you're not allowed to"), which reviewers found infuriating in a game
  titled *Transformers*. Anti-pattern: never arbitrarily hard-lock the core verb.
- FutureFive review: levels were "claustrophobic" with "no room for you to be in
  vehicle mode" — level geometry actively denied the mechanic.
- Lesson for theyard: (1) make the racer↔derby stat delta *large and asymmetric*,
  never "slightly faster"; (2) never script-lock transformation mid-event; (3)
  arenas must physically fit both modes (the FoC warning again).

### 13d. Transformers: Devastation (PlatinumGames, 2015) — transformation as combo verb

This is the best implementation found for transformation *inside combat*:

- **Vehicle Attacks:** at the end of a successfully executed combo, a timed prompt
  (roughly a one-second window) invites you to press the button — the character
  transforms, hurls its vehicle form at the enemy for big damage, then snaps back to
  robot mode to continue the combo (Escapist, GameSpot, GameReactor, Daily Gamepad).
- **Risk/reward with real teeth:** miss the window and you just dodge while the
  combo breaks — opponents punish you. Game cues with audio + popup; "timing has to
  be absolutely spot on" (NukingTheCat review). Deliberate play is rewarded,
  button-mashing is not.
- Vehicle mode also free for traversal at will, and top-speed vehicle attacks could
  break enemy shields (3rd-Strike review).
- Character-specific signature moves on a second power gauge (Optimus manifests his
  trailer as a weapon, Sideswipe flash-steps) show how alternate forms double as
  character identity.
- Takeaway: a tight timing window + a fail penalty + big payoff turns transformation
  into a *skill mechanic* rather than a menu choice.

### 13e. Kamen Rider: Memory of Heroez (2020) — form-change as resource

- **Form Chain System:** pick the form AND the follow-up attack simultaneously —
  changing forms mid-combat and chaining combos through them is the game's whole
  identity ("the form change is a synonym for Kamen Rider," official site via
  Nintendo Life).
- **Stamina cost:** Rider Power (RP) is spent by attacks, dodging, flying, *and*
  changing forms; fully exhausted RP forces a recharge. Perfectly dodging then
  countering instantly refills RP (Kamen Rider fandom wiki).
- **Form change as matchup answer:** boss fights required it — e.g., Kamen Rider
  Double's CycloneMetal form twirls the Metal Shaft to repel a fireball boss attack
  (Siliconera gameplay coverage).
- **Unique attack on change:** performing an attack at the moment of transformation
  costs extra RP but triggers a form-specific move — the "attack-transform" input
  (fandom wiki).
- Cautionary: non-default forms were story-locked (fandom wiki) — fine for a
  narrative game, wrong for theyard where both modes must be available from the
  start.
- Takeaway: charge a stamina-like resource for switching; let a perfect dodge /
  aggressive hit refill it; allow attack-on-transform inputs.

### 13f. Power Rangers games — combining as earned spectacle or gated assist

Two proven templates, from two different games:

- **Earned set-piece (Mighty Morphin Power Rangers: Rita's Rewind, 2024):**
  Dinozords combine into the Megazord as the stage finale, flipping the game into a
  first-person Punch-Out-style boss battle (Game8, Co-Optimus reviews). In co-op,
  players *take turns piloting* the combined form — combining as a team resource.
  Zord segments beforehand are Star Fox-style rail shooters, each Zord with distinct
  abilities.
- **Meter-gated assist (Power Rangers: Battle for the Grid, 2019):** summon the
  Megazord mid-combo as an assist super (press both assist buttons) without
  disrupting the fighting flow (Seafoam Gaming, Nintendo Insider reviews).
- **Anti-pattern (Power Rangers: Mega Battle, 2017):** combining sequences reduced
  to weak-point mashing and timed button prompts — reviewers called them
  underwhelming, a "missed opportunity" (BioGamerGirl).
- Takeaway: combining either *is* a mode you play (earned, climactic) or *is* a
  metered super that punches into a combo — never a QTE sideshow.

### 13g. Gundam / Armored Core — mid-battle reconfiguration

- **Transformable suits in Gundam vs. titles:** suits like the Zeta Gundam switch to
  Wave Rider flight form via a boost+direction input; transformation is a *per-suit
  capability*, not universal (GameFAQs Q&A; GameSpot user review). In these arena
  fighters it's pure mobility/repositioning, with combat still fought in suit form.
- **The customization-transformation tension (community, unverified):** New Gundam
  Breaker forum discussion flagged that full part-swap customization clashes with
  per-suit transformation — transformation requires "a lot of rules," and only a
  minority of designs are transformable. One proposed solution: pre-baked
  transformation animations keyed off a transform-capable backpack part. Treat as
  *unverified community opinion*, but the design tension is real: free mixing breaks
  per-part transformation logic.
- **Armored Core VI — gated burst forms:** AC VI has no mid-mission part swaps;
  mid-battle "reconfiguration" comes from **Core Expansions** (Assault, Pulse,
  Protection, Terminal): limited-use abilities with a **10-second duration** that
  swing a fight's momentum, unlocked via OST chips from Arena missions
  (GamerJournalist, TechStory guides). Direct parallel to theyard's planned
  Berserk/Breach mode: a build-chosen, limited-use, timed power form.

### 13h. Balance patterns that recurred across titles

| Pattern | Where seen | How it worked |
|---|---|---|
| Timed window + fail penalty | Transformers: Devastation | ~1s prompt at combo end; miss it = combo breaks, you eat hits |
| Stamina/resource cost per switch | Kamen Rider: Memory of Heroez | RP spent on form change; recharges; perfect dodge refills |
| Big asymmetric mode roles | WfC / Devastation | speed + fallback ammo vs. full gunplay/melee; big damage in timed window |
| Delta too small = ignored mode | Dark Spark | ground vehicle only "slightly faster" → 80% robot time |
| Hard script locks | Dark Spark | transformation forbidden in scripted segments → reviewer fury |
| Limited-use timed burst form | Armored Core VI Core Expansions | 10s duration, limited uses, chosen per build |
| Rage-gated form | FoC Grimlock | deal melee damage → charge → unleash alt form |
| Meter-gated assist form | Battle for the Grid | Megazord assist on meter, woven into combos |
| Earned set-piece form | Rita's Rewind | combining as stage finale with genre switch |

**Net rule:** a transformation survives as a core mechanic only when every switch
has a *cost or commitment* (window, meter, stamina, vulnerability), a *clear payoff*
(roles big enough to feel different), and *level design that demands it*.
Free-and-painless switching produces the Fall of Cybertron outcome.

### 13i. The balance net rule — contract policy for BioMechania

§13h's net rule is now standing design policy, not just research. Every
transformation we ship must clear all three bars, and the contract
(`MECHA_CONTRACT.md`) carries the enforcement:

1. **Cost / commitment.** Every switch spends something real: meter
   shared with boost (`cost.meter`, default 25), a cooldown that stops
   mode-flicker (`cooldownSec`, default 8), or rage charge that must be
   earned by dealing damage and drains while the form is active
   (`breachRage`). A transform with no cost is a transform with no
   decision — and players will optimize the decision away by flickering.
2. **Clear payoff.** Mode roles must be big and asymmetric — racer =
   speed/reposition, combat = armor/power, breach = earned burst
   window. The Dark Spark warning stands: if a form is only "slightly
   faster," it gets 80% ignored. The weight→speed formula and per-mode
   part sets are the levers that keep the deltas large.
3. **Level design that demands switching.** The Fall of Cybertron
   warning: transformation was bolted-on where levels were tight
   corridors — only rare open/flying segments demanded it, so robot
   mode ate ~80% of playtime. BioMechania's tracks and derby arenas
   must physically *require* both forms: straights and drift zones
   where racer wins, crush zones and wreckage fields where combat
   wins, and set-piece moments where a charged breach is the answer.
   And the Dark Spark anti-pattern is law: **never script-lock the
   core verb** — no segment forbids transformation.

If a new form can't clear all three bars, it doesn't ship.

---

## Sources

All claims above are summarized from these pages (fetched 2026-10-09; summaries are my
own — no website was "visited" in a browser, only text fetched):

**FlatOut:**
- https://en.wikipedia.org/wiki/FlatOut_2
- https://www.gamespot.com/articles/flatout-ultimate-carnage-qanda/1100-6178022/
- https://www.eurogamer.net/flatout-ultimate-carnage-first-impressions
- http://slayerpit.blogspot.com/2025/02/flatout-2-ultimate-carnage-review.html
- https://gamingpastime.com/flatout-ultimate-carnage-pc-review/
- https://en.wikipedia.org/wiki/FlatOut
- https://www.eurogamer.net/flatout-4-total-insanity-is-a-welcome-return-to-form-for-the-series-but-stalls-on-innovation
- https://www.teamvvv.com/reviews/flatout-4-total-insanity-review/
- https://gamingbolt.com/flatout-4-total-insanity-review

**Wreckfest:**
- https://www.eurogamer.net/wreckfest-review-a-true-successor-to-the-brilliant-destruction-derby
- https://www.teamvvv.com/news/bugbear-demonstrate-next-car-games-soft-body-deformation-in-damage-test-video/
- https://racinggames.gg/article/the-real-reason-racing-games-ditch-licensed-cars-for-fictional-brands
- https://www.slideshare.net/slideshow/wreckfest-by-bugbear-entertainment/228718840

**Other derby/combat racing:**
- https://www.rockpapershotgun.com/gaming-made-me-carmageddon
- https://en.wikipedia.org/wiki/Carmageddon
- https://www.gamespot.com/reviews/demolition-racer-review/1900-2538586/
- https://en.wikipedia.org/wiki/Destruction_AllStars
- https://www.destructoid.com/destruction-allstars-got-a-state-of-play-breakdown-one-week-before-launch/
- https://egmnow.com/destruction-allstars-gameplay-video-shows-off-vehicle-and-hero-abilities/

**Mecha customization & combat:**
- https://worthplaying.com/article/2024/8/28/reviews/143385-ps5-review-gundam-breaker-4/
- https://www.animenewsnetwork.com/advertorial/2024-08-28/how-to-create-over-a-quintillion-uniquely-customized-gunpla-in-gundam-breaker-4/.214879
- https://finalweapon.net/2024/08/27/gundam-breaker-4-review/
- https://dotesports.com/armored-core/news/armored-core-6-hands-on-preview-some-assembly-required
- https://www.ungeek.ph/2023/07/armored-core-vi-no-penalties-for-buying-and-selling-parts-says-fromsoftware/
- https://screenrant.com/armored-core-6-best-external-parts-build/
- https://mwomercs.com/forums/topic/20696-how-exactly-do-hardpoints-work-in-mwo/
- https://worthplaying.com/article/2018/10/9/reviews/111200-ps4-review-zone-of-the-enders-the-2nd-runner-mars/
- https://www.fraggincivie.com/2009/05/essentials-30-zone-of-enders-2nd-runner.html

**Transformers:**
- https://www.polygon.com/2012/10/9/3478666/transformers-fall-of-cybertron-review-wheels-of-steel/
- https://www.eurogamer.net/transformers-fall-of-cybertron-review
- http://pc.gamespy.com/pc/transformers-fall-of-cybertron/1225819p1.html
- https://www.empireonline.com/gaming/reviews/transformers-fall-cybertron-review/
- https://www.escapistmagazine.com/review-transformers-war-for-cybertron/
- https://worthplaying.com/article/2010/7/9/reviews/75463-ps3x360-review-transformers-war-for-cybertron/
- https://www.capsulecomputers.com.au/2012/09/transformers-fall-of-cybertron-review/
- https://www.escapistmagazine.com/transformers-devastation-review-platinum-robots-in-disguise/
- https://www.gamespot.com/reviews/transformers-devastation-review/1900-6416275/
- https://www.nukingthecat.com/post/2015/10/13/video-game-review-transformers-devastation
- https://www.gamereactor.eu/transformers-devastation-review/
- https://www.gamesxtreme.com/article/4206/transformers-devastation-review
- https://thedailygamepad.net/transformers-devastation-review/
- http://www.nintendolife.com/reviews/wiiu/transformers_rise_of_the_dark_spark

**Kamen Rider:**
- https://kamenrider.fandom.com/wiki/KAMEN_RIDER:_memory_of_heroez
- https://www.nintendolife.com/games/nintendo-switch/kamen_rider_memory_of_heroez
- https://www.siliconera.com/kamen-rider-memory-of-heroez-early-gameplay-video/

**Power Rangers:**
- https://www.co-optimus.com/review/2511/mighty-morphin-power-rangers-rita-s-rewind-co-op-review.html
- https://game8.co/reviews/mighty-morphin-power-rangers-rita-s-rewind/mighty-morphin-power-rangers-ritas-rewind-review
- http://seafoamgaming.com/2019/04/15/power-rangers-battle-for-the-grid-switch-eshop-review/
- https://www.nintendo-insider.com/power-rangers-battle-for-the-grid-review/
- http://www.biogamergirl.com/2017/02/mighty-morphin-power-rangers-mega.html

**Gundam / Armored Core mid-battle systems:**
- https://Gamefaqs.gamespot.com/psp/975136-kidou-senshi-gundam-gundam-vs-gundam-next-plus/answers/149967-how-to-transform-into-planes
- https://www.gamespot.com/mobile-suit-gundam-gundam-vs-zeta-gundam/user-reviews/2200-571161/
- https://gamerjournalist.com/how-to-use-core-expansion-in-armored-core-6-best-core-expansion/
- https://steamcommunity.com/app/738530/discussions/0/2747650363466018325/ (New Gundam
  Breaker community discussion — unverified opinion, not a developer statement)

**Biomech / Evangelion:**
- https://www.pcgamer.com/behind-the-beautifully-grotesque-art-of-scorn/?ns_campaign=article-feed&
- https://screenrant.com/neon-genesis-evangelion-every-eva-unit-explained
- https://gamerant.Com/evangelion-eva-units-mechs/
- https://en.wikipedia.org/wiki/Evangelion_(mecha)
- https://vectree.io/pdf/c/evangelion-unit-01
- https://www.cbr.com/evangelion-eva-unit-anatomy/
