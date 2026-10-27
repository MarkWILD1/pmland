"""Convierte el dibujo de brain.png en una máscara de trazos (alpha = tinta) a 3x para logo-to-orb."""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "images" / "brain.png"
OUT = Path(__file__).resolve().parent / "brain-strokes.png"
SCALE = 3
LOW, HIGH = 0.18, 0.62

im = Image.open(SRC).convert("RGBA")
im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
gray = im.convert("L").filter(ImageFilter.GaussianBlur(0.6))
alpha_src = im.getchannel("A")

px = gray.load()
pa = alpha_src.load()
out = Image.new("RGBA", im.size, (0, 0, 0, 0))
po = out.load()
for y in range(im.height):
    for x in range(im.width):
        if pa[x, y] < 128:
            continue
        ink = 1 - px[x, y] / 255
        t = (ink - LOW) / (HIGH - LOW)
        t = 0 if t < 0 else 1 if t > 1 else t
        if t > 0:
            po[x, y] = (20, 20, 20, int(t * 255))

out.save(OUT)
print(OUT, out.size)
