"""Refresh the self-hosted Chinese UI subset from the official Google Fonts API.

Reads only the website's public UI sources, never credentials or sibling projects.
Run from any directory: python scripts/update-ui-fonts.py
"""

from __future__ import annotations

import datetime as dt
import hashlib
import io
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request


ROOT = Path(__file__).resolve().parents[1]
UI_SOURCES = [
    "index.html",
    "src/main.js",
    "src/activity.js",
    "src/activity-data.js",
    "src/site-header.jsx",
    "src/magic-sections.jsx",
    "src/reactdrops.jsx",
    "src/agent-install.jsx",
    "src/components/community/arc-activity/activity-heatmap.tsx",
]
GENERATED_UI_TEXT = "星期一二三四五六日周月年少多零"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)
FONT_FILE = "noto-sans-sc-ui-400-700.woff2"
LICENSE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt"
START = "/* BEGIN self-hosted Noto Sans SC UI subset */"
END = "/* END self-hosted Noto Sans SC UI subset */"


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def unicode_ranges(characters: str) -> str:
    points = sorted(map(ord, characters))
    groups: list[tuple[int, int]] = []
    for point in points:
        if groups and groups[-1][1] + 1 == point:
            groups[-1] = (groups[-1][0], point)
        else:
            groups.append((point, point))
    return ", ".join(
        f"U+{first:04X}" if first == last else f"U+{first:04X}-{last:04X}"
        for first, last in groups
    )


def main() -> None:
    content = "\n".join((ROOT / path).read_text(encoding="utf-8") for path in UI_SOURCES) + GENERATED_UI_TEXT
    # Chinese UI text, CJK/full-width punctuation, common typographic punctuation
    # and digits. Latin glyphs continue to come from Schibsted Grotesk.
    characters = "".join(sorted(set(re.findall(
        r"[\u3400-\u4dbf\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\u2013-\u2014\u2018-\u2019\u201c-\u201d\u2026\u00b7]",
        content,
    )) | set("0123456789")))
    css_url = (
        "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400..700"
        "&display=swap&text=" + urllib.parse.quote(characters, safe="")
    )
    css_bytes = download(css_url)
    css = css_bytes.decode("utf-8")
    font_urls = list(dict.fromkeys(re.findall(r"url\((https://[^)]+)\)\s+format\(['\"]woff2['\"]\)", css)))
    if len(font_urls) != 1:
        raise RuntimeError(f"Expected one official WOFF2 text subset, found {len(font_urls)}")
    if not re.search(r"font-weight:\s*400\s+700\s*;", css):
        raise RuntimeError("Google Fonts did not return the requested variable weight range")
    font_url = font_urls[0]
    font_bytes = download(font_url)
    if not font_bytes.startswith(b"wOF2"):
        raise RuntimeError("Downloaded font is not a WOFF2 file")
    license_bytes = download(LICENSE_URL)
    if b"SIL OPEN FONT LICENSE" not in license_bytes:
        raise RuntimeError("Official font license response is invalid")

    # fontTools is optional for regeneration. When available, verify actual
    # character coverage and variable axes rather than just the stylesheet.
    verification: dict = {"woff2Signature": True, "apiWeightRange": "400 700"}
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        verification["fontTools"] = "not installed; API/signature verified"
    else:
        font = TTFont(io.BytesIO(font_bytes))
        cmap = font.getBestCmap()
        missing = [character for character in characters if ord(character) not in cmap]
        if missing:
            raise RuntimeError(f"Official subset is missing requested characters: {''.join(missing)}")
        axes = [
            {"tag": axis.axisTag, "minimum": axis.minValue, "default": axis.defaultValue, "maximum": axis.maxValue}
            for axis in font["fvar"].axes
        ]
        if not any(axis["tag"] == "wght" and axis["minimum"] <= 400 and axis["maximum"] >= 700 for axis in axes):
            raise RuntimeError("Downloaded font does not contain the requested variable weight axis")
        verification.update({"cmapMissingCharacters": 0, "variableAxes": axes})

    downloaded_at = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    entry = {
        "family": "Noto Sans SC",
        "weight": "400 700",
        "file": FONT_FILE,
        "bytes": len(font_bytes),
        "sha256": hashlib.sha256(font_bytes).hexdigest(),
        "cssUrl": css_url,
        "cssSha256": hashlib.sha256(css_bytes).hexdigest(),
        "fontUrl": font_url,
        "licenseUrl": LICENSE_URL,
        "licensePath": "licenses/font-notosanssc-OFL.txt",
        "downloadedAt": downloaded_at,
        "subsetText": characters,
        "subsetGlyphCount": len(characters),
        "subsetSources": UI_SOURCES,
        "generatedUILabels": GENERATED_UI_TEXT,
        "verification": verification,
    }
    metadata_path = ROOT / "public/fonts/sources.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["fonts"] = [item for item in metadata["fonts"] if item["file"] != FONT_FILE] + [entry]
    faces_path = ROOT / "src/fonts.css"
    faces = faces_path.read_text(encoding="utf-8")
    addition = f"""{START}
/* Official Google Fonts Noto Sans SC variable 400–700, SIL OFL 1.1.
   Generated from the public UI source whitelist by scripts/update-ui-fonts.py. */
@font-face {{
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url(/fonts/{FONT_FILE}) format('woff2');
  unicode-range: {unicode_ranges(characters)};
}}
{END}"""
    if START in faces:
        faces = re.sub(re.escape(START) + r"[\s\S]*?" + re.escape(END), lambda _: addition, faces)
    else:
        faces = faces.rstrip() + "\n\n" + addition + "\n"

    # All responses and checks complete before replacing local artifacts.
    (ROOT / "public/fonts" / FONT_FILE).write_bytes(font_bytes)
    (ROOT / "licenses/font-notosanssc-OFL.txt").write_bytes(license_bytes)
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    faces_path.write_text(faces, encoding="utf-8")
    print(json.dumps({
        "file": FONT_FILE,
        "bytes": len(font_bytes),
        "characters": len(characters),
        "sha256": entry["sha256"],
        "verification": verification,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
