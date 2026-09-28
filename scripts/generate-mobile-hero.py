"""
Generate the DEDICATED MOBILE hero image from the existing desktop hero.

WHY THIS EXISTS
---------------
The home hero (/public/hero-phoenix.jpg) is a 1324x783 LANDSCAPE composition.
The hero section is `min-h-screen` with `object-cover`, so on a phone
(~390x844, portrait 0.46:1) the browser matches by height and crops ~62% of
the image width away - the phoenix's wings and the GREGGORY wordmark get
sliced off. Tablets and PCs render it perfectly and must not change.

So we build a separate PORTRAIT 1:2 asset for phones.

THE HARD CONSTRAINT (this is the whole design problem)
-----------------------------------------------------
The subject - wingspan plus the GREGGORY wordmark - occupies roughly
1070x783px of the 1324px-wide original, i.e. it is wider than it is tall.
Inset far enough to survive the browser's cover-crop it can only ever be
~630px tall: 29% of the 2160px frame. So ~71% of a phone hero is ATMOSPHERE
by necessity, and the game is not "fit the picture" - it is "make that
atmosphere look deliberate and premium". The first attempt lost because it
filled that space with a single 2.45x cover-scale copy of the art, blurred
86px and dropped to 40% brightness: a featureless brown smear with the real
artwork floating in it like a sticker.

What this version does instead:
  * the dead right third of the art is cropped away (it also carried a green
    lens-flare artefact that read as a smudge on phones)
  * the backdrop is built from THREE blur scales, not one, so it reads as
    depth and bokeh instead of mud
  * a real sunrise glow is placed behind the bird so it looks like it is
    emerging from the light rather than pasted on top of it
  * film grain is added - smooth gradients band badly in JPEG, and that
    banding is the single biggest "this looks cheap" tell
  * embers and a bloom pass add life and specular glow

DEPENDENCY: Pillow (>=9). Nothing else.

RE-RUN whenever the desktop hero art changes:
    python scripts/generate-mobile-hero.py                  # writes the default
    python scripts/generate-mobile-hero.py --variant dawn
    python scripts/generate-mobile-hero.py --preview        # all 3, to _preview/
"""

import argparse
import math
import os
import random
import sys

try:
    from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
except ImportError:  # pragma: no cover - guidance for a bare environment
    sys.exit(
        "Pillow is required to generate the mobile hero.\n"
        "Install it with:  pip install Pillow\n"
        "Then re-run:     python scripts/generate-mobile-hero.py"
    )

# ── Paths ────────────────────────────────────────────────────────────────────
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PUBLIC = os.path.join(REPO, "The-Greggory-Systems-And-Strategy-firm website", "public")
PREVIEW = os.path.join(HERE, "_preview")

SOURCE = os.path.join(PUBLIC, "hero-phoenix.jpg")
OUT_MOBILE = os.path.join(PUBLIC, "hero-phoenix-mobile.jpg")
OUT_MOBILE_SM = os.path.join(PUBLIC, "hero-phoenix-mobile-sm.jpg")

# ── Composition ──────────────────────────────────────────────────────────────
# 1:2 (0.5), not 9:16 (0.5625). The hero section is `min-h-screen` and the
# image is `object-cover`, so a too-wide canvas gets its SIDES cropped away.
# How much:  crop_each_side = (1 - (vw/vh) / canvas_aspect) / 2
#   390x844 (0.462) on a 0.5625 canvas -> 8.9% of the width gone PER SIDE
#   390x844 (0.462) on a 0.5    canvas -> 3.8% per side
#   360x800 (0.450) on a 0.5    canvas -> 5.0% per side
# Every real phone sits between 0.44 and 0.50, so 0.5 caps the damage at 5%.
MASTER_W, MASTER_H = 1080, 2160
SMALL_W, SMALL_H = 720, 1440      # lighter rendition for the srcSet

# Horizontal crop of the source, as fractions of its width. The subject (logo
# mark + wordmark) measures 0.069..0.865 - 79.6% of the width, so no crop of
# this source can give it more than ~10% of margin on each side. Take all of
# it: the far left is not the "hard black edge" an earlier note claimed, it
# is the sunrise glow (column 0 averages L=128), and the green lens flare
# only starts around 0.95, which the 0.945 right bound stops short of.
# Cropping tighter costs safe-area margin, and safe-area margin is exactly
# what the browser's cover-crop eats.
SRC_CROP = (0.0, 0.0, 0.945, 1.0)

# The artwork is inset from the canvas edges, but only just. Two numbers have
# to be satisfied at once and they pull opposite ways:
#
#   * the side inset must be >= the browser's cover-crop, or the browser eats
#     into the subject. The subject runs 7.3%..91.5% of the crop, so with the
#     inset E the margins are (540 - 461E) left and (540 - 448E) right, and the
#     crop is 3.8%/side at 390x844 and 5.0%/side at 360x800. That caps E well
#     above 1.0 - at E = 1.0 a 360x800 phone cuts the logo mark by 9px.
#   * the side inset must be <= the cover-crop, or the band's own left and
#     right edges stay inside the frame and read as a pasted panel with four
#     visible sides.
#
# E = 0.96 is the overlap: a 22px gap, 0.065*1037 = 67px of side feather, so
# the band's edges are (a) feathered almost to nothing before they reach the
# canvas and (b) cropped away by every phone. What is left to blend is only
# the top and bottom, which get 65px and 78px of feather and sit against the
# field - a blur of this same artwork, so they carry on into it.
FG_WIDTH_RATIO = 0.96
FG_TOP_RATIO = 0.30      # where the artwork band starts, as a fraction of height

DEFAULT_VARIANT = "dawn"
VARIANT_NAMES = ("dawn", "ascend", "frame")


# ── Small maths helpers ──────────────────────────────────────────────────────
def _smooth(t):
    """Smoothstep, clamped. No visible kink at the ends of a ramp."""
    t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
    return t * t * (3.0 - 2.0 * t)


def _sample_stops(stops, t):
    """Piecewise-linear colour ramp lookup. stops = [(pos, (r,g,b)), ...]"""
    if t <= stops[0][0]:
        return stops[0][1]
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        if t <= p1:
            span = p1 - p0
            f = 0.0 if span <= 0 else (t - p0) / span
            return tuple(int(round(c0[i] + (c1[i] - c0[i]) * f)) for i in range(3))
    return stops[-1][1]


def _vgrad(w, h, stops, steps=768):
    """Vertical gradient. Built as a 1px strip then scaled - exact, and fast."""
    strip = Image.new("RGB", (1, steps))
    px = strip.load()
    for i in range(steps):
        px[0, i] = _sample_stops(stops, i / (steps - 1))
    return strip.resize((w, h), Image.Resampling.BICUBIC)


def _radial_mask(w, h, cx, cy, rx, ry, falloff=2.0, res=288):
    """Soft elliptical falloff as an 'L' mask. cx/cy/rx/ry are 0..1 fractions."""
    sw = res
    sh = max(1, round(res * h / w))
    m = Image.new("L", (sw, sh), 0)
    px = m.load()
    for y in range(sh):
        fy = y / (sh - 1)
        for x in range(sw):
            fx = x / (sw - 1)
            d = math.hypot((fx - cx) / rx, (fy - cy) / ry)
            # Guard d >= 1 BEFORE the power: a hair over 1 makes (1-d) negative,
            # and a negative float raised to a fractional power returns a
            # complex number in Python 3, which int() then rejects.
            if d >= 1.0:
                v = 0.0
            elif d <= 0.0:
                v = 1.0
            else:
                v = (1.0 - d) ** falloff
            px[x, y] = int(255 * v)
    return m.resize((w, h), Image.Resampling.BICUBIC)


def _tinted(mask, colour, w, h):
    """A flat colour modulated by `mask` - used for every glow layer."""
    layer = Image.new("RGB", (w, h), colour)
    return ImageChops.multiply(layer, mask.convert("RGB"))


def _zoom(img, out_w, out_h, zoom=1.0, fx=0.5, fy=0.5):
    """Scale by `zoom` relative to a full cover-fit, then crop a window whose
    centre sits on the source point (fx, fy) - both in 0..1 SOURCE coords, so
    a focal point means the same thing at every blur scale.

    Used for the bokeh layers, to pull a soft copy of the bird or of the warm
    horizon into frame. zoom is clamped to >= 1.0 so the scaled image is
    always at least as large as the canvas in both axes - otherwise the crop
    window would be taller than the image and the aspect ratio would break.
    """
    w, h = img.size
    zoom = max(1.0, zoom)
    scale = max(out_w / w, out_h / h) * zoom
    nw = max(out_w, math.ceil(w * scale))
    nh = max(out_h, math.ceil(h * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int(round(fx * nw - out_w / 2))
    top = int(round(fy * nh - out_h / 2))
    left = max(0, min(left, nw - out_w))
    top = max(0, min(top, nh - out_h))
    return resized.crop((left, top, left + out_w, top + out_h))


def _axis_ramp(n, lead, tail):
    """1 x n strip: 0 at index 0, ramping to 255 over `lead` px, holding, then
    ramping back to 0 over the last `tail` px. Smoothstep both ends."""
    s = Image.new("L", (n, 1), 0)
    px = s.load()
    for i in range(n):
        v = _smooth(i / lead) if lead > 0 else 1.0
        if tail > 0:
            v = min(v, _smooth((n - 1 - i) / tail))
        px[i, 0] = max(0, min(255, int(255 * v)))
    return s


def _feather_mask(w, h, top, bottom, left, right):
    """Alpha mask for the sharp artwork, feathered independently per side.

    Built as two 1-D strips multiplied together rather than per-pixel, so it
    costs nothing at 1080x2160. The side strip ramps along x, the top/bottom
    strip is transposed so it ramps along y - get that wrong and the vertical
    feather lands on the horizontal axis, off-canvas, leaving a hard 1px step
    where the artwork band starts and ends. That step is the "rectangle".
    """
    hm = _axis_ramp(w, left, right).resize((w, h), Image.Resampling.BILINEAR)
    vm = _axis_ramp(h, top, bottom).transpose(Image.TRANSPOSE)
    vm = vm.resize((w, h), Image.Resampling.BILINEAR)
    return ImageChops.multiply(hm, vm)


def _bloom(img, radius, threshold=165, strength=0.5):
    """Screen a blurred copy of the highlights back over the image.

    Gives the wing edges and the wordmark the specular halo that separates
    them from the backdrop. Without it the artwork looks pasted on.
    """
    w, h = img.size
    lum = img.convert("L").point(lambda v: 0 if v <= threshold else min(255, int((v - threshold) * 3)))
    bloom = Image.merge("RGB", (lum, lum, lum))
    bloom = bloom.filter(ImageFilter.GaussianBlur(radius))
    bloom = ImageChops.multiply(bloom, Image.new("RGB", (w, h), (int(255 * strength),) * 3))
    return ImageChops.screen(img, bloom)


def _grain(img, sigma=9, amount=0.32):
    """Fine monochrome noise.

    Non-negotiable for this image: the sky and the base are huge, very smooth
    gradients, and JPEG quantisation bands them into visible stripes on a
    phone screen. Noise dithers the bands away.
    """
    w, h = img.size
    noise = Image.effect_noise((w, h), sigma).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, ImageChops.soft_light(img, noise), amount)


def _embers(w, h, cx, cy, count, rng, scale=1.0):
    """Warm floating motes, densest around the glow. Drawn black, screened on."""
    layer = Image.new("RGB", (w, h), (0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        # bias placement toward the glow so the density gradient is natural
        d = rng.random() ** 0.55
        ang = rng.uniform(0, math.tau)
        px = cx + math.cos(ang) * d * w * 0.62
        py = cy + math.sin(ang) * d * h * 0.58
        if not (-20 < px < w + 20 and -20 < py < h + 20):
            continue
        r = rng.uniform(1.1, 3.4) * scale
        b = int(rng.uniform(70, 235) * (1.0 - 0.45 * d))
        draw.ellipse((px - r, py - r, px + r, py + r), fill=(b, int(b * 0.52), int(b * 0.16)))
    soft = layer.filter(ImageFilter.GaussianBlur(2.2 * scale))
    return ImageChops.screen(layer, soft)


def _rays(w, h, cx, cy, count, rng, reach=1.0):
    """Volumetric shafts radiating from the glow centre."""
    rays = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(rays)
    for _ in range(count):
        ang = rng.uniform(0, math.tau)
        near = rng.uniform(0, 0.06)
        far = rng.uniform(0.35, 1.0) * reach
        draw.line(
            (cx + math.cos(ang) * near * w, cy + math.sin(ang) * near * h,
             cx + math.cos(ang) * far * w, cy + math.sin(ang) * far * h),
            fill=int(rng.uniform(28, 92)),
            width=rng.choice((2, 3, 4, 6, 9)),
        )
    return rays.filter(ImageFilter.GaussianBlur(w * 0.030))


# ── Variant definitions ──────────────────────────────────────────────────────
# `bokeh` focal points are in 0..1 coords of the CROPPED artwork, so they mean
# the same thing at every blur scale. `glows` centres are in 0..1 fractions of
# the finished canvas, placed on the bird's head, which build() derives from
# `fg_top` so the light stays locked to the bird if the band is ever moved.
#
# `fg_top` sits high on purpose. On a phone the hero copy fills the lower half
# of the section, so the artwork has to live in the upper half - park it in
# the middle and the two collide, with the headline landing on the wordmark.
#
#   bokeh  : (zoom, fx, fy, blur, brightness, saturation, amount)
#   glows  : (cx, cy, rx, ry, falloff, colour, strength)
#   feather: (top, bottom, left, right) as fractions of the artwork band

VARIANTS = {
    # Warm sunrise. A low, wide glow on the left echoing the direction the
    # light already comes from in the artwork, plus a lot of rising embers.
    "dawn": {
        "seed": 11,
        "sky": [(0.00, (8, 5, 4)), (0.14, (22, 11, 7)), (0.30, (52, 22, 10)),
                (0.44, (96, 40, 12)), (0.58, (58, 24, 9)), (0.74, (34, 15, 7)),
                (1.00, (10, 5, 4))],
        "bokeh": [(1.35, 0.020, 0.950, 0.040, 0.80, 1.30, 0.35)],
        "field_blur": 0.060, "field_amount": 0.70,
        "field_wide_blur": 0.15, "field_lift": 0.34,
        "glows": [(0.26, 0.40, 0.95, 0.52, 2.0, (255, 150, 50), 0.50),
                  (0.552, 0.20, 0.44, 0.26, 2.6, (255, 214, 150), 0.80)],
        "rays": 0, "embers": 160,
        "feather": (0.10, 0.12, 0.065, 0.065),
        "fg_top": 0.08, "fg_colour": 1.06, "fg_contrast": 1.05,
        "vignette": 0.55, "bloom": (0.022, 165, 0.50), "grain": (9, 0.32),
    },
    # Theatrical. Volumetric shafts bursting from behind the wings, cooler and
    # darker at the top so the light has somewhere to travel from.
    "ascend": {
        "seed": 29,
        "sky": [(0.00, (5, 6, 13)), (0.18, (18, 12, 14)), (0.38, (60, 28, 12)),
                (0.50, (120, 52, 16)), (0.66, (40, 18, 9)), (1.00, (8, 5, 5))],
        "bokeh": [(1.50, 0.400, 0.800, 0.045, 0.75, 1.30, 0.35)],
        "field_blur": 0.070, "field_amount": 0.62,
        "field_wide_blur": 0.17, "field_lift": 0.22,
        "glows": [(0.552, 0.18, 0.70, 0.38, 1.8, (255, 160, 55), 0.55),
                  (0.552, 0.18, 0.30, 0.18, 3.0, (255, 226, 170), 0.95)],
        "rays": 30, "embers": 100,
        "feather": (0.12, 0.14, 0.020, 0.020),
        "fg_top": 0.06, "fg_colour": 1.10, "fg_contrast": 1.10,
        "vignette": 0.68, "bloom": (0.028, 160, 0.62), "grain": (9, 0.34),
    },
    # Poster. Barely feathered, so the artwork reads as a deliberate band with
    # clean scrims above and below rather than a soft blob. Crisper, quieter,
    # the most "designed" of the three.
    "frame": {
        "seed": 47,
        "sky": [(0.00, (10, 6, 5)), (0.30, (30, 15, 8)), (0.50, (88, 38, 13)),
                (0.70, (34, 15, 7)), (1.00, (11, 6, 4))],
        "bokeh": [(1.60, 0.200, 0.900, 0.050, 0.80, 1.25, 0.32)],
        "field_blur": 0.075, "field_amount": 0.58,
        "field_wide_blur": 0.18, "field_lift": 0.20,
        "glows": [(0.552, 0.20, 0.62, 0.36, 2.2, (255, 165, 60), 0.42),
                  (0.552, 0.20, 0.34, 0.22, 2.8, (255, 220, 160), 0.62)],
        "rays": 0, "embers": 45,
        "feather": (0.020, 0.025, 0.008, 0.008),
        "fg_top": 0.08, "fg_colour": 1.04, "fg_contrast": 1.08,
        "vignette": 0.45, "bloom": (0.018, 168, 0.42), "grain": (9, 0.30),
    },
}


def _scale_colour(colour, s):
    return tuple(max(0, min(255, int(round(c * s)))) for c in colour)


def _vignette(img, strength, rx=0.80, falloff=1.7):
    """Circular falloff to black. Settles the eye on the bird and gives any
    overlaid text or the scroll cue somewhere safe to sit."""
    w, h = img.size
    mask = _radial_mask(w, h, 0.5, 0.5, rx, rx * w / h, falloff)
    mask = mask.point(lambda v: int(255 - (255 - v) * strength))
    return Image.composite(img, Image.new("RGB", (w, h), (0, 0, 0)), mask)


def build(source_path, width, height, variant=DEFAULT_VARIANT):
    """Compose one portrait hero canvas from the landscape desktop hero."""
    spec = VARIANTS[variant]
    rng = random.Random(spec["seed"])

    art = Image.open(source_path).convert("RGB")
    sw, sh = art.size
    art = art.crop((
        int(round(SRC_CROP[0] * sw)), int(round(SRC_CROP[1] * sh)),
        int(round(SRC_CROP[2] * sw)), int(round(SRC_CROP[3] * sh)),
    ))

    # 1. The sharp artwork, at the largest size the frame physically allows,
    #    and where it will finally sit. Resolved first because the backdrop
    #    below is derived FROM it - see the field step.
    fg_w = int(round(width * FG_WIDTH_RATIO))
    fg_h = max(1, round(fg_w * art.size[1] / art.size[0]))
    fg = art.resize((fg_w, fg_h), Image.Resampling.LANCZOS)
    fg = ImageEnhance.Color(fg).enhance(spec["fg_colour"])
    fg = ImageEnhance.Contrast(fg).enhance(spec["fg_contrast"])
    fx0 = (width - fg_w) // 2
    fy0 = int(round(height * spec["fg_top"]))

    # 2. Sky - the deep-to-warm vertical base the whole frame sits on.
    canvas = _vgrad(width, height, spec["sky"])

    # 3. THE BLEND FIELD. This is the step that decides whether the artwork
    #    looks pasted on or embedded. The field is a blurred copy of the
    #    artwork taken AT ITS FINAL POSITION, so the pixels sitting just
    #    outside the band are the artwork's own edge pixels, smeared. The
    #    sharp artwork therefore continues into the atmosphere instead of
    #    stepping against an unrelated blur - which is what left a visible
    #    rectangle floating in the frame on every earlier attempt.
    field = canvas.copy()
    field.paste(fg, (fx0, fy0))
    # Two different jobs, two different operators. A single blur always leaves
    # a visible edge where it stops - that edge is the "pasted-on rectangle"
    # tell.
    #
    #   pass 1 (tight, soft_light) tints. It borrows colour from the artwork's
    #     own edge pixels while leaving the sky's luminance alone.
    f = field.filter(ImageFilter.GaussianBlur(width * spec["field_blur"]))
    f = ImageEnhance.Color(f).enhance(1.20)
    canvas = Image.blend(canvas, ImageChops.soft_light(canvas, f),
                         spec["field_amount"])
    #
    #   pass 2 (wide, screen) LIFTS. soft_light is multiplicative: on a
    #     near-black sky it returns almost exactly the near-black sky, so the
    #     band ended up sitting on a much darker field than itself and its
    #     rectangular edge read instantly. Screen ADDS the artwork's light to
    #     the surround, so the surround matches the band instead of underlining
    #     it. The blur is wide enough that the lift has faded out well before
    #     the lower third, which is where the headline copy has to stay dark.
    f = field.filter(ImageFilter.GaussianBlur(width * spec["field_wide_blur"]))
    f = ImageEnhance.Color(f).enhance(1.20)
    canvas = ImageChops.screen(canvas, f.point(lambda v: int(v * spec["field_lift"])))

    # 4. Extra blur scales of the art for depth. The field handles the blend;
    #    these only add colour variation that a single blur cannot give.
    for zoom, bfx, bfy, blur, bright, sat, amount in spec["bokeh"]:
        layer = _zoom(art, width, height, zoom, bfx, bfy)
        layer = layer.filter(ImageFilter.GaussianBlur(width * blur))
        layer = ImageEnhance.Brightness(layer).enhance(bright)
        layer = ImageEnhance.Color(layer).enhance(sat)
        canvas = Image.blend(canvas, ImageChops.soft_light(canvas, layer), amount)

    # 5. The sunrise, screened on behind the bird.
    for cx, cy, rx, ry, fo, colour, strength in spec["glows"]:
        mask = _radial_mask(width, height, cx, cy, rx, ry, fo)
        canvas = ImageChops.screen(
            canvas, _tinted(mask, _scale_colour(colour, strength), width, height))

    # Where the bird's head actually lands on the finished canvas, so the
    # shafts and embers stay locked to it if `fg_top` is ever moved.
    head_x = int(width * 0.552)
    head_y = int(height * (spec["fg_top"] + 0.319 * (fg_h / height)))

    # 6. Shafts of light bursting from behind the wings.
    if spec["rays"]:
        shafts = _rays(width, height, head_x, head_y, spec["rays"], rng)
        canvas = ImageChops.screen(canvas, _tinted(shafts, (255, 190, 110), width, height))

    # 7. Embers.
    if spec["embers"]:
        canvas = ImageChops.screen(canvas, _embers(
            width, height, head_x, head_y, spec["embers"], rng, width / 1080.0))

    # 8. Composite the sharp artwork, lightly feathered now that the field
    #    already matches its edges.
    ft, fb, fl, fr = spec["feather"]
    mask = _feather_mask(fg_w, fg_h, int(fg_h * ft), int(fg_h * fb),
                         int(fg_w * fl), int(fg_w * fr))
    canvas.paste(fg, (fx0, fy0), mask)

    # 9. Bloom the highlights, 10. settle the edges, 11. dither the banding.
    radius, threshold, strength = spec["bloom"]
    canvas = _bloom(canvas, width * radius, threshold, strength)
    canvas = _vignette(canvas, spec["vignette"])
    canvas = _grain(canvas, *spec["grain"])
    return canvas


def save_jpeg(img, path, quality=88):
    # subsampling pinned to 4:4:4 - the wordmark has coloured edges that
    # chroma subsampling smears, and this is a hero people look straight at.
    img.save(path, "JPEG", quality=quality, subsampling=0, optimize=True, progressive=True)
    kb = os.path.getsize(path) / 1024
    print(f"  wrote {os.path.basename(path):<30} {img.size[0]}x{img.size[1]}  {kb:6.1f} KB")


def main():
    ap = argparse.ArgumentParser(description="Generate the portrait mobile hero.")
    ap.add_argument("--variant", choices=VARIANT_NAMES, default=DEFAULT_VARIANT,
                    help=f"which look to build (default: {DEFAULT_VARIANT})")
    ap.add_argument("--preview", action="store_true",
                    help="render every variant into scripts/_preview/ without touching public/")
    args = ap.parse_args()

    if not os.path.isfile(SOURCE):
        sys.exit(f"Source hero not found: {SOURCE}")

    with Image.open(SOURCE) as probe:
        print(f"source  {os.path.basename(SOURCE)}  {probe.size[0]}x{probe.size[1]}")

    if args.preview:
        os.makedirs(PREVIEW, exist_ok=True)

    for name in (VARIANT_NAMES if args.preview else (args.variant,)):
        print(f"building '{name}'...")
        master = build(SOURCE, MASTER_W, MASTER_H, name)
        small = master.resize((SMALL_W, SMALL_H), Image.Resampling.LANCZOS)
        if args.preview:
            save_jpeg(master, os.path.join(PREVIEW, f"hero-{name}.jpg"))
            save_jpeg(small, os.path.join(PREVIEW, f"hero-{name}-sm.jpg"))
        else:
            save_jpeg(master, OUT_MOBILE)
            save_jpeg(small, OUT_MOBILE_SM)

    print("done - Home.jsx serves these via <picture> at max-width: 640px.")


if __name__ == "__main__":
    main()
