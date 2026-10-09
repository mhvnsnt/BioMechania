"""Low-poly Stance Derby share cards. Exact pixels, no generative text."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

ASPHALT = (7, 9, 13)
ASPHALT_2 = (20, 24, 32)
ASPHALT_3 = (36, 42, 54)
BONE = (242, 239, 230)
BONE_DIM = (176, 170, 156)
BONE_DARK = (96, 92, 86)
AMBER = (224, 138, 44)
AMBER_HOT = (255, 198, 120)
AMBER_DEEP = (132, 68, 14)
CYAN = (62, 199, 255)
CYAN_DIM = (28, 100, 136)
STEEL = (48, 54, 64)
FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"


def shade(color, mul):
    return tuple(max(0, min(255, int(c * mul))) for c in color)


def vertical_gradient(w, h, top, bottom):
    arr = np.zeros((h, w, 3), dtype=np.float32)
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    for i in range(3):
        arr[:, :, i] = top[i] * (1 - t) + bottom[i] * t
    return Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")


def add_glow(base, cx, cy, rx, ry, color, alpha=140, blur=None):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(*color, alpha))
    radius = blur if blur is not None else max(8, int(min(rx, ry) * 0.42))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=radius))
    return Image.alpha_composite(base, layer)


def tracked_text(base, text, cx, y, font, fill, tracking=0, stroke=0, stroke_fill=ASPHALT):
    """Draw a centered line. Returns (x0, y0, x1, y1) of the ink."""
    draw = ImageDraw.Draw(base)
    widths = [font.getlength(ch) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    top = y
    bottom = y
    left = x
    for ch, w in zip(text, widths):
        draw.text(
            (x, y),
            ch,
            font=font,
            fill=fill,
            stroke_width=stroke,
            stroke_fill=stroke_fill,
        )
        bbox = font.getbbox(ch)
        bottom = max(bottom, y + bbox[3])
        x += w + tracking
    right = x - tracking
    return (left, top, right, bottom)


def wheel(draw, cx, cy, r):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(10, 11, 14))
    draw.ellipse([cx - r + 7, cy - r + 7, cx + r - 7, cy + r - 7], fill=(28, 32, 38))
    draw.polygon(
        [
            (cx - r * 0.15, cy - r * 0.72),
            (cx + r * 0.15, cy - r * 0.72),
            (cx + r * 0.15, cy + r * 0.72),
            (cx - r * 0.15, cy + r * 0.72),
        ],
        fill=STEEL,
    )
    draw.polygon(
        [
            (cx - r * 0.72, cy - r * 0.15),
            (cx + r * 0.72, cy - r * 0.15),
            (cx + r * 0.72, cy + r * 0.15),
            (cx - r * 0.72, cy + r * 0.15),
        ],
        fill=STEEL,
    )
    draw.ellipse([cx - r * 0.28, cy - r * 0.28, cx + r * 0.28, cy + r * 0.28], fill=CYAN)


def draw_split_car(draw, ox, oy, s=1.0):
    """Clear side-view car. ox,oy is the rear-wheel center. Cabin is lifted off the chassis."""

    def P(x, y):
        return (ox + x * s, oy + y * s)

    # contact shadow
    draw.ellipse([P(-70, 8), P(470, 36)], fill=(4, 5, 8))

    # planted chassis — long wedge, no cabin
    polygon = draw.polygon
    polygon(
        [
            P(-48, -6),
            P(-18, -62),
            P(70, -74),
            P(250, -70),
            P(360, -48),
            P(402, -16),
            P(392, 4),
            P(330, 16),
            P(40, 16),
            P(-36, 6),
        ],
        fill=BONE,
    )
    # facet breaks so it reads low-poly, not a blob
    polygon([P(-18, -62), P(70, -74), P(68, -48), P(-8, -40)], fill=BONE_DIM)
    polygon([P(70, -74), P(250, -70), P(246, -44), P(68, -48)], fill=shade(BONE, 0.94))
    polygon([P(250, -70), P(360, -48), P(348, -28), P(246, -44)], fill=BONE_DIM)
    polygon([P(360, -48), P(402, -16), P(392, 4), P(348, -28)], fill=BONE_DARK)
    polygon([P(-48, -6), P(-18, -62), P(-8, -40), P(-36, 6)], fill=shade(BONE_DARK, 1.15))
    # nose lamp + tail lamp
    polygon([P(366, -36), P(404, -18), P(396, -4), P(358, -20)], fill=CYAN)
    polygon([P(-40, -28), P(-16, -46), P(-8, -30), P(-34, -12)], fill=AMBER)

    # three struts in the split
    for x in (40, 150, 270):
        polygon([P(x, -70), P(x + 14, -70), P(x + 10, -118), P(x + 4, -118)], fill=AMBER)
        polygon([P(x + 2, -118), P(x + 12, -118), P(x + 16, -132), P(x - 2, -132)], fill=AMBER_HOT)

    # rising torso — the cabin, lifted clear of the chassis
    polygon(
        [
            P(18, -138),
            P(48, -206),
            P(210, -218),
            P(292, -168),
            P(268, -128),
            P(28, -124),
        ],
        fill=BONE,
    )
    polygon([P(48, -206), P(210, -218), P(196, -186), P(64, -178)], fill=shade(BONE, 0.88))
    polygon([P(210, -218), P(292, -168), P(250, -156), P(196, -186)], fill=BONE_DIM)
    # glass
    polygon([P(150, -200), P(214, -208), P(248, -164), P(168, -158)], fill=CYAN)
    polygon([P(78, -190), P(142, -198), P(156, -160), P(86, -156)], fill=shade(CYAN, 0.62))
    # turret crown
    polygon([P(96, -214), P(132, -286), P(196, -292), P(214, -210)], fill=AMBER)
    polygon([P(132, -286), P(196, -292), P(180, -258), P(148, -254)], fill=AMBER_HOT)
    polygon([P(150, -292), P(176, -292), P(170, -328), P(156, -328)], fill=AMBER_HOT)

    wheel(draw, *P(58, 4), 46 * s)
    wheel(draw, *P(318, 2), 46 * s)


def arena_and_ground(base, horizon, quiet_until_x=0):
    w, h = base.size
    d = ImageDraw.Draw(base)
    # rear wall
    cols = 16
    for i in range(cols):
        x0 = int(i * w / cols)
        x1 = int((i + 1) * w / cols) + 1
        rise = 18 if i % 2 == 0 else 0
        y_top = horizon - 78 + rise
        mul = 0.8 + (i % 3) * 0.12
        d.polygon([(x0, horizon + 6), (x0, y_top), (x1, y_top - 6), (x1, horizon + 6)], fill=shade(ASPHALT_3, mul))
        stripe = AMBER_DEEP if i % 5 == 0 else shade(CYAN_DIM, 0.7)
        d.polygon(
            [(x0 + 6, y_top + 18), (x1 - 6, y_top + 12), (x1 - 6, y_top + 22), (x0 + 6, y_top + 28)],
            fill=stripe,
        )
    # towers
    for tx, lamp in ((64, AMBER), (w - 64, CYAN)):
        d.polygon([(tx - 5, horizon), (tx + 5, horizon), (tx + 3, 28), (tx - 3, 28)], fill=STEEL)
        d.polygon([(tx - 18, 22), (tx + 18, 22), (tx + 14, 40), (tx - 14, 40)], fill=lamp)
        d.polygon([(tx - 8, 28), (tx + 8, 28), (tx + 5, 36), (tx - 5, 36)], fill=AMBER_HOT if lamp == AMBER else (230, 252, 255))

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    g = ImageDraw.Draw(overlay)
    rows, cols = 7, 14
    for r in range(rows):
        for c in range(cols):
            u0, u1 = c / cols, (c + 1) / cols
            v0, v1 = r / rows, (r + 1) / rows

            def proj(u, v):
                y = horizon + v * (h - horizon - 4)
                span = 0.35 + 0.9 * v
                x = w * 0.52 + (u - 0.5) * w * span
                return (x, y)

            col = ASPHALT_2 if (r + c) % 2 == 0 else shade(ASPHALT_2, 1.25)
            g.polygon([proj(u0, v0), proj(u1, v0), proj(u1, v1), proj(u0, v1)], fill=(*col, 255))
    # a few lane ticks, kept out of the quiet title zone
    for i, u in enumerate((0.38, 0.5, 0.62)):
        def proj(u, v):
            y = horizon + v * (h - horizon - 4)
            span = 0.35 + 0.9 * v
            x = w * 0.52 + (u - 0.5) * w * span
            return (x, y)
        paint = (*AMBER, 170) if i != 1 else (*CYAN, 170)
        g.polygon([proj(u - 0.015, 0.35), proj(u + 0.015, 0.35), proj(u + 0.028, 0.62), proj(u - 0.028, 0.62)], fill=paint)
    base = Image.alpha_composite(base, overlay)
    if quiet_until_x > 0:
        # keep the title field a clean night sky
        veil = Image.new("RGBA", base.size, (0, 0, 0, 0))
        vd = ImageDraw.Draw(veil)
        vd.rectangle([0, 0, quiet_until_x, h], fill=(7, 9, 13, 210))
        vd.rectangle([quiet_until_x, 0, quiet_until_x + 70, h], fill=(7, 9, 13, 90))
        base = Image.alpha_composite(base, veil)
    # light shafts
    shafts = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shafts)
    sd.polygon([(64, 40), (210, h), (10, h), (30, 40)], fill=(*AMBER, 40))
    sd.polygon([(w - 64, 40), (w - 20, h), (w - 250, h), (w - 90, 40)], fill=(*CYAN, 34))
    shafts = shafts.filter(ImageFilter.GaussianBlur(16))
    return Image.alpha_composite(base, shafts)


def compose_og():
    w, h = 1200, 630
    base = vertical_gradient(w, h, (6, 8, 12), (14, 12, 11))
    base = add_glow(base, 160, 70, 260, 150, AMBER, 80)
    base = add_glow(base, 1060, 80, 280, 160, CYAN, 64)
    base = arena_and_ground(base, horizon=348)
    d = ImageDraw.Draw(base)
    # Chassis sits under the lockup; the lifted torso rises to the right of the words.
    draw_split_car(d, 820, 528, 0.92)
    font = ImageFont.truetype(FONT, 128)
    ascent = font.getbbox("STANCE")[3]
    gap = 10
    block = ascent + gap + ascent
    top = int((h - block) / 2) - 48
    b1 = tracked_text(base, "STANCE", w / 2, top, font, BONE, tracking=16, stroke=7, stroke_fill=(7, 9, 13))
    b2 = tracked_text(base, "DERBY", w / 2, top + ascent + gap, font, BONE, tracking=18, stroke=7, stroke_fill=(7, 9, 13))
    # amber rule under the lockup, shorter than the word
    rule_y = int(b2[3]) + 14
    d2 = ImageDraw.Draw(base)
    d2.rectangle([w / 2 - 150, rule_y, w / 2 + 150, rule_y + 6], fill=AMBER)
    d2.rectangle([w / 2 - 150, rule_y + 6, w / 2 - 90, rule_y + 10], fill=CYAN)
    return base.convert("RGB"), (b1, b2)


def compose_banner():
    w, h = 1200, 264
    base = vertical_gradient(w, h, (6, 8, 12), (16, 13, 11))
    base = add_glow(base, 980, 36, 240, 80, CYAN, 60)
    base = add_glow(base, 760, 180, 260, 70, AMBER, 40)
    # quiet left half so the lockup sits on asphalt, not on the car
    base = arena_and_ground(base, horizon=128, quiet_until_x=560)
    d = ImageDraw.Draw(base)
    draw_split_car(d, 690, 214, 0.62)
    font = ImageFont.truetype(FONT, 54)
    ascent = font.getbbox("STANCE")[3]
    y1 = 18
    y2 = y1 + ascent + 4
    # left-aligned lockup, not centered on the frame
    def left_text(text, y, tracking):
        draw = ImageDraw.Draw(base)
        x = 56
        widths = [font.getlength(ch) for ch in text]
        total = sum(widths) + tracking * (len(text) - 1)
        for ch, cw in zip(text, widths):
            draw.text((x, y), ch, font=font, fill=BONE, stroke_width=4, stroke_fill=ASPHALT)
            x += cw + tracking
        return x, y + ascent

    x1, bottom1 = left_text("STANCE", y1, 3)
    x2, bottom2 = left_text("DERBY", y2, 4)
    d.rectangle([56, bottom2 + 8, 250, bottom2 + 12], fill=AMBER)
    meta = {"right": max(x1, x2), "bottom": bottom2 + 12, "mid": h / 2, "half": w / 2}
    return base.convert("RGB"), meta


if __name__ == "__main__":
    og, boxes = compose_og()
    ban, meta = compose_banner()
    og.save("/workspace/.grok/og-raw.png")
    ban.save("/workspace/.grok/x-banner-raw.png")
    print("og", og.size, "title", boxes)
    print("banner", ban.size, meta)
