"""Build verified OFL Chinese webfont subsets from this website's public UI.

python scripts/update-ui-fonts.py
python scripts/update-ui-fonts.py --preview-dir output/playwright/font-preview

The preview option writes no production assets. fontTools verifies the actual
cmap and weight axis before either font or its CSS/metadata is replaced.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import io
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parents[1]
UI_SOURCES = [
    "index.html", "src/main.js", "src/activity.js", "src/activity-data.js",
    "src/site-header.jsx", "src/magic-sections.jsx", "src/reactdrops.jsx",
    "src/agent-install.jsx", "src/agent-catalog.js",
    "src/components/liquid-agent-input.jsx",
    "src/components/community/arc-activity/activity-heatmap.tsx",
    "public/art/gallery-1.svg", "public/art/gallery-2.svg", "public/art/gallery-3.svg",
]
GENERATED_UI_TEXT = "星期一二三四五六日周月年少多零"
# The Latin subsets do not contain diagonal arrows. Include visible UI symbols
# explicitly so controls cannot silently use a system face.
UI_SYMBOLS = "↗↘↙↖←→↑↓"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)
FAMILIES = [
    ("Noto Sans SC", "notosanssc", "noto-sans-sc-ui-400-700.woff2"),
    ("Noto Serif SC", "notoserifsc", "noto-serif-sc-ui-400-700.woff2"),
]


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def unicode_ranges(characters: str) -> str:
    groups: list[tuple[int, int]] = []
    for point in sorted(map(ord, characters)):
        if groups and groups[-1][1] + 1 == point:
            groups[-1] = (groups[-1][0], point)
        else:
            groups.append((point, point))
    return ", ".join(
        f"U+{first:04X}" if first == last else f"U+{first:04X}-{last:04X}"
        for first, last in groups
    )


def collect_characters() -> str:
    content = "\n".join((ROOT / path).read_text(encoding="utf-8") for path in UI_SOURCES)
    # Outlined SVGs retain each original string as an accessible label.
    content += GENERATED_UI_TEXT
    return "".join(sorted(set(re.findall(
        r"[\u3400-\u4dbf\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\u2013-\u2014\u2018-\u2019\u201c-\u201d\u2026\u00b7]",
        content,
    )) | set("0123456789" + UI_SYMBOLS)))


def build_font(family: str, slug: str, filename: str, characters: str) -> tuple[dict, bytes, bytes]:
    css_url = (
        "https://fonts.googleapis.com/css2?family=" + urllib.parse.quote_plus(family)
        + ":wght@400..700&display=swap&text=" + urllib.parse.quote(characters, safe="")
    )
    css_bytes = download(css_url)
    css = css_bytes.decode("utf-8")
    urls = list(dict.fromkeys(re.findall(r"url\((https://[^)]+)\)\s+format\(['\"]woff2['\"]\)", css)))
    if len(urls) != 1 or not re.search(r"font-weight:\s*400\s+700\s*;", css):
        raise RuntimeError(f"{family}: expected one official variable WOFF2 subset")
    font_bytes = download(urls[0])
    if not font_bytes.startswith(b"wOF2"):
        raise RuntimeError(f"{family}: invalid WOFF2 signature")
    license_url = f"https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/OFL.txt"
    license_bytes = download(license_url)
    if b"SIL OPEN FONT LICENSE" not in license_bytes:
        raise RuntimeError(f"{family}: invalid OFL response")
    font = TTFont(io.BytesIO(font_bytes))
    missing = [character for character in characters if ord(character) not in font.getBestCmap()]
    if missing:
        raise RuntimeError(f"{family}: cmap missing {''.join(missing)}")
    axes = [
        {"tag": a.axisTag, "minimum": a.minValue, "default": a.defaultValue, "maximum": a.maxValue}
        for a in font["fvar"].axes
    ]
    if not any(a["tag"] == "wght" and a["minimum"] <= 400 and a["maximum"] >= 700 for a in axes):
        raise RuntimeError(f"{family}: requested weight axis absent")
    entry = {
        "family": family, "weight": "400 700", "file": filename,
        "bytes": len(font_bytes), "sha256": hashlib.sha256(font_bytes).hexdigest(),
        "cssUrl": css_url, "cssSha256": hashlib.sha256(css_bytes).hexdigest(),
        "fontUrl": urls[0], "licenseUrl": license_url, "licensePath": f"licenses/font-{slug}-OFL.txt",
        "downloadedAt": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "subsetText": characters, "subsetGlyphCount": len(characters),
        "subsetSources": UI_SOURCES, "generatedUILabels": GENERATED_UI_TEXT, "uiSymbols": UI_SYMBOLS,
        "verification": {"woff2Signature": True, "apiWeightRange": "400 700", "cmapMissingCharacters": 0, "variableAxes": axes},
    }
    # Chromium can retain a decoded font across a CSS/HMR update when its URL
    # stays identical. Tie the local URL to bytes so new copy uses its new cmap.
    entry["localUrl"] = f"/fonts/{filename}?v={entry['sha256'][:12]}"
    return entry, font_bytes, license_bytes


def outline_gallery() -> None:
    """Convert only existing text elements, using the site's licensed OFL faces.

    Keep original x/y, font sizes, letter spacing, colors and text anchoring.
    Arial/YaHei are never read or converted. Repeated runs leave paths intact.
    """
    cache = {}

    def face(is_cjk: bool, weight: int):
        key = (is_cjk, weight)
        if key not in cache:
            filename = "noto-sans-sc-ui-400-700.woff2" if is_cjk else "schibsted-grotesk-latin-400-700.woff2"
            source = TTFont(ROOT / "public/fonts" / filename)
            cache[key] = instantiateVariableFont(source, {"wght": weight}, inplace=False)
        return cache[key]

    def replace(match):
        element = ET.fromstring(match.group())
        text = element.text or ""
        size = float(element.get("font-size", "16"))
        weight = int(element.get("font-weight", "400"))
        spacing = float(element.get("letter-spacing", "0"))
        x, y = float(element.get("x", "0")), float(element.get("y", "0"))
        glyphs = []
        width = 0
        for char in text:
            font = face(ord(char) >= 0x3000, weight)
            name = font.getBestCmap().get(ord(char))
            if name is None:
                raise RuntimeError(f"Cannot outline missing glyph {char!r}")
            scale = size / font["head"].unitsPerEm
            glyphs.append((font.getGlyphSet(), name, scale, width))
            width += font["hmtx"].metrics[name][0] * scale + spacing
        width -= spacing if text else 0
        if element.get("text-anchor") == "middle":
            x -= width / 2
        elif element.get("text-anchor") == "end":
            x -= width
        commands = []
        for glyph_set, name, scale, advance in glyphs:
            pen = SVGPathPen(glyph_set, ntos=lambda n: f"{n:.4f}".rstrip("0").rstrip("."))
            glyph_set[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x + advance, y)))
            commands.append(pen.getCommands())
        attributes = {"role": "img", "aria-label": text, "fill": element.get("fill", "currentColor"), "data-ofl-outlines": "Schibsted Grotesk + Noto Sans SC"}
        group = ET.Element("g", attributes)
        ET.SubElement(group, "path", {"d": "".join(commands)})
        return ET.tostring(group, encoding="unicode", short_empty_elements=True)

    for i in range(1, 4):
        path = ROOT / f"public/art/gallery-{i}.svg"
        content = path.read_text(encoding="utf-8")
        content, count = re.subn(r"<text\b[^>]*>[\s\S]*?</text>", replace, content)
        path.write_text(content, encoding="utf-8")
        print(f"{path.relative_to(ROOT)}: outlined {count} text elements")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preview-dir", type=Path)
    parser.add_argument("--outline-gallery", action="store_true", help="Replace gallery SVG text with licensed OFL paths after rebuilding fonts")
    args = parser.parse_args()
    characters = collect_characters()
    # Complete every download and verification before replacing production files.
    built = [build_font(*family, characters) for family in FAMILIES]
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        for entry, font_bytes, _ in built:
            (args.preview_dir / entry["file"]).write_bytes(font_bytes)
        (args.preview_dir / "sources.json").write_text(json.dumps([b[0] for b in built], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        metadata_path = ROOT / "public/fonts/sources.json"
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        filenames = {f[2] for f in FAMILIES}
        metadata["fonts"] = [item for item in metadata["fonts"] if item["file"] not in filenames]
        for item in metadata["fonts"]:
            if item["file"] == "noto-serif-sc-headings-400.woff2":
                item["active"] = False
                item["replacedBy"] = "noto-serif-sc-ui-400-700.woff2"
        metadata["fonts"].extend(b[0] for b in built)
        faces_path = ROOT / "src/fonts.css"
        faces = faces_path.read_text(encoding="utf-8")
        # Retire the original narrow static Serif declaration; retain its source
        # metadata and asset as historical evidence.
        faces = re.sub(r"/\* Noto Serif SC: official Google Fonts distribution; SIL OFL 1\.1\. \*/\s*@font-face\s*\{[^}]+\}\s*", "", faces)
        for entry, font_bytes, license_bytes in built:
            family = entry["family"]
            start = f"/* BEGIN self-hosted {family} UI subset */"
            end = f"/* END self-hosted {family} UI subset */"
            addition = f"""{start}
/* Official Google Fonts {family} variable 400–700, SIL OFL 1.1.
   Generated from public UI sources by scripts/update-ui-fonts.py. */
@font-face {{
  font-family: '{family}';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url({entry['localUrl']}) format('woff2');
  unicode-range: {unicode_ranges(characters)};
}}
{end}"""
            if start in faces:
                faces = re.sub(re.escape(start) + r"[\s\S]*?" + re.escape(end), lambda _: addition, faces)
            else:
                faces = faces.rstrip() + "\n\n" + addition + "\n"
            (ROOT / "public/fonts" / entry["file"]).write_bytes(font_bytes)
            (ROOT / entry["licensePath"]).write_bytes(license_bytes)
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        faces_path.write_text(faces, encoding="utf-8")
        if args.outline_gallery:
            outline_gallery()
    print(json.dumps([{
        "file": entry["file"], "bytes": entry["bytes"], "characters": len(characters),
        "sha256": entry["sha256"], "verification": entry["verification"],
    } for entry, _, _ in built], ensure_ascii=False))


if __name__ == "__main__":
    main()
