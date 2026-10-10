#!/bin/bash
# Render Lane A: 18 hero shots, sequential (1-up; sibling lanes B/C share the 2 CPUs).
# Finals: M-1 @ 1920x1080/64sp (denoised), M-2/M-3 @ 1280x720/64sp.
# Poses from tools/render/pose.py are applied inside render_shot.py.
cd ~/workspace/BioMechania-renders-heroes || exit 1
BL="env -u PYTHONPATH $HOME/workspace/tools/blender/blender-4.0.2-linux-x64/blender"

heartbeat() {
  python3 -c "
import json, datetime
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
for p in ['/home/hatch/workspace/agent-ops/checkpoints/renders-heroes.json',
          '/home/hatch/workspace/agent-ops/checkpoints/biomechania-render-production.json']:
    try:
        d = json.load(open(p)); d['updated_at'] = now
        json.dump(d, open(p, 'w'), indent=2)
    except Exception as e:
        print('hb fail', p, e)
print('heartbeat ok', now)"
}

shots=()
for build in scout bruiser; do
  for mode in racer combat breach; do
    for shot in M-1 M-2 M-3; do
      if [ "$shot" = "M-1" ]; then res="1920x1080"; sp=64; else res="1280x720"; sp=64; fi
      shots+=("$build|$mode|$shot|$res|$sp")
    done
  done
done

for s in "${shots[@]}"; do
  IFS='|' read -r b m sh r sp <<<"$s"
  out="docs/renders/${b}/${sh}-${m}.png"
  log="/tmp/laneA/${b}-${sh}-${m}.log"
  mkdir -p /tmp/laneA
  if [ -f "$out" ]; then echo "SKIP $out (exists)"; continue; fi
  echo "=== RENDER $b/$m/$sh @ $r/$sp ==="
  $BL -b --python tools/render/render_shot.py -- \
    --build "$b" --mode "$m" --shot "$sh" \
    --out "$out" --res "$r" --samples "$sp" >"$log" 2>&1
  rc=$?
  echo "=== DONE $b/$m/$sh rc=$rc ($(date -u +%H:%M)) ==="
  heartbeat
  git add "$out" 2>/dev/null
  git commit -qm "Lane A: hero shot ${b} ${sh}-${m} (@${r}/${sp})" 2>/dev/null && echo "committed ${b} ${sh}-${m}" || echo "nothing to commit"
done
echo "ALL 18 SHOTS DONE"
