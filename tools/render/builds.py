"""Build definitions for the BioMechania render pipeline.

Pure python (no bpy) — maps build + mode -> {slot: part_id}.

NAMING LAW (owner 2026-10-09): "Scout"/"Bruiser" are INTERNAL WORKING LABELS
only. Public display names are TBD — a naming slate worker is preparing
IP-collision-checked candidates and the owner picks personally. Nothing here
is canon as a public name; the final rename pass applies the owner's picks.
Part ids (head-scout, torso-bruiser, ...) stay as-is internally.
"""

# Starter build — the task's explicit mode->part mapping.
# Racer runs the light scout set, combat the heavy bruiser set,
# breach the 7 breach-exclusive parts.
SCOUT_BUILD = {
    "racer": {
        "head": "head-scout",
        "torso": "torso-scout",
        "arms": "arms-scout",
        "legs": "legs-scout",
        "shoulders": "shoulders-scout",
        "backpack": "backpack-afterburner",
        "weapon": "weapon-scrapblade",
    },
    "combat": {
        "head": "head-bruiser",
        "torso": "torso-bruiser",
        "arms": "arms-bruiser",
        "legs": "legs-bruiser",
        "shoulders": "shoulders-bruiser",
        "backpack": "backpack-bruiser",
        "weapon": "weapon-siegeplow",
    },
    "breach": {
        "head": "fracture-helm",
        "torso": "burst-coil",
        "arms": "rupture-maul",
        "legs": "surge-stomp",
        "shoulders": "fracture-crest",
        "backpack": "vent-surge",
        "weapon": "core-maul",
    },
}

# Heavy build — bruiser set in racer/combat (heavy extreme per the study),
# breach-exclusive parts in breach. Provisional loadout for the render lanes;
# the "Bruiser" label is an internal working label only (see naming law above).
BRUISER_BUILD = {
    "racer": {
        "head": "head-bruiser",
        "torso": "torso-bruiser",
        "arms": "arms-bruiser",
        "legs": "legs-bruiser",
        "shoulders": "shoulders-bruiser",
        "backpack": "backpack-bruiser",
        "weapon": "weapon-siegeplow",
    },
    "combat": {
        "head": "head-bruiser2",
        "torso": "torso-bruiser2",
        "arms": "arms-bruiser2",
        "legs": "legs-bruiser2",
        "shoulders": "shoulders-bruiser2",
        "backpack": "backpack-bruiser2",
        "weapon": "weapon-bruiser2",
    },
    "breach": {
        "head": "head-bruiser3",
        "torso": "torso-bruiser3",
        "arms": "arms-bruiser3",
        "legs": "legs-bruiser3",
        "shoulders": "shoulders-bruiser3",
        "backpack": "backpack-bruiser3",
        "weapon": "weapon-bruiser3",
    },
}

BUILDS = {
    "scout": SCOUT_BUILD,
    "bruiser": BRUISER_BUILD,
}

MODES = ("racer", "combat", "breach")
SLOTS = ("head", "torso", "arms", "legs", "shoulders", "backpack", "weapon")

# Torso socket names per the contract (MECHA_CONTRACT.md).
SOCKETS = (
    "socket_head",
    "socket_arm_l", "socket_arm_r",
    "socket_leg_l", "socket_leg_r",
    "socket_shoulder_l", "socket_shoulder_r",
    "socket_back",
)

PAIR_SLOTS = ("arms", "legs", "shoulders")
