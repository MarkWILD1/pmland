# -*- coding: utf-8 -*-
"""Sample colored particle targets from Refero/Dala reference frames."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "videos" / "ref-dala-particles.mp4"
OUT_DIR = ROOT / "assets" / "data" / "particles"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# (name, timestamp_sec, crop_hint) — crop focuses on the shape region
SHAPES = [
    ("brain", 2.5, (0.42, 0.08, 0.98, 0.92)),   # right half
    ("lamp", 21.0, (0.02, 0.05, 0.62, 0.98)),    # left half — Spark lightbulb
    ("earth", 28.0, (0.42, 0.08, 0.98, 0.95)),   # right half
]

COUNT = 4200


def extract_frame(ts: float, dest: Path) -> Path:
    import subprocess

    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            str(ts),
            "-i",
            str(VIDEO),
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )
    return dest


def sample_shape(img_path: Path, crop: tuple[float, float, float, float], count: int):
    im = Image.open(img_path).convert("RGB")
    w, h = im.size
    x0, y0, x1, y1 = crop
    box = (int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))
    region = im.crop(box)
    arr = np.asarray(region, dtype=np.float32)
    rw, rh = region.size

    # Brightness / chroma mask — ignore near-black UI text areas
    lum = arr.mean(axis=2)
    chroma = arr.max(axis=2) - arr.min(axis=2)
    mask = (lum > 28) & ((chroma > 12) | (lum > 90))

    ys, xs = np.where(mask)
    if len(xs) < 100:
        raise RuntimeError(f"Too few pixels in {img_path.name}: {len(xs)}")

    # Prefer edge-ish / brighter samples with stratified random
    weights = (lum[ys, xs] / 255.0) * (0.35 + chroma[ys, xs] / 255.0)
    weights = weights / weights.sum()
    idx = np.random.choice(len(xs), size=min(count, len(xs)), replace=False, p=weights)

    # Normalize to local [-1,1] centered on crop
    nx = (xs[idx] / max(rw - 1, 1)) * 2 - 1
    ny = (ys[idx] / max(rh - 1, 1)) * 2 - 1
    colors = arr[ys[idx], xs[idx]].astype(np.uint8)

    pts = []
    for i in range(len(nx)):
        r, g, b = map(int, colors[i])
        pts.append(
            {
                "x": round(float(nx[i]), 4),
                "y": round(float(ny[i]), 4),
                "c": f"#{r:02x}{g:02x}{b:02x}",
            }
        )
    return pts


def main():
    np.random.seed(42)
    frames_dir = ROOT / "assets" / "videos" / "ref-key"
    frames_dir.mkdir(parents=True, exist_ok=True)

    catalog = {}
    for name, ts, crop in SHAPES:
        frame = frames_dir / f"sample-{name}.jpg"
        extract_frame(ts, frame)
        pts = sample_shape(frame, crop, COUNT)
        out = OUT_DIR / f"{name}.json"
        out.write_text(json.dumps({"name": name, "count": len(pts), "points": pts}), encoding="utf-8")
        catalog[name] = str(out.relative_to(ROOT)).replace("\\", "/")
        print(f"{name}: {len(pts)} pts -> {out}")

    (OUT_DIR / "catalog.json").write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
