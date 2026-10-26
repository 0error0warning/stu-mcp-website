# Local font audit — 2026-10-26

The two Hero text styles were already rendering with the self-hosted Noto Sans SC before this change. Chromium CDP confirmed 29 custom glyphs in the lede, four custom SemiBold glyphs in the primary action, and six custom Medium glyphs in the secondary action. This was a typography preference, not a system-font fallback bug. The adopted preview changes the Hero lede to Noto Serif SC 400 and both Hero action labels to real 600. Ordinary body text, filters and the installation composer keep Schibsted Grotesk + Noto Sans SC. Gloock remains the Latin display face.

The actual fallback found by the initial full-page audit was the diagonal `↗` in text links: the Latin font subsets and Noto subsets did not contain it, so CDP reported Microsoft YaHei. The rebuilt Noto subsets explicitly cover the page's arrow symbols. The old Serif face was a static 400 subset of 162 characters; it could not supply the declared FAQ 500 weight. It is now replaced by a variable 400–700 face with current source coverage. Its original asset and manifest entry remain as inactive historical evidence.

## Font assets and reproducibility

All fonts are official Google Fonts downloads, licensed SIL OFL 1.1. Exact request URLs, response URLs, source lists, hashes, download times, axis verification and subset text are recorded in `public/fonts/sources.json`; OFL notices remain under `licenses/font-*-OFL.txt`.

| Active asset | Bytes | CSS weights | Actual font axis | Requested characters / missing |
| --- | ---: | --- | --- | --- |
| `gloock-latin-400.woff2` | 26,356 | 400 | Static | Existing Latin subset |
| `schibsted-grotesk-latin-400-700.woff2` | 46,752 | 400–700 | 400–900 | Existing Latin subset |
| `noto-sans-sc-ui-400-700.woff2` | 134,908 | 400–700 | 100–900 | 481 / 0 |
| `noto-serif-sc-ui-400-700.woff2` | 172,172 | 400–700 | 200–900 | 481 / 0 |

The four active assets total 380,188 bytes after the final product-copy pass. Font URLs are local `/fonts/` URLs; the reduced-motion request trace requested all four locally and had no font failures. The larger Serif face supplies real weights and current UI characters rather than relying on synthesis. Font display remains `swap`, and the existing `font-synthesis: none` remains in effect. Generated Noto URLs include a byte-hash query parameter so Chromium cannot retain a decoded older subset after a source/HMR update; the unversioned file names remain stable on disk.

Regenerate with `python scripts/update-ui-fonts.py`. It requires fontTools and checks both actual cmap coverage and the `wght` axis before replacing production artifacts. Its source whitelist includes `src/agent-catalog.js` and `src/components/liquid-agent-input.jsx`, as well as the public page and dynamically generated labels. `--preview-dir output/playwright/font-preview` downloads and verifies without changing production fonts. These are page-specific subsets, not complete Chinese font files; new UI copy must be included and rebuilt. Arbitrary user-entered text outside the subset can use the configured fallback families.

The internal variable-family names reported by CDP contain “Thin” for Sans and “ExtraLight” for Serif. Those are font name-table values, not the selected weight. For example, the actual primary-action PostScript name is `Noto-Serif-SC-ExtraLight-SemiBold` at CSS 600, and the FAQ reports `Noto-Serif-SC-ExtraLight-Medium` at CSS 500. The raw results preserve these names instead of relabeling them.

## Gallery typography

The three external SVG illustrations used Arial and Microsoft YaHei/PingFang text elements. External image SVGs cannot inherit the page's webfonts. Nine text elements are now paths produced from the local OFL Schibsted Grotesk and Noto Sans SC faces, at the original sizes, 400/600 weights, x/y positions, colors, letter spacing and text anchoring. No system-font outlines were read or copied. Accessible strings remain as `aria-label` on each outlined group. The conversion used the 471-character Noto Sans stage (`db491733ac81eb68f7b0167d056c661e99e44c36a667747788465be9778fdfa3`) and unchanged Schibsted asset; later subset expansion does not rewrite existing SVG outlines.

`python scripts/update-ui-fonts.py --outline-gallery` also converts remaining `<text>` elements; subsequent runs leave existing paths intact. To change an outlined string, restore/edit its text element before converting it again. Original source text remains in Git history. The verification JSON compares all non-text markup against the prior revision; illustration geometry is unchanged. The only visual font replacement is within the original text areas.

## Actual browser verification

Used a separate local Chromium session on `http://127.0.0.1:5173/`. Each run scrolled the whole page to activate lazy/revealed sections, waited for fonts, and used `DOM.getDocument`, `DOM.querySelector`, and **`CSS.getPlatformFontsForNode`** for each rendered text leaf. All six FAQ answers were then opened and inspected. The textarea was inspected through its native user-agent shadow editor, because querying only its host returns no glyphs. Both Agent/model popovers were opened and all eight options in each inspected, including their descriptions/providers and captions. Computed CSS is recorded alongside actual font usage, not used as a substitute for it.

| Viewport / theme | Text records inspected | Records with system glyphs | Document width | Page errors |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 1000 / light | 233 | 0 | 1440 | 0 |
| 821 × 900 / light | 233 | 0 | 821 | 0 |
| 390 × 844 / light | 228 | 0 | 390 | 0 |
| 390 × 844 / dark | 228 | 0 | 390 | 0 |
| 1440 × 1000 / dark | 233 | 0 | 1440 | 0 |

The total includes seven initial records without glyphs: six closed FAQ answers, subsequently verified open, and the textarea host, subsequently verified through its shadow editor. All actual rendered records used custom fonts. No missing images appeared in these runs. Menus were opened using pointer clicks and dismissed with Escape. This audit does not replace the parent task's broader keyboard/touch interaction tests.

The five full-page stages above used the 471-character font stage, before the last product-copy changes. After the final #ideas wording, scenario 03 theory-timetable example, and three-group #lifecycle replacement, both fonts were rebuilt to 481 characters with zero actual cmap omissions. An additional 821px CDP pass inspected 12 rendered nodes across those changed areas, including each capability heading and description: all 12 used custom fonts with zero system fallback. The text-animated #ideas lede was queried at its rendered segment, rather than its empty wrapper. Results are preserved separately as `qa/fonts/cdp-newcopy.json`. This is a focused final-copy check, not a claim that the entire five-stage sweep was repeated.

An additional 390px reduced-motion run confirmed the same three Hero font selections, no horizontal overflow, and no clipping in either CTA or lede. Motion emits its expected reduced-motion informational warning. A navigation-related aborted `/api/activity` request was recorded in that extra trace; no font request failed. An earlier standalone SVG screenshot stage produced a `/favicon.ico` 404; the final full-page runs had no page errors.

## Evidence

Persistent snapshots and raw CDP results are under `docs/qa/fonts/`. The complete stages, scripts, original preview, before/after screenshots and unabridged results are also preserved under ignored `output/playwright/font-audit-*` for local inspection.

- [1440px Hero](qa/fonts/hero-light-1440.png), [390px Hero](qa/fonts/hero-light-390.png), [390px dark installation composer](qa/fonts/install-dark-390.png).
- [Agent menu](qa/fonts/menu-agent-light-390.png), [model menu](qa/fonts/menu-model-dark-390.png).
- [Gallery before](qa/fonts/gallery-before.png), [gallery OFL outlines](qa/fonts/gallery-after.png).
- [Full CDP records](qa/fonts/cdp-final.json), [reduced-motion font/reflow trace](qa/fonts/cdp-reduced.json), [gallery geometry verification](qa/fonts/gallery-verification.json).
- [Final product-copy CDP check](qa/fonts/cdp-newcopy.json).
