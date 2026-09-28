"""
Generate the DEDICATED MOBILE hero image from the existing desktop hero.

WHY THIS EXISTS
---------------
The home hero (/public/hero-phoenix.jpg) is a 1324x783 LANDSCAPE composition.
The hero section is `min-h-screen` with `object-cover`, so on a phone
(~390x844, portrait 0.46:1) the browser matches by height and crops ~62% of
the image width away - the phoenix's wings and the GREGGORY wordmark get
sliced off. Tablets and PCs render it perfectly and must not change.

So we build a separate PORTRAIT 9:16 asset for phones. Nothing is cropped:
the full 1324x783 composition is scaled down to sit centred on a taller
canvas, and the surrounding space is filled with a blurred, darkened,
"cover"-scaled copy of the same artwork. That is the standard vertical-from-
horizontal treatment - it reads as an intentional letterbox rather than a
broken crop, and keeps the brand colours continuous to the edges.

A smaller 720x1280 rendition is also emitted so low-DPR / small handsets
download ~60% less. Home.jsx wires both through a <picture> srcSet.

DEPENDENCY: Pillow (Pillow>=9). Nothing else.

RE-RUN whenever the desktop hero art changes:
    python scripts/generate-mobile-hero.py
"""

import math
import os
import sys

try:
    from PIL import Image, ImageEnhance, ImageFilter
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

SOURCE = os.path.join(PUBLIC, "hero-phoenix.jpg")
OUT_MOBILE = os.path.join(PUBLIC, "hero-phoenix-mobile.jpg")
OUT_MOBILE_SM = os.path.join(PUBLIC, "hero-phoenix-mobile-sm.jpg")

# ── Composition ──────────────────────────────────────────────────────────────
MASTER_W, MASTER_H = 1080, 1920   # 9:16, covers every modern phone
SMALL_W, SMALL_H = 720, 1280      # lighter rendition for srcSet

# The artwork keeps a horizontal margin inside the canvas so the outermost
# wingtips/letter edges are never the first thing `object-cover` clips.
FG_WIDTH_RATIO = 0.93             # foreground occupies 93% of canvas width

# Slightly above true centre: leaves comfortable room under the wordmark for
# the scroll cue that Home.jsx renders at the bottom of the hero.
FG_CENTRE_RATIO = 0.46            # fraction of canvas height



def _cover(img, width, height):
    """Scale `img` so it fully covers width x height, then centre-crop."""
    src_w, src_h = img.size
    scale = max(width / src_w, height / src_h)
    new_w, new_h = math.ceil(src_w * scale), math.ceil(src_h * scale)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - width) // 2
    top = (new_h - height) // 2
    return resized.crop((left, top, left + width, top + height))


def _feather_mask(width, height, feather_ratio=0.10):
    """Alpha mask: 255 through the middle, ramping to 0 at all four edges.

    The foreground is pasted through this mask so it dissolves into the
    backdrop instead of showing a hard rectangle seam. `feather_ratio` is
    measured against the SHORT side so wide-but-short art still feathers
    enough to blend.
    """
    mask = Image.new("L", (width, height), 255)
    pixels = mask.load()
    fx = max(1, int(min(width, height) * feather_ratio))
    fy = max(1, int(min(width, height) * feather_ratio))
    for y in range(height):
        for x in range(width):
            dx = min(x, width - 1 - x)
            dy = min(y, height - 1 - y)
            d = min(dx / fx, dy / fy, 1.0)
            # smoothstep keeps the ramp from looking like a linear gradient
            pixels[x, y] = int(255 * (d * d * (3 - 2 * d)))
    return mask


def _vignette(width, height, strength=0.45):
    """Black alpha mask, transparent through the middle band, dark at the edges.

    Keeps the hero readable if a caption or the scroll cue ever overlaps the
    art, and settles the outermost falloff.
    """
    mask = Image.new("L", (width, height), 0)
    pixels = mask.load()
    feather = max(1, int(height * 0.22))
    edge = int(strength * 255)
    for y in range(height):
        if y < feather:
            a = int(edge * (1 - y / feather))
        elif y > height - feather:
            a = int(edge * (1 - (height - 1 - y) / feather))
        else:
            a = 0
        for x in range(width):
            pixels[x, y] = a
    return mask



def build_master(source_path, width, height):
    """Compose one portrait hero canvas from the landscape desktop hero."""
    art = Image.open(source_path).convert("RGB")

    # 1. Backdrop: same artwork, cover-scaled, heavily blurred. It fills the
    #    space above and below the real composition. Brightness is kept close
    #    to the foreground so the blend is invisible.
    backdrop = _cover(art, width, height)
    backdrop = backdrop.filter(ImageFilter.GaussianBlur(radius=height * 0.045))
    backdrop = ImageEnhance.Brightness(backdrop).enhance(0.40)
    backdrop = ImageEnhance.Color(backdrop).enhance(1.30)

    # 2. Foreground: the full composition, scaled to fit, never cropped.
    fg_w = int(width * FG_WIDTH_RATIO)
    fg_h = max(1, round(fg_w * art.size[1] / art.size[0]))
    foreground = art.resize((fg_w, fg_h), Image.Resampling.LANCZOS)

    # 3. Composite it at the optical centre, through a feathered alpha mask so
    #    the artwork dissolves into the backdrop with no rectangle seam.
    canvas = backdrop.copy()
    x = (width - fg_w) // 2
    y = int(height * FG_CENTRE_RATIO) - fg_h // 2
    y = max(0, min(y, height - fg_h))
    canvas.paste(foreground, (x, y), _feather_mask(fg_w, fg_h, feather_ratio=0.20))

    # 4. Settle the outermost falloff for any overlaid text / scroll cue.
    shade = Image.new("RGB", canvas.size, (0, 0, 0))
    return Image.composite(shade, canvas, _vignette(width, height))


def save_jpeg(img, path, quality=86):
    # Subsampling pinned to 4:4:4 (quality>=90 does this automatically) -
    # the wordmark has coloured edges that chroma subsampling smears.
    img.save(
        path,
        "JPEG",
        quality=quality,
        subsampling=0,
        optimize=True,
        progressive=True,
    )
    kb = os.path.getsize(path) / 1024
    name = os.path.basename(path)
    print(f"  wrote {name:<32} {img.size[0]}x{img.size[1]}  {kb:6.1f} KB")


def main():
    if not os.path.isfile(SOURCE):
        sys.exit(f"Source hero not found: {SOURCE}")

    with Image.open(SOURCE) as probe:
        print(f"source  {os.path.basename(SOURCE)}  {probe.size[0]}x{probe.size[1]}")

    print("building mobile hero...")
    master = build_master(SOURCE, MASTER_W, MASTER_H)
    save_jpeg(master, OUT_MOBILE)

    # Small rendition: downscale the finished composition so the two files
    # always match (never a separate crop that could drift out of sync).
    small = master.resize((SMALL_W, SMALL_H), Image.Resampling.LANCZOS)
    save_jpeg(small, OUT_MOBILE_SM)

    print("done - Home.jsx serves these via <picture> at max-width: 640px.")


if __name__ == "__main__":
    main()
