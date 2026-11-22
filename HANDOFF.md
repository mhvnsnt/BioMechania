# HANDOFF — BioMechania

**Last updated: 2026-11-22 (America/New_York).**
**Repo:** `mhvnsnt/BioMechania` (PUBLIC), default branch `main`.
**Purpose of this file:** any agent that picks up work here reads this FIRST, then the linked docs. It states what we've done, where we're at, and what we're working toward — so the owner can say "go to this repo, pick up the work" and you just know. Update this file in the same PR whenever the state changes (add, don't delete).

## 1. What this repo is

BioMechania — a game plus its web app. The repo carries no description, so what follows is only what the tree shows: a Godot game (`godot/`, `base-game/`, `roster/`), a TypeScript/Vite web app (`src/`, `server/`, `public/`, `vercel.json`), `third_party/`, `tools/`, `scripts/`, `attachments/`, `logs/`, `docs/`, `screenshots/`, `migrations/`, `startup.sh`. Created 2026-10-09. Public. ~145 MB on main.

**Plainly:** the repo does not say in its own words what BioMechania the game is (genre, story, where the web app fits). Whoever picks this up should read `docs/` and `README.md` first and write the purpose down here before building more.

## 2. Where we're at

### DONE
- **No-data-loss rules + deletion guard (2026-10-14, PR #24 merged):** the owner-law rules doc landed (`42db099`, `5f8c40d`).
- **Sale-status owner rule (2026-10-14, PR #23 merged):** the owner's sale-status rule documented.
- **Anti-clobber laws (2026-10-17):** the owner's anti-clobber laws landed after the DXMMII 54k-file wipe.
- **Working method statement (2026-10-27):** `WORKING-METHOD.md` landed.

### IN PROGRESS
- Nothing is actively in progress in this repo that the repo itself records. Last push was the 2026-10-27 sweep commit.
- **Link Muse training pack (open PR #22).** Next step: read the PR — a training-pack link is either live or it isn't, and the repo does not say.
- **Anti-clobber law PRs (open #25, #26) and working-method statement PR (open #27).** Standing-rule PRs, unmerged.

### BLOCKED
- Nothing recorded as blocked. No releases. The gap is a documentation gap, not a code block: the game's purpose is unstated (see §1).

## 3. What we're working toward

First: establish what BioMechania is, from `docs/` and the README, and write it into this file. Then: the game plays — Godot build runs, roster loads, web app serves — verified by playing it, not by a file list. The bar: every model assembled perfectly like its source or it does not ship, and no fighter is presented as proof before its pipeline is finished.

## 4. Standing rules that apply here

- **Branch → PR → merge, always.** Never push to main directly. Add-only, zero-conflict PRs, no force pushes.
- **Checkpoint-and-save law:** CHECKPOINT.md first, update after every step; the repo is the save; resume, never restart.
- **No-temp-storage law:** nothing in /tmp or any wipeable location, ever.
- **Real-source-only:** build from the real sources, wired up fully — no hand-tooled lookalikes.
- **Never delete game files** except under the one-store rule with teardown logged to the idle queue first.
- **Never kill in-progress work.**
- **Anti-clobber:** never wipe or overwrite another lane's work.

## 5. Key files and paths

| What | Where |
|---|---|
| Godot game | `godot/`, `base-game/`, `roster/` |
| Web app | `src/`, `server/`, `public/`, `vercel.json` |
| Third-party / tools / scripts | `third_party/`, `tools/`, `scripts/` |
| Docs / screenshots / logs | `docs/`, `screenshots/`, `logs/` |
| Agent rules | `AGENTS.md` |
| Method doc | `WORKING-METHOD.md` |
| Open PRs | #22 (link Muse training pack), #25, #26 (anti-clobber laws), #27 (working method statement) |

## 6. Open decisions needing the owner

- **What BioMechania is:** the repo does not state it. Once a pickup lane reads the docs, the purpose still needs his confirmation before it is written in as fact.
- **PR #22 — Muse training pack link:** approve or change. His call.
- No other decisions are recorded in this repo.

## 7. How to pick up

1. Read this HANDOFF.md first, then `README.md` and `docs/`.
2. Read open PR #22 before changing anything about the training pack.
3. Check what other agents are already doing before starting anything.
4. Resume from the stated next step — never restart, never re-derive finished work.
5. Land work branch → PR → merge, add-only. Stage finished work to the repo as it lands.
6. Update this HANDOFF.md in the same PR when the state changes. Verify with your own eyes before claiming anything done.
