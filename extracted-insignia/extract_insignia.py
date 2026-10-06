"""Extract the 87 pictured insignia without resampling the original artwork."""

from collections import deque
import csv
import json
from pathlib import Path
import textwrap
import unicodedata
from zipfile import ZipFile, ZIP_DEFLATED

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SOURCE = Path(r"C:\Users\uj\Downloads\GZS-CINI_2017-tisk-1-pdf.jpg")
ROOT = Path(__file__).resolve().parent
source = Image.open(SOURCE).convert("RGB")
items = []


def add(category, label, box):
    items.append({"category": category, "label": label, "search_box": box})


rank_names = [
    "Pionir", "Gasilec", "Višji gasilec", "Nižji gasilski častnik",
    "Gasilski častnik", "Višji gasilski častnik organizacijske smeri",
    "Višji gasilski častnik", "Visoki gasilski častnik organizacijske smeri",
    "Visoki gasilski častnik",
]
rank_x = [85, 242, 399, 555, 712, 868, 1027, 1182, 1339]
for row, top in enumerate([328, 530, 733]):
    for col, left in enumerate(rank_x):
        name = rank_names[col]
        if col == 0:
            name = ["Pionir", "Mladinec", "Gasilec pripravnik"][row]
        elif row:
            name += f" {'I' if row == 1 else 'II'}. stopnje"
        add("01_cini", name, (left, top, left + 110, top + 120))

specialties = [
    [
        "Strojnik", "Strojnik avtolestve", "Orodjar", "Nosilec dihalnega aparata",
        "Skrbnik dihalnih zaščitnih naprav", "Gašenje notranjih požarov - modul A",
        "Gašenje notranjih požarov - modul B", "Gašenje notranjih požarov - modul C",
    ],
    [
        "Uporabnik radijskih postaj", "Inštruktor radijskih zvez", "Tehnični reševalec",
        "Reševalec ob nesrečah z nevarnimi snovmi", "Gašenje požarov v naravnem okolju",
        "Vodja čolna", "Reševalec na vodi",
    ],
    [
        "Potapljač - 1 zvezdica", "Potapljač - 2 zvezdici", "Potapljač - 3 zvezdice",
        "Potapljač - 4 zvezdice", "Sodnik gasilskih in gasilskošportnih tekmovalnih disciplin",
        "Bolničar", "Zdravnik",
    ],
    [
        "Informatik", "Vodja članic", "Mentor mladine", "Mentor mladine I",
        "Preventivec", "Inštruktor", "Predavatelj",
    ],
]
special_x = [1499, 1591, 1683, 1775, 1867, 1959, 2051, 2143]
for row, top in enumerate([333, 478, 623, 769]):
    for col, name in enumerate(specialties[row]):
        add("02_specialnosti", name, (special_x[col], top, special_x[col] + 68, top + 90))

badge_y = [1098, 1226, 1368]
for top, name in zip(badge_y, ["Pionir - mladinec desetar", "Gasilec", "Operativni gasilec"]):
    add("03_osnovne_oznake", name, (108, top, 253, top + 80))

operational = [
    [
        "Desetar", "Poveljnik sektorja", "Član poveljstva GZ",
        "Regijski poveljnik in pomočnik poveljnika GZS",
    ],
    [
        "Vodnik, namestnik poveljnika in podpoveljnik PGD",
        "Namestnik občinskega poveljnika in občinski podpoveljnik",
        "Namestnik poveljnika in podpoveljnik GZ",
        "Namestnik poveljnika in podpoveljnik GZS",
    ],
    ["Poveljnik PGD", "Občinski poveljnik", "Poveljnik GZ", "Poveljnik GZS"],
]
for top, names in zip(badge_y, operational):
    for left, name in zip([325, 480, 635, 790], names):
        add("04_operativne_funkcije", name, (left, top, left + 147, top + 80))

organizational = [
    [
        "Član upravnega odbora PGD in član drugih voljenih organov PGD",
        "Član upravnega odbora GZ in član drugih voljenih organov GZ",
        "Član upravnega odbora GZS in član drugih voljenih organov GZS",
    ],
    ["Podpredsednik in tajnik PGD", "Podpredsednik in tajnik GZ", "Namestnik predsednika in podpredsednik GZS"],
    ["Predsednik PGD", "Predsednik GZ", "Predsednik GZS"],
]
for top, names in zip(badge_y, organizational):
    for left, name in zip([988, 1143, 1297], names):
        add("05_organizacijske_funkcije", name, (left, top, left + 147, top + 80))

honor_x = [1501, 1681, 1861, 2043]
for left, name in zip(honor_x, ["Častni poveljnik PGD", "Častni občinski poveljnik", "Častni poveljnik GZ", "Častni poveljnik GZS"]):
    add("06_castne_funkcije", name, (left, 1209, left + 167, 1305))
for left, name in zip([honor_x[0], honor_x[2], honor_x[3]], ["Častni predsednik PGD", "Častni predsednik GZ", "Častni predsednik GZS"]):
    add("06_castne_funkcije", name, (left, 1352, left + 167, 1449))


def slug(label):
    plain = unicodedata.normalize("NFKD", label).encode("ascii", "ignore").decode().lower()
    return "_".join("".join(c if c.isalnum() else " " for c in plain).split())


def largest_component(mask):
    height, width = mask.shape
    seen = np.zeros_like(mask)
    best = []
    for y, x in np.argwhere(mask):
        if seen[y, x]:
            continue
        queue = deque([(int(x), int(y))])
        seen[y, x] = True
        points = []
        while queue:
            px, py = queue.popleft()
            points.append((px, py))
            for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                if 0 <= nx < width and 0 <= ny < height and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((nx, ny))
        if len(points) > len(best):
            best = points
    return best


def convex_hull(points):
    # All pictured patches have convex outlines: trapezoids, parallelograms,
    # or rounded rectangles. The hull retains white interiors and fine symbols.
    points = sorted(set(points))
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def extract(item):
    crop = source.crop(item["search_box"])
    pixels = np.asarray(crop).astype(np.float32)
    edge = np.concatenate([pixels[0], pixels[-1], pixels[:, 0], pixels[:, -1]])
    background = np.median(edge, axis=0)
    distance = np.linalg.norm(pixels - background, axis=2)
    component = largest_component(distance > 24)
    if len(component) < 1500:
        raise RuntimeError(f"Patch detection failed: {item['label']}")
    hull = convex_hull(component)
    mask = Image.new("L", crop.size)
    ImageDraw.Draw(mask).polygon(hull, fill=255)
    rgba = crop.convert("RGBA")
    rgba.putalpha(mask)
    bounds = mask.getbbox()
    tight = rgba.crop(bounds)
    # Two transparent pixels around the silhouette prevent clipping in viewers.
    output = Image.new("RGBA", (tight.width + 4, tight.height + 4))
    output.paste(tight, (2, 2))
    folder = ROOT / item["category"]
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / (slug(item["label"]) + ".png")
    output.save(path)
    item["file"] = path.relative_to(ROOT).as_posix()
    item["size"] = list(output.size)
    left, top, _, _ = item["search_box"]
    item["source_bounds"] = [left + bounds[0], top + bounds[1], left + bounds[2], top + bounds[3]]
    return output


assert len(items) == 87
extracted = [extract(item) for item in items]
assert len({item["file"] for item in items}) == 87

font_path = Path(r"C:\Windows\Fonts\segoeui.ttf")
font = ImageFont.truetype(str(font_path), 16)
title_font = ImageFont.truetype(str(font_path), 26)
small_font = ImageFont.truetype(str(font_path), 13)
columns = 9
cell_width, cell_height = 220, 215
header = 80
rows = (len(items) + columns - 1) // columns
sheet = Image.new("RGB", (columns * cell_width, header + rows * cell_height), "#f6f7fa")
draw = ImageDraw.Draw(sheet)
draw.text((20, 14), "87 insignia extracted from the GZS 2017 poster", font=title_font, fill="#15233b")
draw.text((20, 50), "Original-resolution PNGs | Transparent backgrounds | Names match the poster", font=font, fill="#48556a")
for index, (item, insignia) in enumerate(zip(items, extracted)):
    col, row = index % columns, index // columns
    x, y = col * cell_width, header + row * cell_height
    draw.rounded_rectangle((x + 5, y + 5, x + cell_width - 5, y + cell_height - 5), radius=6, fill="white", outline="#d8dee8")
    # Preview enlargement only; exported PNGs retain their original pixels.
    preview = insignia.copy()
    preview.thumbnail((190, 125), Image.Resampling.LANCZOS)
    px, py = x + (cell_width - preview.width) // 2, y + 10 + (125 - preview.height) // 2
    sheet.paste(preview, (px, py), preview)
    draw.text((x + 12, y + 135), f"{index + 1:02d} | {item['category'][3:].replace('_', ' ')}", font=small_font, fill="#65718a")
    lines = textwrap.wrap(item["label"], width=28, break_long_words=False)
    for line_index, line in enumerate(lines[:4]):
        draw.text((x + 12, y + 154 + 15 * line_index), line, font=small_font, fill="#15233b")
sheet.save(ROOT / "preview.png")

overlay = source.copy()
overlay_draw = ImageDraw.Draw(overlay)
for index, item in enumerate(items):
    box = item["source_bounds"]
    overlay_draw.rectangle((box[0] - 2, box[1] - 2, box[2] + 1, box[3] + 1), outline="#ff00cc", width=2)
    overlay_draw.text((box[0], box[1] - 18), str(index + 1), font=small_font, fill="#ff00cc", stroke_width=1, stroke_fill="white")
overlay.save(ROOT / "source-crop-check.png")

with (ROOT / "index.csv").open("w", encoding="utf-8-sig", newline="") as stream:
    writer = csv.writer(stream)
    writer.writerow(["file", "name", "width", "height"])
    for item in items:
        writer.writerow([item["file"], item["label"], *item["size"]])
(ROOT / "manifest.json").write_text(json.dumps({"source": SOURCE.name, "source_size": list(source.size), "count": len(items), "items": items}, ensure_ascii=False, indent=2), encoding="utf-8")

archive = ROOT.parent / "gzs-insignia-png.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as zipped:
    for item in items:
        zipped.write(ROOT / item["file"], item["file"])
    zipped.write(ROOT / "index.csv", "index.csv")
    zipped.write(ROOT / "preview.png", "preview.png")

print(json.dumps({"count": len(items), "archive": str(archive), "preview": str(ROOT / "preview.png"), "categories": {category: sum(item["category"] == category for item in items) for category in dict.fromkeys(item["category"] for item in items)}}, indent=2))
