"""Contact-sheet compositing for Lane C (pure Python, PIL).

Usage:
    python3 tools/render/contact_sheet.py --kind soul --build scout
    python3 tools/render/contact_sheet.py --kind zone --build scout
    python3 tools/render/contact_sheet.py --proof

Reads source stills, writes:
  docs/renders/<build>/C-SOUL.png   (3 soul close-ups: racer/combat/breach)
  docs/renders/<build>/C-ZONE.png   (3 M-2 profiles: racer/combat/breach)
  docs/renders/lane-c-proof.png     (grid of all lane-C shots + labels)
"""

import argparse
import os

from PIL import Image, ImageDraw

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
R = os.path.join(REPO, "docs", "renders")
MODES = ("racer", "combat", "breach")
BUILDS = ("scout", "bruiser")

LANE_C_SHOTS = (
    [f"weapons/W-STOW-{w}.png" for w in ("scrapblade", "siegeplow", "core-maul")]
    + [f"weapons/W-WARM-{w}.png" for w in ("scrapblade", "siegeplow", "core-maul")]
    + [f"weapons/W-FIRE-{w}.png" for w in ("scrapblade", "siegeplow", "core-maul")]
    + [f"{b}/C-SOUL.png" for b in BUILDS]
    + [f"{b}/C-ZONE.png" for b in BUILDS]
    + [f"{b}/T-FRONT-combat.png" for b in BUILDS]
    + [f"{b}/T-SIDE-combat.png" for b in BUILDS]
    + [f"{b}/T-BACK-combat.png" for b in BUILDS]
    + [f"{b}/D-CRACK-combat.png" for b in BUILDS]
    + [f"{b}/D-WRECK-combat.png" for b in BUILDS]
)


def label_cell(img, text, cell_w, cell_h, label_h=28):
    canvas = Image.new("RGB", (cell_w, cell_h + label_h), (18, 18, 20))
    fit = img.copy()
    fit.thumbnail((cell_w, cell_h), Image.LANCZOS)
    canvas.paste(fit, ((cell_w - fit.width) // 2, 0))
    d = ImageDraw.Draw(canvas)
    d.text((8, cell_h + 5), text, fill=(230, 230, 235))
    return canvas


def make_sheet(cells, cols, cell_w, cell_h):
    """cells: list of (PIL image, label)."""
    rows = (len(cells) + cols - 1) // cols
    labeled = [label_cell(im, lab, cell_w, cell_h) for im, lab in cells]
    sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + 28)), (18, 18, 20))
    for i, cell in enumerate(labeled):
        sheet.paste(cell, ((i % cols) * cell_w, (i // cols) * (cell_h + 28)))
    return sheet


def sheet_soul(build, srcdir):
    cells = []
    for mode in MODES:
        p = os.path.join(srcdir, f"soul-{build}-{mode}.png")
        cells.append((Image.open(p), f"C-SOUL {build} / {mode}"))
    sheet = make_sheet(cells, 3, 480, 270)
    out = os.path.join(R, build, "C-SOUL.png")
    sheet.save(out)
    print("wrote", out)


def sheet_zone(build, srcdir):
    cells = []
    for mode in MODES:
        p = os.path.join(srcdir, f"zone-{build}-{mode}.png")
        cells.append((Image.open(p), f"C-ZONE {build} / {mode}"))
    sheet = make_sheet(cells, 3, 480, 270)
    out = os.path.join(R, build, "C-ZONE.png")
    sheet.save(out)
    print("wrote", out)


def proof_sheet():
    cells = []
    missing = []
    for rel in LANE_C_SHOTS:
        p = os.path.join(R, rel)
        if os.path.exists(p):
            cells.append((Image.open(p), rel))
        else:
            missing.append(rel)
    sheet = make_sheet(cells, 5, 400, 225)
    out = os.path.join(R, "lane-c-proof.png")
    sheet.save(out)
    print("wrote", out, f"({len(cells)} cells)")
    if missing:
        print("MISSING:", missing)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", choices=("soul", "zone", "proof"), required=True)
    ap.add_argument("--build", default="scout")
    ap.add_argument("--srcdir", default=os.path.join(REPO, "docs", "renders", "contact"))
    args = ap.parse_args()
    if args.kind == "soul":
        sheet_soul(args.build, args.srcdir)
    elif args.kind == "zone":
        sheet_zone(args.build, args.srcdir)
    else:
        proof_sheet()


if __name__ == "__main__":
    main()
