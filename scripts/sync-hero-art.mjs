import { readFile, writeFile } from 'node:fs/promises'

// The theme assets share geometry and contain both palettes. No runtime conversion.
const source = new URL('../public/art/hero-collector.svg', import.meta.url)
const night = new URL('../public/art/hero-collector-night.svg', import.meta.url)
const artwork = await readFile(source, 'utf8')
if (!artwork.includes('data-theme="light"')) throw new Error('Missing light SVG theme')
await writeFile(night, artwork.replace('data-theme="light"', 'data-theme="dark"'))
