#!/usr/bin/env python3
"""
public/markalar klasöründeki marka logolarını PNG formatına çevirir ve
arka planlarını temiz beyaza (255,255,255) dönüştürür.

Kullanım:
    python3 scripts/convert-logos.py
"""

import os
import sys
import numpy as np
from PIL import Image

MARKALAR_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "markalar")
VALID_EXT = {".png", ".jpg", ".jpeg", ".webp"}

# Bir pikseli "beyaza yakın" saymak için eşikler: yeterince parlak (BRIGHTNESS_THRESH)
# ve renk doygunluğu düşük (kanallar arası fark <= SATURATION_THRESH) olmalı.
# Böylece JPEG sıkıştırma griliği / hafif gölgeler temiz beyaza dönerken,
# logonun kendi (doygun) renkleri dokunulmadan kalır.
BRIGHTNESS_THRESH = 225
SATURATION_THRESH = 20


def whiten_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size

    # Şeffaf alanları beyaz üzerine düzleştir
    white_bg = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    img = Image.alpha_composite(white_bg, img).convert("RGB")

    arr = np.array(img).astype(np.int16)
    channel_min = arr.min(axis=2)
    channel_max = arr.max(axis=2)
    near_white = (channel_min >= BRIGHTNESS_THRESH) & ((channel_max - channel_min) <= SATURATION_THRESH)
    arr[near_white] = (255, 255, 255)

    return Image.fromarray(arr.astype(np.uint8), "RGB")


def main():
    if not os.path.isdir(MARKALAR_DIR):
        print(f"Klasör bulunamadı: {MARKALAR_DIR}", file=sys.stderr)
        sys.exit(1)

    converted = []
    for fname in sorted(os.listdir(MARKALAR_DIR)):
        name, ext = os.path.splitext(fname)
        if ext.lower() not in VALID_EXT:
            continue

        src_path = os.path.join(MARKALAR_DIR, fname)
        out_path = os.path.join(MARKALAR_DIR, name + ".png")

        with Image.open(src_path) as img:
            result = whiten_background(img)

        tmp_path = out_path + ".tmp"
        result.save(tmp_path, "PNG")
        os.replace(tmp_path, out_path)

        if src_path != out_path and os.path.exists(src_path):
            os.remove(src_path)

        converted.append((fname, name + ".png"))
        print(f"{fname} -> {name}.png")

    print(f"\nToplam {len(converted)} görsel işlendi.")


if __name__ == "__main__":
    main()
