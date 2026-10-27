import { readFileSync, writeFileSync } from 'node:fs';

// Preserve the supplied QuiverAI paths; only flatten wrappers and arrange groups.
const source = name => readFileSync(new URL(`../reference/phoenix/${name}.svg`, import.meta.url), 'utf8');
const shapes = text => [...text.matchAll(/<(?:path|circle|ellipse)\b[^>]*\/>/g)].map(match => match[0]);
const credit = '<!-- Original artwork supplied by the owner; created with Arrow by QuiverAI (https://quiver.ai). Layout adaptation for STU-MCP. -->';
const output = (name, text) => writeFileSync(new URL(`../public/${name}`, import.meta.url), text + '\n');
const icon = shapes(source('stu-mcp-phoenix-mascot-navbar-icon-artifact'));
if (!icon.length) throw new Error('Missing navbar artwork');
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="41 46.5 943 935" width="40" height="40" fill="none">${credit}${icon.join('')}</svg>`;
output('art/phoenix-navbar.svg', logo);
output('favicon.svg', logo);

const art = shapes(source('stu-mcp-phoenix-hero-illustration-artifact'));
if (art.length !== 77) throw new Error(`Unexpected hero structure: ${art.length} shapes`);
const group = (name, transform, start, end, extra = '') => `<g class="${name}"><g transform="${transform}">${art.slice(start, end).join('')}${extra}</g></g>`;
const composition = `
<g class="routes" fill="none" stroke-linecap="round" stroke-width="2">
  <path d="M285 132C375 132 382 180 492 164M338 234C402 234 413 207 492 202M710 164C790 132 835 124 920 130M710 205C780 205 804 255 877 255"/>
</g>
${group('platform', 'translate(-168 12) scale(1.5 .36)', 0, 3)}
${group('phoenix', 'translate(380 -42) scale(.43)', 3, 17, art.slice(72).join(''))}
${group('document', 'translate(165 -52) scale(.58)', 25, 33)}
${group('letter', 'translate(240 -65) scale(.46)', 17, 25)}
${group('conversation', 'translate(445 -45) scale(.58)', 54, 60)}
${group('calendar', 'translate(487 -55) scale(.48)', 60, 72)}
<g fill="var(--spark)"><path d="m389 84 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm411 12 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><circle cx="412" cy="251" r="3"/><circle cx="797" cy="242" r="3"/></g>`;

for (const dark of [false, true]) {
  let content = composition;
  const palette = dark
    ? { '#FBC34B': '#393c69', '#FEE7A4': '#64678f', '#FAD57D': '#4c4b78', '#C09EFC': '#bca1e7', '#8C65E0': '#74569e' }
    : { '#C09EFC': '#cfb8ee', '#8C65E0': '#a387c9' };
  // Only recolor the platform and ring, preserving the phoenix and source icons.
  content = content.replace(/<g class="(?:platform|phoenix)">[\s\S]*?<\/g><\/g>/g, block =>
    block.replace(/fill="([^"]+)"/g, (attr, color) => palette[color] ? `fill="${palette[color]}"` : attr));
  content = content.replace('r="204" fill="#fff"', `r="204" fill="${dark ? '#25283f' : '#fff9e6'}"`);
  const css = `:root{--spark:${dark ? '#bca6e7' : '#aa87cd'}}
    .routes{stroke:${dark ? '#c5acfa' : '#b398ce'};stroke-dasharray:3 10;opacity:.7}
    .document,.conversation{animation:float 7s ease-in-out infinite}.conversation{animation-delay:-3.5s}
    @keyframes float{50%{transform:translateY(-4px)}}
    @media(max-width:680px){.document{translate:100px 0}.conversation{translate:-90px 0}.calendar{translate:-14px 0}.routes{opacity:.35}}
    @media(prefers-reduced-motion:reduce){.document,.conversation{animation:none}}`;
  output(`art/phoenix-hero${dark ? '-night' : ''}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 370" width="1200" height="370" fill="none">${credit}<style>${css}</style>${content}</svg>`);
}
