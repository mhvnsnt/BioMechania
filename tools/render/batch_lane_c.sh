#!/bin/bash
# Lane C batch render driver — runs all detail shots sequentially.
# Usage: ./tools/render/batch_lane_c.sh [res] [samples]
# Defaults: 1280x720, 40 samples. Logs to logs/lane-c-batch.log.
set -u
cd "$(dirname "$0")/../.." || exit 1

RES="${1:-1280x720}"
SAMPLES="${2:-40}"
BLENDER=~/workspace/tools/blender/blender-4.0.2-linux-x64/blender
LOG="logs/lane-c-batch.log"
mkdir -p logs docs/renders/weapons docs/renders/contact docs/renders/scout docs/renders/bruiser

SHOTS=(
  # weapons: W-<state>-<weapon>
  "W-STOW-scrapblade|docs/renders/weapons/W-STOW-scrapblade.png"
  "W-WARM-scrapblade|docs/renders/weapons/W-WARM-scrapblade.png"
  "W-FIRE-scrapblade|docs/renders/weapons/W-FIRE-scrapblade.png"
  "W-STOW-siegeplow|docs/renders/weapons/W-STOW-siegeplow.png"
  "W-WARM-siegeplow|docs/renders/weapons/W-WARM-siegeplow.png"
  "W-FIRE-siegeplow|docs/renders/weapons/W-FIRE-siegeplow.png"
  "W-STOW-coremaull|docs/renders/weapons/W-STOW-coremaull.png"
  "W-WARM-coremaull|docs/renders/weapons/W-WARM-coremaull.png"
  "W-FIRE-coremaull|docs/renders/weapons/W-FIRE-coremaull.png"
  # damage
  "D-CRACK-scout|docs/renders/scout/D-CRACK-combat.png"
  "D-WRECK-scout|docs/renders/scout/D-WRECK-combat.png"
  "D-CRACK-bruiser|docs/renders/bruiser/D-CRACK-combat.png"
  "D-WRECK-bruiser|docs/renders/bruiser/D-WRECK-combat.png"
  # turnarounds (combat mode)
  "TURN-FRONT-scout|docs/renders/scout/T-FRONT-combat.png"
  "TURN-SIDE-scout|docs/renders/scout/T-SIDE-combat.png"
  "TURN-BACK-scout|docs/renders/scout/T-BACK-combat.png"
  "TURN-FRONT-bruiser|docs/renders/bruiser/T-FRONT-combat.png"
  "TURN-SIDE-bruiser|docs/renders/bruiser/T-SIDE-combat.png"
  "TURN-BACK-bruiser|docs/renders/bruiser/T-BACK-combat.png"
  # soul close-ups (contact sources)
  "C-SOUL-scout-racer|docs/renders/contact/soul-scout-racer.png"
  "C-SOUL-scout-combat|docs/renders/contact/soul-scout-combat.png"
  "C-SOUL-scout-breach|docs/renders/contact/soul-scout-breach.png"
  "C-SOUL-bruiser-racer|docs/renders/contact/soul-bruiser-racer.png"
  "C-SOUL-bruiser-combat|docs/renders/contact/soul-bruiser-combat.png"
  "C-SOUL-bruiser-breach|docs/renders/contact/soul-bruiser-breach.png"
  # zone profiles (contact sources)
  "C-ZONE-scout-racer|docs/renders/contact/zone-scout-racer.png"
  "C-ZONE-scout-combat|docs/renders/contact/zone-scout-combat.png"
  "C-ZONE-scout-breach|docs/renders/contact/zone-scout-breach.png"
  "C-ZONE-bruiser-racer|docs/renders/contact/zone-bruiser-racer.png"
  "C-ZONE-bruiser-combat|docs/renders/contact/zone-bruiser-combat.png"
  "C-ZONE-bruiser-breach|docs/renders/contact/zone-bruiser-breach.png"
)

echo "=== lane C batch start $(date -u +%FT%TZ) res=$RES samples=$SAMPLES ===" | tee -a "$LOG"
i=0
for entry in "${SHOTS[@]}"; do
  i=$((i+1))
  shot="${entry%%|*}"
  out="${entry##*|}"
  if [ -f "$out" ]; then
    echo "[$i/${#SHOTS[@]}] SKIP $shot (exists)" | tee -a "$LOG"
    continue
  fi
  echo "[$i/${#SHOTS[@]}] START $shot -> $out $(date -u +%FT%TZ)" | tee -a "$LOG"
  if [[ "$shot" == TURN-* ]]; then
    # turnaround: use render_shot.py (T-FRONT/T-SIDE/T-BACK supported)
    build="${shot##*-}"; build="$(echo "$build" | tr 'A-Z' 'a-z')"
    camid="T-$(echo "$shot" | cut -d- -f2)"
    env -u PYTHONPATH "$BLENDER" -b --python tools/render/render_shot.py -- \
      --build "$build" --mode combat --shot "$camid" --out "$out" \
      --res "$RES" --samples "$SAMPLES" >> "$LOG" 2>&1
  else
    env -u PYTHONPATH "$BLENDER" -b --python tools/render/detail_shots.py -- \
      --shot "$shot" --out "$out" --res "$RES" --samples "$SAMPLES" >> "$LOG" 2>&1
  fi
  rc=$?
  echo "[$i/${#SHOTS[@]}] DONE $shot rc=$rc $(date -u +%FT%TZ)" | tee -a "$LOG"
done
echo "=== lane C batch end $(date -u +%FT%TZ) ===" | tee -a "$LOG"
