# BioMechania — Mecha Design Study

> **Purpose:** the design-language reference for BioMechania's transforming biomechs.
> Commissioned by the owner 2026-10-09 to feed render production: vehicle-mode renders,
> mid-transformation (hybrid) renders, full-mech renders, mid-transition states and
> blending, weapons, and signature characteristics.
>
> **How to read this doc:** §1–§7 are **researched fact** — design patterns observed in
> the named franchises, with sources cited. §8 (Synthesis) and §9 (Render Production
> Spec) are **recommendations** — stealable devices translated into BioMechania's
> original design language.
>
> **HARD IP RULE (owner directive, binding):** inspired-by, never copies. No EVA unit,
> Zoid, Transformer, Gundam, Bionicle, Kamen Rider, or Power Ranger likenesses, names,
> or symbols anywhere in BioMechania's designs or recommendations. We study *patterns*
> (how a transformation is staged, how a mode reads), never *designs*.
>
> **Game facts this study builds on** (from `MECHA_CONTRACT.md` / `TRANSFORMATION_MECHANICS.md`):
> builds carry one 7-slot part set per mode (`head, torso, arms, legs, shoulders, backpack, weapon`);
> modes are N (`racer` / `combat` / `breach`, extendable); transform takes **0.40s**;
> every switch costs meter (shared with boost), has a cooldown, and breach is rage-gated;
> the balance net rule — cost/commitment + clear payoff + level design that demands switching.
> 55 parts shipped. Socket convention with pair-midpoint mounting.

---

## §1 — Zoids (Chaotic Century / Guardian Force, New Century, Fuzors + model-kit line)

### Vehicle/beast mode language
Zoids never leave beast mode — every configuration is an animal, dinosaur, or insect at
rest and at war: quadruped/biped predator or megafauna chassis in white, navy, red, or
green armor with visible mechanical skeleton beneath. Armor reads as bolted-on plating
*over* a dark inner frame with articulated pistons; the animal silhouette stays readable
at all times. Even the heaviest combat forms keep lion legs, lion tail, lion head.
([aztoyhobby.com — AZ-07 Death Saurer kit](https://aztoyhobby.com/products/takara-tomy-zoids-az-07-death-saurer-1-72-model-kit?_pos=6&_fid=2f9e1d87e&_ss=c))

### Mech-mode equivalent
There is no humanoid robot mode. The equivalent is the **armorless base frame** (seen
during CAS swap sequences) plus weaponized combat stances. The Liger Zero's "Basic Zero
armour" is default white plating; each CAS (Changing Armor System) package re-roles it
without changing the underlying animal: Jager (navy armor, twin ion boosters) = speed;
Schneider (orange armor, laser blades) = close combat; Panzer (green armor, cannon
farm) = artillery.
([zoids.fandom.com — Liger Zero](https://zoids.fandom.com/wiki/Liger_Zero))

### Mid-transformation staging — the CAS armor swap
A CAS change is a **part-swap, not a fold-transform**, staged in legible beats:
1. **Jettison** — the old armor package comes OFF, exposing the base frame. The Zero is
   explicitly seen armorless "during its transformation sequence" — the halfway state is
   a lean, dark, mechanical lion skeleton, visibly under-armed and vulnerable. The
   naked-frame beat is the signature of the transformation.
2. **New package arrives** and locks on plate by plate (boosters mount to the back,
   blade arrays lock to legs/head).
3. Read: *one animal, two armor identities, hard cut between them* — each armor package
   has its own color identity (navy/orange/green) so the swap reads instantly.

**Fuzors combining** stages differently: the partner Zoid **breaks apart into armor**
and attaches onto the host — the Fire Phoenix's wings become flight armor over the
lion's body, Phoenix facial armor layered over the Zero's retained facial armor. Beats:
(1) tandem run/flight, (2) partner dissolves into modular armor segments mid-motion
(dramatic dive-over), (3) segments lock on — wings to back, head-armor over head. Most
Fuzors have a time limit before forced separation.
([zoids.fandom.com — Fire Phoenix](https://zoids.fandom.com/wiki/Fire_Phoenix))

### Transition blending notes
- What reads clearly: color-coded armor packages, the exposed-base-frame halfway beat
  (a defined "undressed" state gives the transformation beginning/middle/end), and the
  Blox-CAS principle that the partner's anatomy visibly *becomes* armor (wings stay
  wings, now worn as wings).
- Zoids avoids morph-mess by never doing true transformation — no ambiguous mid-fold.
  A render team doing the equivalent keys the halfway state to the **skeleton/base
  frame**, never a morph blend.

### Weapon systems
Weapons are **part of the body, never carried props**. The Charged Particle Cannon is
built into the mouth; the Death Saurer intakes atmospheric electricity through a back
fan, converts it inside the body, and fires from the mouth. The Liger Zero's Strike
Laser Claw channels laser energy into its natural claws. Firing is a whole-body event:
eyes light, neck armor expands, core glows, intake fan spins. Design rule: every gun is
an organ with a warmup choreography.
([theironbible.com — Death Saurer](https://theironbible.com/ZoidsModelKits/NJR/DeathSaurer.php))

### Signature characteristics
1. **Glowing Zoid Core** — the exposed heart-light in the chest; eyes and core glow on power-up.
2. **Beast head always present** — jaws that open/move; the animal head is never replaced.
3. **Mechanical under-structure visible beneath armor** — pistons/cylinders expanding as it moves ("metallic lifeform").
4. **Color-coded role identity** — white base + navy/orange/green per configuration.
5. **Empathic behavior** — the Zoid is a *partner* with temperament: it can override the
   pilot and refuses unworthy ones. Aliveness cues: glowing eyes that dilate, ear/head
   twitches, spine articulating head-to-tail in the gait.
   ([tropedia.fandom.com — Zoids](https://tropedia.fandom.com/wiki/Zoids))

---

## §2 — Transformers (G1, Beast Wars, live-action films, WfC/FoC games)

### Vehicle mode language
Earth alt-modes are disguise-perfect real vehicles (Freightliner cab, Beetle, Corvette);
Cybertronian modes are sleek alien craft. The rule: the alt-mode must read as a
*believable everyday object* — every panel seam and wheel is accounted for in robot
mode later.

### Robot mode language
Blocky, upright, humanoid — with the **vehicle's anatomy worn as anatomy**: Optimus
Prime's truck windshield sits in his red chest, grille/headlights on the torso, wheels
on the shins, cab doors on the back; the head pops from the roof/hood area. Colors stay
vehicle-faithful (red cab = red torso). The films push this to hyper-detail —
Optimus Prime ~10,000 moving parts; Devastator ~80,000.
([techradar.com — making of Transformers 2](https://www.techradar.com/news/world-of-tech/the-making-of-transformers-2-618865/2))

### Mid-transformation staging
G1 cartoon beat order (verified across toy transformation guides):
1. **Head pops / chest splits open** — the windshield chest separates, the head rises
   from the torso cavity.
2. **Arms unfold from the vehicle sides** — doors/panels swing out, rotate into shoulders.
3. **Legs extend from the chassis** — knees bend, wheels fold into shins, feet lock.
4. Fast (1–3s in G1) with the iconic transforming sound.

The halfway state: **a torso splitting along panel lines, head emerging from the
roof/hood cavity, limbs still flush with the chassis** — symmetrical split-apart, not
crumple. The Bay films stage it as a "Rubik's Cube" cascade of thousands of plates,
wheels kept on the ground as long as possible so the robot "cruises as it changes";
**wide shots slowed to sell weight, close-ups sped up** — a direct timing lesson.

**Kibble management** (where vehicle mass goes — [transformers.fandom.com — Kibble](https://transformers.fandom.com/wiki/Kibble)):
- **Hidden:** heads tucked into torso cavities, fists retracted into forearms.
- **Worn:** Prowl's car doors as door-wings behind the shoulders; Seeker nosecones/tailfins as robot features.
- **Embraced:** jet wings become the Seekers' signature silhouette (Starscream's wingspan).
- **Weaponized:** beast tails detach into arm cannons (Snarl); spoilers back the silhouette.
- **Anti-pattern:** "shellformer" extreme — entire alt-mode worn as kibble on swiveling
  rods — reads as design failure when overdone.

**Beast Wars (the biomech bridge):** fully *organic* beast modes — indistinguishable
from real animals — with robot parts hidden *inside*, not under panels. Robot mode kept
the organic roundness (rounded, Guyver-inspired forms, bestial faces) rather than
blocky plates. Staging: gorilla upper arms fold out into shoulder armor, beast head
flips inward into the chest, hydraulics extend from the legs. Design rule: **organic
outside, machine inside** — the transformation is a *reveal* of machinery under
living skin.
([cbr.com — Beast Wars retrospective](https://www.cbr.com/transformers-rise-of-the-beast-ditch-furry-beast-wars-aesthetic/))

### Transition blending notes
- What reads clearly: one-panel-one-motion logic (chest opens → head appears), alt-mode
  panel seams kept visible as hinge lines, consistent color carry-over so the eye tracks
  each part. Never let mass vanish (the anti-morph rule).
- What gets messy: the Bay "silver blender" — thousands of parts moving simultaneously.
  For a game render pipeline: **limit simultaneous movers, stage limb-by-limb**.

### Weapon systems
- **Arm cannons formed from the body:** Bumblebee's forearm plates rotate into
  hand-cannons; Ironhide's guns are built from his arms (~10,000 parts per gun in the
  film model); Megatron's cannon fuses permanently to his forearm.
- **Beast parts → weapons:** tails, claws, stingers become cannons and blades.
- **Blades** form from vehicle panel splits — a weapon is either a folded-up limb part
  or a re-homed alt-mode component.
- **Shoulder weapons:** missile launchers deploying from beast mode onto robot shoulders.

### Signature characteristics
1. **Windshield chest** — the alt-mode window carried dead-center on the torso.
2. **Door-wings / jet wings** — vehicle panels worn as shoulder armor.
3. **Faction face language** — rounded, plate-heavy helmets vs. sharper, angular features.
4. **The head-pop beat** — head emerging from the chest cavity = the universal "it's happening" signal.
5. **Faction insignia as chest plate** — symbol integrated into torso armor.

---
## §3 — Neon Genesis Evangelion (anime + Rebuild films)

> **Scope note (verified):** Evangelion has NO vehicle mode and NO mid-battle
> transformation. Its design language is *a living body inside a cage*. The closest
> canonical analog to a transformation state is the Beast Mode reconfiguration in
> *Evangelion 2.0*, covered below. Do not assign this franchise a vehicle mode.

### Mech mode language
- **Armor as RESTRAINT, not protection.** Unit-01's body is covered "from head to toe
  in restraining metal plates that hide their true organic form" and the armor "serves
  to restrain them and bind them to Nerv's control"
  ([robotics.fandom.com — Evangelion Units](https://robotics.fandom.com/wiki/Evangelion_Units)).
- **The organism underneath:** brown-colored organic tissue, red blood-like fluid; the
  mouth "normally secured with bolts"; the body wrapped in "special constrictive armor"
  ([en.wikipedia.org — Evangelion (mecha)](https://en.wikipedia.org/wiki/Evangelion_(mecha))).
- **Lanky, inhuman proportions:** long thin limbs, narrow waists, tiny heads, hunched
  postures — deliberately not robot-proportioned. The RG kit engineering models
  "relaxation and contraction of muscle fibers" with spine and shoulder blades linked to
  shifting armor parts — armor segmented to *follow* an organic body, not a machine
  joint layout.
- **Bestial movement:** unrestrained, EVAs show "savage, animalistic tendencies" —
  running on all fours, loping, head-thrusting, biting — moving like a *freed
  predator*, never like a machine executing gaits
  ([wiki.evageeks.org — Berserk](https://wiki.evageeks.org)).
- **Color-blocking / silhouette:** Unit-01 reads via **purple primary armor, neon-green
  trim stripes, white accents**, a **long forehead horn**, and a binocular head viewer.
  At peak power the stripes flip green→orange with a halo of light.

### Mid-transformation staging — Beast Mode (the verified analog)
The one canonical "restraint-off" reconfiguration, staged in discrete legible beats
([wiki.evageeks.org — Beast Mode](https://wiki.evageeks.org)):
1. Pilot speaks the code ("Invert mode. Secret code: The Beast!").
2. **Shoulder pylons jettisoned** — the heaviest silhouette elements thrown off first;
   the biggest visual beat; "weapons off, body on."
3. **Restrictors released** — the EVA "abandons its humanity"; proportions elongate,
   head goes saurian with a large uniform-toothed maw.
4. End state: "many of the Eva's outfittings are missing or otherwise altered" — the
   half-state IS missing pieces, not folded pieces. One-way escalation; never returns
   to clean armor.
- **Render takeaway:** EVA "transformation" is *subtraction* (armor ejected) plus
  *elongation* (limbs/head stretch), not folding. The hybrid beat reads as "the cage
  coming off."

### Transition blending notes
- Blending via **material contrast, not mechanical morphing**: hard plate vs. glossy
  organic tissue (Prime 1's Unit-01 statue copy: "organic gloss inside its open jaw"
  vs. "multi-layered armor panels with varied sheens").
- **The umbilical cable is the power-state language:** thick spinal cable = tethered /
  power-limited; cable severed = internal-battery timer counting down. Stealable beat:
  *with cable = machine on a leash; without = organic timer.*
- **Eyes as escalation readout:** yellow-glowing eyes in normal operation; Rebuild
  pseudo-evolution shifts eyes and trim **red**, then the unit becomes a purple-white
  glowing energy being with a halo. Canonical "escalation palette shift" — color-block
  change as power readout.

### Weapon systems
- **Deliberately human-scale-up, not beam weapons:** the Pallet Gun "resembles a Steyr
  ACR combat rifle" and is "proportionately sized to match the Evas, so an Eva can
  wield the rifle just as a human would use a conventional assault rifle"; also a
  Desert Eagle-style handgun, an Accuracy International-style sniper rifle, a bazooka
  ([wiki.evageeks.org — Evangelion Ranged Weapons](https://wiki.evageeks.org)).
- **Progressive Knife:** stored *inside the left shoulder pylon* (pylons open/close);
  blade "vibrating at high frequencies to sever matter at a molecular level" — its
  deadliness reads as vibration shimmer, not size.
- **Positron rifle:** shoulder-mounted heavy gear on an external power cable, ~8
  rounds — treated as infrastructure, not a sidearm.
- **Design rule:** keep carried weapons grounded and mundane; let the *biomech body*
  be the spectacle (teeth, AT field, berserk strength are the exotic weapons).

### Signature characteristics
1. **Bolted-shut jaw** — the mouth is wired/bolted; an open jaw is always an event.
2. **Massive vertical shoulder pylons** — the largest silhouette element; doubles as
   weapon storage (prog knife) and restraint housing.
3. **Single forehead horn + binocular viewer** — demon/oni read at a glance.
4. **Purple + neon-green color block** — readable against any background.
5. **Exposed organic tissue when damaged** — brown muscle/red fluid under shattered
   plate; the "cage cracked open" money shot.

---

## §4 — Gundam (Universal Century + Gundam Breaker + transformable suits)

### Vehicle mode language
- **Zeta Gundam — Waverider Mode:** a wedge/dart that "concentrat[es] the shockwave
  generated by supersonic flight underneath it and rid[es] the resulting wave." The
  **Flying Armor** (from the support vehicle of the same name) mounts on the back
  frame and shields against shockwave heat. Visual: smooth aerodynamic wedge, shield
  over the nose, thruster bells prominent at the rear, cockpit reading as nose cone
  ([gundam.fandom.com — MSZ-006 Zeta Gundam](https://gundam.fandom.com/wiki/MSZ-006_Zeta_Gundam)).
- **ZZ Gundam — G-Fortress Mode:** large assault craft (30.13 m long, 18.52 m wingspan)
  from Core Top + Core Base with docked Neo Core Fighters; the huge backpack engine
  "was originally meant for ships and could supply power for an entire ship"
  ([gundam.fandom.com — MSZ-010 ZZ Gundam](https://gundam.fandom.com/wiki/MSZ-010_ΖΖ_Gundam)).
- **Core-block note:** the RX-78-2's torso houses a fully functional Core Fighter that
  folds into a "Core Block" — the *cockpit is itself a small vehicle inside the torso*,
  ejectable as an escape craft.

### Mech mode language
- **Part-separation logic (the Gunpla grammar):** every mobile suit separates visually
  into head / torso / arms / legs / waist / backpack — kit manuals literally organize
  assembly that way. The visual logic: **an inner movable frame (skeleton) wrapped in
  separate armor plates with visible seam lines and panel lines** — plates sit proud of
  each other with gaps, so the eye reads "machine assembled from parts," the opposite
  of EVA's "organism under a shell."
- **Vernier/backpack as the "power read":** the backpack houses the reactor and is
  "the primary source of the Gundam's mobility" — thruster bells with vectoring
  nozzles plus beam-saber storage clips. Verniers (secondary attitude rockets) are
  **distributed across the outer surface**. Render rule: *from the front you see
  weaponry; from the back you see thrust* — the rear power silhouette is big pack +
  glowing nozzles.
- **Color grammar:** white body / blue / red / yellow accents (reaffirmed on the 2026
  Enhanced ZZ figure); the **V-fin on the head** is the silhouette key.

### Mid-transformation staging
**Zeta (MS → Waverider)** — verified beat order:
1. **Head and shoulders retract and fold into the opened chest** — the chest is
   *hollow* specifically to receive them; the humanoid face disappears into the torso.
2. **Arms fold alongside the body**; the shield mounts over the nose as the wedge nose cone.
3. **Legs extend straight back, feet extend** — robot remnants read as tail/thruster
   section rather than limbs.
4. **Backpack/Flying Armor rotates up over the back** as the dorsal heat shield.
- Hybrid look: a half-Zeta reads as "robot doing yoga" — limbs mid-fold, chest open,
  head half-swallowed. **Sequential, one body region at a time — never simultaneous morph.**

**ZZ (MS ↔ G-Fortress):** large arm/leg verniers **retract** (thrust rerouted to
attitude-control verniers — MS mode actually has *more* active thrusters); flexible
wing binders, shoulder thruster binders, the huge backpack; armor on **hinges and
slide rails** — plates slide and hinge rather than folding soft. Its hybrid state can
literally look like **two vehicles meeting in the air** (three-part Core docking).

**Render-team timing beats (synthesized):** head/chest collapse first (identity hides)
→ limbs second (fold/extend) → backpack/wings third (aero surfaces lock) → thruster
ignition last (state confirmed by thrust). ~2–3s in-animation; each beat a distinct
pose — do not blend all at once.

### Transition blending notes
- Gundam blending is *mechanical*: hinges, slide rails, magnet-coated joints. Panels
  slide over each other; no morphing skin. **Rigid plates mid-travel with visible
  gaps** is the aesthetic, not a flaw.
- **Seam lines are where the design wants to split** — transformation routes follow
  existing panel lines so the half-state looks engineered, not broken.
- Thruster nozzles ignite as the last beat — thrust is the "transformation complete"
  punctuation.
- Contrast with EVA: Gundam hybrid states show *more* hardware (exposed frame, open
  panels); EVA hybrid states show *less* armor and more flesh.

### Weapon systems
- **Beam saber (UC language):** inert hilt on the body (backpack clips / rear skirt) →
  ignited pink/white blade via E-cap + I-field. Blade color codes faction/tech
  generation (UC pink default; Zeta-family light blue; others vary). Render rule:
  **unlit hilt = potential energy; lit blade = action beat.**
- **Beam rifle:** handheld, E-cap powered, "roughly equivalent to a battleship's main
  cannon in handheld form." On Zeta the rifle can *generate a beam saber from its
  barrel* — weapons are modular multi-tools.
- **Body integration:** everything has a stowed state with a silhouette cost (bulky
  shield, big pack); saber clips, shield-carried cartridges. Fixed armaments live in
  the backpack (ZZ's 18-tube missile launchers *inside* the pack) — **the backpack is
  a weapons bus as much as a thruster unit**.

### Gundam Breaker customizer findings (part-swap layer)
- **11 part slots** from **250+ base kits**; mix parts across any suits.
- What makes swapping feel good: (1) **per-slot scale + reposition** so mismatched
  eras/parts sit without clipping; (2) **Builder's Parts** — attachable extras and
  one-click removable elements (silhouette edits without rebuilding); (3) **two paint
  modes** — fine per-element wheels (metallic/glossy/matte) *or* one-tap preset
  palettes; (4) **Derivation Synthesis** — combine related parts to generate a missing
  part from its design family (grind about lineage, not luck); (5) **Diorama mode** —
  pose builds with effects for sharing.
- Lesson: part-swapping feels good when the system tolerates *mismatched scale and
  era* gracefully, and the fun loop is "break enemy → take their part → equip it."

### Signature characteristics
1. **V-fin on the head** — most readable element at any distance.
2. **Backpack with thruster bells** — rear power silhouette; bigger pack = more capable.
3. **White/blue/red/yellow color grammar.**
4. **Shield + beam rifle paired handheld set** — default loadout silhouette.
5. **Pink beam saber on an inert hilt** — unlit = potential, lit = action.

---
## §5 — Bionicle (Lego, 2001–2010)

### Component mode language
- **Ball-and-socket modularity is the whole aesthetic.** Ball joints give multi-degree
  motion with minimal hardware; every limb, weapon, and armor shell snaps onto standard
  joints, so any part is swappable *by construction*.
  ([biosector01.com — BIONICLE](https://biosector01.com/wiki/BIONICLE))
- **Exposed joint anatomy:** the socket is a visible part — a "bed" with a spherical
  depression plus friction arcs; the ball sits proud at shoulders, hips, wrists,
  ankles. Render language: **exposed spherical joints as deliberate visual rhythm** —
  limb segments are bones, joints are visible spheres, armor shells are clipped plating
  over the top.
- **Technic-beam understructure:** beams, pistons, pin/axle connectors are structural,
  not hidden. Greebles read as functional connective hardware.

### Combined mode language — Toa Kaita (fusion, not assembly)
Three Toa meld bodies and minds into one entirely new being with a distinct
personality, a **new fused Kanohi** (containing all three component masks' powers),
and merged tools: Akamai (Fire/Stone/Earth, Aki mask, fire sword + club) and Wairuha
(Air/Water/Ice, Rua mask, axe + ice sword + shield). A Kaita "combines and amplifies
all attributes" — more than three Toa standing together; it stays fused only while
mental focus holds.
([biosector01.com — Toa Kaita](https://biosector01.com/wiki/Toa_Kaita))

### Mid-transformation staging
BIONICLE never depicted a frame-by-frame combination in 2001 media — the franchise's
staging trick is **modularity-as-transformation**; the *toy instructions* are the
transformation sequence. A Bionicle-style transform stages as **disassembly-reassembly**:
1. Component parts detach at the ball joints.
2. Parts migrate and re-seat onto new sockets.
3. New mask descends/attaches — **the mask attaching last is the "identity lands"
   beat** (Gali's hooks became Wairuha's chest armor; Lewa's axe fused with Kopaka's
   ice sword — tools literally merge in combined forms).
4. Stance resolves.
- **Mask as continuity anchor:** the mask never dissolves — it is swapped, corrupted
  (visibly pitted/rusted), or upgraded. Maskless Toa feel weak/dizzy. Identity persists
  through a rigid component while the body reconfigures around it.
- **Elemental recolor continuity:** fused forms keep component colors (Akamai =
  red/brown/black) — the combined form reads as "those three, together."

### Transition blending notes
- **No organic-to-mechanical morphing** — everything snaps together. Blending is hidden
  by the *joint itself*: the socket is the transition seam, so a limb never morphs, it
  re-seats.
- Clip-on armor shells over a skeletal frame give the layered "skeleton + plating" read.

### Weapon/gear systems
- **Weapon-tool duality is the core rule:** tools channel elemental power AND serve
  mundane functions — Gali's hooks = melee + climbing; Lewa's axe slices plant life;
  Pohatu's feet = kicking/stability. Nuva upgrades doubled every tool into a transport
  mode: Magma Swords = lava board, Aqua Axes = swim fins, Air Katanas = wings,
  Quake Breakers = all-terrain treads, Ice Blades = skis.
- Tools **merge** in combined forms — gear combination is part of the fusion visual.

### Signature characteristics
1. **Exposed ball joints at every articulation** — the visual DNA.
2. **The mask IS the face/identity** — mask shape conveys power and personality.
3. **Tribal color coding** — Fire=red, Water=blue, Air=green, Earth=black, Stone=brown,
   Ice=white; silver/gold mark elite status.
4. **Every weapon does two jobs** (combat + utility/transport).
5. **Clip-on armor shells over a skeletal frame.**

---

## §6 — Kamen Rider (form-change-heavy series: Kuuga, W, OOO, Build, Zero-One)

### The form change staged as beats — the Build master template
Kamen Rider Build's transformation is the clearest documented sequence
([kamenrider.fandom.com — Build Driver](https://kamenrider.fandom.com/wiki/Build_Driver)):
1. **Trigger:** shake two Fullbottles → insert into the Build Driver's twin slots.
2. **Commit:** turn the Vortex Lever → the **Snap Ride Builder** deploys, connected to
   the belt by transparent **Factoria Pipelines**.
3. **Materialization:** bottle contents (Transgel Solid) heat to liquid, pressurize,
   **pump visibly through the pipelines** and inject into the Builder's mold — armor
   visibly forming inside a scaffold.
4. **"Are you ready?"** — the Driver asks; beat of anticipation.
5. **Closure:** the two **Halfbodies snap together around the user**. Best Match =
   two compatible bottles (organic blue right half + inorganic red left half);
   incompatible = weaker Trial Form.

**The 5-beat structure across series:** physical trigger (0.5s) → device announcement
→ effect/manifestation (~1–2s) → closure/pose → **form name call on the completed
form, never mid-way** (that timing is the readability anchor). Zero-One: press key →
"Authorize!" → unfold → insert → "Progrise!" → push for finisher. W (Double): two
partners, two USB Gaia Memories, bent arms form the "W" in the henshin pose; right
half = one element, left half = the other. OOO: three Core Medals scanned, combos map
to **head / torso-arms / legs zones** (Tatoba = hawk head, tiger torso, grasshopper
legs). Kuuga: armor shape AND color change per form (Mighty=red/balanced,
Dragon=blue/agile, Pegasus=green/precise, Titan=purple/strong); **gold trim** marks
Rising upgrades; form weapons transmogrified from nearby objects.

### Mid-transformation staging
- **Build's mid-state:** the Builder's two halves deployed but OPEN — the user stands
  between two liquid-filled half-shells with visible pipelines feeding them; closure is
  the final snap. Reads as "armor still in the mold, half liquid."
- **OOO's mid-state:** each medal's armor lands on its zone in sequence
  (head/torso/legs) — readable as each piece locks in, like dressing order.
- **Zero-One's mid-state:** the Rider Model transmits at speed and physically
  lands/attaches as armor — the "summon arrives, then docks" beat.
- **Blending rule: armor materializes ONTO the body; the person is never hidden.**
  The human silhouette persists — the spectacle is armor *assembling over* a visible
  body, not a morph. (Contrast: BIONICLE keeps identity via the mask; Rider keeps it
  via the visible human.)

### Base-suit consistency (the readability trick)
What persists across ALL forms: the **compound eyes/helmet base**, the **belt device**
(always visible at the waist), and the **undersuit**. What changes: chest armor,
shoulder pieces, gauntlets, leg armor, and the color/material split per zone. You can
always tell it's the same Rider because the eyes and belt never change.

### Weapon/gear systems
- **Form-exclusive gear, one per configuration:** OOO's Toraclaw gauntlets, W's
  Trigger Magnum and Metal Shaft, Zero-One's Attache Calibur, Kuuga's Dragon Rod /
  Pegasus Bowgun / Titan Sword. **The weapon belongs to the form** — it appears with
  the form and defines its combat role. Best-Match-style systems gate the strongest
  weapon+form combos behind compatibility rules.

### Signature characteristics
1. **The belt is the totem** — centered at the waist in every form, trigger of every change.
2. **Compound eyes** — the single constant across all forms.
3. **Named form call on completion** — the form name is part of the visual payload.
4. **Zone-mapped armor splits** — color/material zones read the active combination at a glance.
5. **The toyetic beat structure** — trigger → announcement → materialization → snap-closure → pose/name.

---

## §7 — Power Rangers (Zord / Megazord combining sequences)

### Component mode language
Each Zord is a fully readable standalone machine/animal: MMPR's five Dinozords
(Tyrannosaurus, Pterodactyl, Mastodon, Triceratops, Sabertooth Tiger) move and fight
independently; RPM's Zord Attack Vehicles are real vehicles. Auxiliary Zords carry
alternate configurations (Titanus brontosaurus → triple-barreled tank platform).
([neoencyclopedia.fandom.com — MMPR Zords](https://neoencyclopedia.fandom.com/wiki/Zords_in_Mighty_Morphin_Power_Rangers))

### Combined mode language
- **The MMPR standard:** T-Rex = head + torso; Mastodon = shoulders, arms, back;
  Triceratops = left leg; Sabertooth = right leg; Pterodactyl = chest plate + cockpit
  window.
- **Core-scaffold + limb-dockers:** one Zord is always the central body/head; the rest
  are limb modules docking onto it. Wild Force inverts it: the Bison's torso OPENS
  like a lid, four Zords nest *inside*, then the torso swivels outward to become the
  legs.
- **The head is always a fresh element** — a new head rises/assembles; the combined
  form never reuses the core machine's animal head as its face.

### Mid-transformation staging — step by step
- **MMPR beat order:** (1) the five Dinozords join into **Tank Mode first** — an
  intermediate, visibly half-combined, *fightable* configuration: T-Rex as tank core,
  Triceratops/Sabertooth as treads, Mastodon as forward cannons, Pterodactyl clipped
  on top. (2) Then it reconfigures into **Battle Mode** (humanoid). The intermediate
  tank is the franchise's canonical "mid-transformation state."
- **Wild Force beat order:** "Wild Zords, descend!" (energy strip from the sky) →
  "Wild Zords, combine!" (Bison torso opens, four Zords nest inside, Eagle perches on
  top) → cockpit forms, Rangers slot Crystal Sabers into consoles → "Wild Force
  Megazord!" (torso swivels into legs, Eagle wings fold and assimilate, main head
  rises, final pose). Staging principle: **parts assemble loosely, then the whole
  structure re-orients.**
- **Additive stacking for upgrades:** RPM's Zenith Megazord — arms and feet dock onto
  the existing silhouette; SkyRev lands on Zenith's shoulders. **The parent form stays
  readable** under every upgrade.

### Transition blending notes
- **Intermediates are real, fightable configurations**, not flashes of light.
  Combination is staged as mechanical re-seating; the audience watches parts travel.
- **The chest plate is the constant read:** Pterodactyl becomes the chest plate and
  cockpit window — the torso front is always the emblem zone. Animal heads fold away
  or become detail armor, never left dangling.
- **Red is always the core** — team-color continuity keeps the combined form readable
  as "the team's leader, enlarged."

### Weapon/gear systems
- **Weapons arrive as a separate beat:** the Power Sword is summoned separately and
  delivers the finisher; Mastodon's head detaches as a shield; Dragonzord provides
  Fighting Mode or gun-arms over the shoulders.
- **Auxiliary Zords become gear:** RPM's arms become the bow for the finisher (arrow
  from the Whale's mouth); Wild Force's Shark fin becomes the Fin Blade. The weapon
  is *a part of an auxiliary Zord*, not a conjured item.

### Signature characteristics
1. **5-part humanoid template** — head+torso / 2 arms / 2 legs; every combination resolves here.
2. **Core Zord = torso + head; limbs = docked machines** — hierarchy never varies.
3. **Chest plate = emblem/cockpit window** — the identity stamp.
4. **Distinct new head** that rises or assembles — never the core animal's face.
5. **Called, staged intermediates** (Tank Mode, opened torso) — choreographed, named, sometimes skippable, never a light-flash.

---
---

## §8 — Synthesis: stealable devices → BioMechania's original design language

> Everything below is **recommendation**, not franchise fact. Each device names its
> source pattern and its BioMechania translation. The IP rule stands: patterns, never
> designs — no likenesses, names, or symbols from any source franchise.

### Device 1 — The Soul Part (identity continuity across modes)
**Pattern:** Bionicle's mask, Kamen Rider's eyes+belt, Power Rangers' chest emblem —
in every franchise, ONE rigid component carries identity through transformation while
everything else reconfigures around it.
**BioMechania translation:** every biomech gets a **soul part**: a head face-plate
with a fixed optic arrangement + a chest sigil plate (abstract geometric mark,
original to the mech — never a faction symbol from another franchise). The soul part
NEVER changes across racer/combat/breach modes: same geometry, same mount, same
color-block anchor. When a player sees the face-plate, they know whose mech it is
regardless of mode. Render rule: the soul part is modeled once and instanced into all
three mode assemblies — it is the visual constant.

### Device 2 — Sequential transformation beats (the 0.40s grammar)
**Pattern:** Zeta's head→limbs→backpack→ignition order; G1's head-pop → arms → legs;
Build's trigger → materialize → snap-closure. Every readable transformation is
*sequential, one body region at a time* — never a simultaneous morph.
**BioMechania translation:** the 0.40s transform (24 frames @ 60fps) is staged as four
beats, and the part system already supports it (every part knows its `modes`):
1. **Frames 0–6 — identity hides:** head assembly retracts/folds toward the torso;
   racer-mode aero parts begin releasing (EVA pylon-jettison energy, mechanical not
   organic).
2. **Frames 6–12 — limbs travel:** arms/legs fold or extend along panel lines toward
   the target mode's configuration; pair parts (arms/legs/shoulders) move as units.
3. **Frames 12–18 — torso reconfigures + backpack rotates:** the torso shell opens
   and re-seats (Gundam chest-hollow logic); backpack swings to its mode position
   (racer = aero cowl over the back; combat = weapons bus upright).
4. **Frames 18–24 — lock + ignition:** parts seat with visible gaps closing, then
   thruster/verniers ignite — thrust is the "transformation complete" punctuation.
**Hybrid states for renders:** freeze at frames 6, 12, 18 (25% / 50% / 75%). The 50%
state MUST expose the inner frame (Zoids naked-frame beat) — it is the signature
halfway image.

### Device 3 — Kibble discipline (hide / wear / weaponize)
**Pattern:** Transformers kibble management — every leftover part is hidden, worn as
armor, or weaponized; never left dangling, never vanished (anti-morph rule).
**BioMechania translation:** parts carry `modes` tags (racer/combat/breach), so every
part has a defined behavior in modes it doesn't serve: racer-only aero parts FOLD
FLAT against the torso in combat mode (worn as armor skirts); combat-only armor
RETRACTS into backpack housings in racer mode (hidden); breach-exclusive parts are
stowed INSIDE the torso and burst-mount on rage entry (weaponized reveal). No part
may clip through another in any mode — the viewer validates this per the contract.

### Device 4 — Restraint language (the EVA device, originalized)
**Pattern:** EVA armor as restraint — bolts, straps, constrictive plating over organic
tissue; restraints coming OFF as the escalation beat; palette shift as power readout.
**BioMechania translation:** combat and racer modes wear visible **restraint
hardware** — bolted collars at the neck, strap bands across the torso, constrictive
plating over the limb joints. These are modeled geometry, not texture. On **breach
entry**, restraints visibly release (collars split, straps snap back) and the
under-plating shows a heat/organic glow; the mech's accent color shifts one step
hotter (e.g., amber → red-orange). Breach is not a new paint job — it is *the cage
coming off*. Damage states reuse the same language: cracked plating reveals the glow
underneath (the "cage cracked open" money shot for derby impacts).

### Device 5 — Weapons as organs (warmup choreography)
**Pattern:** Zoids (guns are organs with whole-body warmup: eyes light, neck expands,
core glows) + Transformers (arm cannons formed from body parts) + Rider (form-exclusive
gear arriving with the form).
**BioMechania translation:** every weapon has three modeled states — **stowed**
(folded into its mount: blade in arm housing, cannon collapsed into backpack),
**warmup** (2–4 frame beat: emitter glows, housing opens, barrel extends — the
whole-mech flinch), **deployed** (locked, glowing). Breach-exclusive weapons ONLY
exist in breach mode and arrive AS the rage-entry payoff (Power Rangers "weapon as
separate beat" — the weapon reveal punctuates the transformation). No carried props
that appear from nowhere; everything has a stow point on the body.

### Device 6 — Mode color identity (CAS-style zone mapping)
**Pattern:** Zoids CAS color packages (navy/orange/green per role); OOO/Build
zone-mapped armor splits; Megazord's red core continuity.
**BioMechania translation:** each mode gets a **color identity shift**, not just a
geometry shift: racer = cool/dark with aero accent stripes; combat = the mech's base
livery at full saturation with armor-band highlights; breach = base livery pushed
hotter + glow accents (Device 4). The soul part (§8.1) keeps its colors in ALL modes
— it is the anchor the eye returns to. At a glance, across the arena, mode must read
in under half a second: silhouette delta (Device 2) + color delta (this device) =
the balance net rule made visual. A form that is only "slightly" different gets
ignored — the Dark Spark warning applies to renders too.

### Device 7 — Organic-outside / machine-inside (the Beast Wars bridge)
**Pattern:** Beast Wars — fully organic exteriors concealing mechanical interiors;
transformation as *reveal*; rounded bio-plating in mech mode rather than hard plates.
**BioMechania translation:** racer mode leans organic — smooth, closed, aerodynamic
shells with minimal panel breaks (the "beast at rest"). Combat mode opens up: shells
split along seam lines to expose frame, pistons, and weapon housings (the "machine
inside"). Breach mode goes further — plating retracted, frame + glow fully exposed.
The three modes are thus a **progressive reveal**: closed organism → opened machine →
unrestrained core. This gives the render team a single through-line for all transition
work.

### Device 8 — The intermediate is real (Tank Mode rule)
**Pattern:** Power Rangers' Tank Mode — the halfway configuration is a real, fightable,
*named* state, not a blur between poses.
**BioMechania translation:** the 50% hybrid frame (Device 2) should be designed as a
coherent image, not an interpolation accident. If a render of the halfway state looks
broken, the staging is wrong — rework the beat order until the halfway state reads as
"a machine caught mid-thought": frame exposed, parts mid-travel along visible paths,
soul part locked and readable.

### Device 9 — Undersuit persistence (the Rider readability trick)
**Pattern:** Kamen Rider's constant undersuit + eyes + belt across all forms.
**BioMechania translation:** beneath every part set, each biomech has a **base frame**
(the inner skeleton the viewer assembles parts onto). The base frame is ALWAYS the
same geometry and dark inner-frame material in every mode — it is the visual
"undersuit." Mode changes are armor packages over a constant body (Zoids CAS logic).
This is also a production cheat: model the frame once, dress it three ways.

### Device 10 — Scale tolerance (the Breaker lesson)
**Pattern:** Gundam Breaker's per-slot scale/reposition so mismatched parts sit
without clipping.
**BioMechania translation (render rule):** parts are authored to a socket standard,
but renders must prove parts read correctly at the extremes — the bulkiest combat
torso with the lightest racer head, the longest breach weapon on the smallest arm
mount. If a combo clips in the render, it clips in the viewer: file it as a part
defect, not a render defect.

---

## §9 — Render Production Spec

> **For the render team.** This is the exact shot list per biomech build. "Per build"
> means per player-configured 7-slot part set × 3 modes. Start with the two starter
> builds from the contract: **Scout set** (light racer) and **Bruiser set** (heavy
> combat) — they define the light/heavy extremes every other part is judged against.

### 9.1 Mode hero shots (9 per build)
For EACH mode (racer, combat, breach):
- **M-1 — 3/4 front hero:** the money shot. Slight low angle, mech in a dynamic
  stance (racer: coiled/aero tuck; combat: weapon deployed, planted; breach: restraints
  off, glow hot). Must sell the mode's job in one frame (Device 6: silhouette + color
  delta).
- **M-2 — side profile:** clean orthographic-leaning side view, neutral stance. The
  silhouette-readability check — trace the outline; racer/combat/breach outlines must
  be unmistakably different.
- **M-3 — rear power read:** from behind-above. Sells the backpack/verniers/weapon
  bus (Gundam rear-power rule) and the racer-mode aero surfaces.

### 9.2 Transition sequence — racer → combat (4 hybrid frames + ignition)
Freeze the 0.40s transform at **frames 6 / 12 / 18** (25% / 50% / 75%) plus the
**ignition frame** (frame 24, thrusters lit):
- **T-25 (frame 6):** head assembly retracting toward torso; racer aero parts
  beginning to release. Soul part still fully readable.
- **T-50 (frame 12):** THE signature hybrid — inner frame exposed (Zoids naked-frame
  beat), limbs mid-travel along visible paths, torso shell open. Must read as "a
  machine caught mid-thought" (Device 8), never a blur.
- **T-75 (frame 18):** combat parts nearly seated — visible gaps still open between
  plates (Gundam mid-travel aesthetic); backpack swinging to upright.
- **T-IGN (frame 24):** gaps closed, thrusters/verniers igniting — transformation
  complete punctuation.
- **Blending rules for all T-frames:** rigid plates mid-travel (no morphing skin);
  transformation routes follow existing panel/seam lines; color carry-over per part
  so the eye tracks each piece; limit simultaneous movers (Bay lesson — stage
  limb-by-limb); NEVER let mass vanish (anti-morph rule); soul part locked and
  readable in every frame.

### 9.3 Breach entry sequence (3 beats)
Breach is rage-gated, not just another mode — its entry is staged as escalation:
- **B-1 — restraint release:** collars split, straps snap back (EVA pylon-jettison
  energy). Freeze the moment of release — hardware mid-flight reads as violence.
- **B-2 — reveal + palette shift:** plating retracted, under-glow hot, accent colors
  pushed hotter. The "cage coming off" frame.
- **B-3 — weapon payoff:** breach-exclusive weapon deploying with warmup glow
  (Device 5) — the weapon reveal punctuates the sequence.

### 9.4 Weapon callouts (2–3 per weapon)
- **W-STOW:** weapon folded into its mount (blade in arm housing, cannon collapsed
  in backpack) — proves the stow point exists on the body.
- **W-WARM:** the 2–4 frame warmup beat — emitter glowing, housing open, barrel
  extending; whole-mech flinch visible.
- **W-FIRE:** deployed and firing — muzzle/emitter effect + recoil pose. (Effect
  passes can be layered by the VFX lane; the render must sell the *pose*.)

### 9.5 Characteristic callouts (2 per build)
- **C-SOUL:** tight shot of the soul part (face-plate + chest sigil) — the identity
  anchor, identical across all three modes. Render all three modes' soul parts in one
  contact sheet to prove constancy.
- **C-ZONE:** a mode color-identity sheet — racer/combat/breach swatches side by
  side showing the Device 6 color delta.

### 9.6 Turnaround (3 per build, per mode for the hero build)
Front / side / back neutral-stance turnarounds for modeling reference. Required at
minimum for the Scout and Bruiser starter sets; recommended for every shipped part.

### 9.7 Damage-state callouts (2 per build)
- **D-CRACK:** plating cracked from a derby impact, under-glow/tissue visible through
  the break (Device 4 — "cage cracked open" money shot).
- **D-WRECK:** full breach-threshold state (35% hull per the contract's
  `damageThresholdPct`) — maximum restraint release short of full breach.

### 9.8 Shot-count summary per biomech build
| Block | Shots |
|---|---|
| Mode heroes (§9.1: 3 modes × 3 angles) | 9 |
| Transition hybrids (§9.2) | 4 |
| Breach entry (§9.3) | 3 |
| Weapon callouts (§9.4, per weapon) | 2–3 |
| Characteristic callouts (§9.5) | 2 |
| Turnarounds (§9.6) | 3 |
| Damage states (§9.7) | 2 |
| **Total per build** | **~25** |

Start with the **Scout** and **Bruiser** starter sets (≈50 shots) — they lock the
light/heavy extremes and the full transition grammar. Every subsequent part set
reuses the same shot list; per-part (not per-build) additions need only §9.6
turnaround + §9.4 weapon states for the new part.

### 9.9 Render QC gates (must pass before a shot ships)
1. **Soul-part constancy:** the face-plate/optics read identically across all mode
   shots of the same build.
2. **Mode delta:** silhouette + color identity differ unmistakably between modes
   (Dark Spark rule — "slightly different" fails).
3. **No mass vanish:** every part visible in mode A is accounted for (stowed, worn,
   or weaponized) in mode B.
4. **No clipping:** parts never interpenetrate in any frame — hybrids included.
5. **Hybrid readability:** the T-50 frame reads as intentional, not broken.
6. **Grounding:** full-mech shots obey the standing defect gates — feet on the
   ground plane, facing matches stance direction, left/right symmetry on paired
   parts.

---

## Sources (all §1–§7 claims)

**Zoids:** aztoyhobby.com (AZ-07 Death Saurer kit); zoids.fandom.com (Liger Zero,
Fire Phoenix, Fuzors Episode 4); gunpla.co.uk (HMM Schneider); theironbible.com
(Death Saurer NJR + AZ07); en-academic.com (Fuzors, Seismosaurus); tropedia.fandom.com;
toonami.fandom.com (New Century promo); animesuperhero.com forums.
**Transformers:** character-and-universe-profile.fandom.com (G1 Optimus);
transformers.fandom.com (Kibble); gumtree.com (G1 transformation Q&A);
forums.civfanatics.com + techradar.com (film part counts); the-jh-movie-collection
fandom (2007 film); bwtf.com (Snarl); transformers-universe.com (Primal);
tfwiki.net (Beast Wars toyline); figurefanzero.com (Beast Wars staging); cbr.com
(Beast Wars retrospective); message.rschooltoday.com + climber.uml.edu.ni (visual
history / Art of Prime PDFs).
**Evangelion:** en.wikipedia.org/wiki/Evangelion_(mecha); robotics.fandom.com;
wiki.evageeks.org (Berserk, Beast_Mode, Entry_plug, Ranged_Weapons);
evangelion.fandom.com (Berserk_Mode); vectree.io (c/eva); prime1studio.com
(LSEVA-01S); lascalemodel.com (RG kits); amazon.com/dp/B07ZTFNHDS (RG EVA-01).
**Gundam:** gundam.fandom.com (MSZ-006 Zeta, MSZ-010 ZZ, Beam_Saber, Technology);
discover.hubpages.com; goonhammer.com (RG Zeta); mahq.net (MSZ-010S);
gunpla.fandom.com; essential-japan.com (Enhanced ZZ, Sept 2026); vectree.io (RX-78);
koei.fandom.com; cbr.com (Robot Spirits Zeta); manuals.plus (MG Zeta manual);
fast.animenewsnetwork.com + pcgamer.com + siliconera.com + xp97.com +
nintendo-insider.com (Gundam Breaker 4); saberforum.com + gamefaqs.gamespot.com
(beam colors).
**Bionicle:** prismnews.com; biosector01.com (BIONICLE, Toa_Kaita, Akamai, Wairuha,
Kanohi, Ice_Sword, Mask_of_Creation); board.ttvchannel.com; bionicle.fandom.com
(Kaita, Toa 2001, Toa_Mata/Toa_Nuva).
**Kamen Rider:** kamenrider.fandom.com (Build_Driver, Progrisekeys, Kuuga, OOO_Driver);
tokusatsunetwork.com (Zero-One driver); tvtropes.org (Double, Kuuga);
tropedia.fandom.com (Kuuga); kamenriderds.fandom.com (OOO); otakucosplayph.com.
**Power Rangers:** neoencyclopedia.fandom.com (MMPR Zords, RPM, Operation Overdrive);
powerrangers.fandom.com (Mach_Megazord, Wild_Force_Megazord);
mightymorphinpowerrangerstheofficial.fandom.com (Megazord); screenrant.com;
cbr.com (Megazord explained); list.fandom.com (Megazord).

*Related BioMechania docs: `MECHA_CONTRACT.md` (part system, N-mode schema, transform
rules), `TRANSFORMATION_MECHANICS.md` (§13 genre research: balance net rule, game-by-game
transformation mechanics), `MECHA_CUSTOMIZER_SPEC.md`, `GENRE_RESEARCH.md`.*
