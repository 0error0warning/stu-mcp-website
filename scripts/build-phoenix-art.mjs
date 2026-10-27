import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { phoenixParts } from '../src/phoenix-behaviors.js';

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

// Inline scene: one complete rig owns the body AND feet. The supplied rig sheet
// animates these separately, so its transforms must not be copied into the site.
const motionRoot = new URL('../reference/phoenix/motion/', import.meta.url);
const expression = suffix => {
  const file = readdirSync(motionRoot).find(name => name.endsWith(suffix));
  if (!file) throw new Error(`Missing expression source: ${suffix}`);
  return shapes(readFileSync(new URL(file, motionRoot), 'utf8'));
};
const smile = expression('眯眼笑.svg');
const surprise = expression('惊讶抬起眉毛.svg');
if (smile.length !== 10 || surprise.length !== 13) throw new Error('Expression artwork structure changed');
// Fixed feature anchors, measured from the source SVG in Chrome. Each expression
// is normalized independently; changing eyes cannot shift the beak or cheeks.
const fit = (markup, box, cx, cy, width, height) => `<g transform="translate(${cx} ${cy}) scale(${width / box[2]} ${height / box[3]}) translate(${-box[0] - box[2] / 2} ${-box[1] - box[3] / 2})">${markup}</g>`;
const eye = (side, x, y, normal, happy, curious) => `<g class="phx-eye phx-eye-${side}"><g class="phx-gaze"><g class="phx-lid" style="transform-origin:${x}px ${y}px"><g class="phx-eye-open">${normal}</g><g class="phx-eye-smile">${happy}</g><g class="phx-eye-wide">${curious}</g></g></g></g>`;
const eyes = eye('left', 525.4, 495.3, art[10], fit(smile[5], [558.96,463.6,75.012,47.744],525.4,495.3,38,22),fit(surprise.slice(3,5).join(''),[491.968,429.456,120.496,120.978],525.4,495.3,54,54))
  + eye('right',628.6,474.4,art[11],fit(smile[6],[721.36,439.39,67.198,38.276],628.6,474.4,34,20),fit(surprise.slice(5,7).join(''),[689.987,427.545,105.159,107.076],628.6,474.4,44,46));
// Split the original continuous orange outline at its actual shoulder, crown
// and tail junctions. Original outer curves are retained; overlapping internal
// seams keep those joints connected during rotation, without bitmap masks.
const bodyNumbers = art[8].match(/d="([^"]+)"/)[1].match(/-?\d*\.?\d+/g).map(Number);
if (bodyNumbers.length !== 158) throw new Error('Phoenix body contour changed');
const curve = (start, end) => 'c' + bodyNumbers.slice(2 + start * 6, 2 + end * 6).join(' ');
const orange = d => `<path d="${d}" fill="#FA8D40"/>`;
const torso = orange(`M691.44 503.19${curve(3,4)}C568 368 533 368 500.21 375.414${curve(13,14)}Q352 586 357.1 605.72${curve(22,24)}C710 565 707 532 691.44 503.19Z`);
const orangeTail = orange(`M364.51 558.614${curve(14,22)}Q388 587 364.51 558.614Z`);
const orangeCrest = orange(`M599.41 385.79${curve(4,13)}Q550 410 599.41 385.79Z`);
const rightWing = orange(`M747.5 522.9${curve(0,3)}C675 530 676 575 700.9 592.32${curve(24,26)}Z`);
const rig = `<g class="phx-ring">${art.slice(3, 7).join('')}${art.slice(72).join('')}</g>
<g class="phx-hop"><g class="phx-breathe"><g class="phx-lean"><g class="phx-attitude">
  <g class="phx-tail">${art[7]}${orangeTail}</g><g class="phx-wing-right">${rightWing}</g>${torso}${art[9]}
  <g class="phx-cheek phx-cheek-left">${fit(smile[3],[546.709,514.177,61.393,44.143],500,536,29,15)}</g>
  <g class="phx-cheek phx-cheek-right">${fit(smile[4],[757.617,481.069,55.421,46.349],651,516,25,14)}</g>
  <g class="phx-brow phx-brow-left">${fit(surprise[11],[495.704,375.394,53.267,36.894],523,450,29,14)}</g>
  <g class="phx-brow phx-brow-right">${fit(surprise[12],[706.72,369.2,49.302,28.932],629,433,25,12)}</g>
  ${eyes}
  <g class="phx-mouth"><g class="phx-mouth-rest">${art[12]}</g><g class="phx-mouth-round">${fit(surprise.slice(7,9).join(''),[632.05,503.8,48,62.85],582.465,503.435,29,38)}</g></g>
  <g class="phx-wing-left">${art[13]}</g><g class="phx-crest">${orangeCrest}${art[14]}</g>
  <g class="phx-feet"><g class="phx-foot-left">${art[15]}</g><g class="phx-foot-right">${art[16]}</g></g>
</g></g></g></g>
<g class="phx-delight" fill="#ef9baa" aria-hidden="true"><path d="M710 335C670 306 692 278 710 294C728 278 750 306 710 335Z"/></g>
<g class="phx-sleep-sign" stroke="var(--phx-spark)" stroke-width="6" fill="none" aria-hidden="true"><path d="M720 335h22l-22 22h22M751 301h28l-28 28h28"/></g>
<g class="phx-hotspots">${phoenixParts.map(({id,label,area:[cx,cy,rx,ry]})=>`<g class="phx-hotspot" data-phx-part="${id}" role="button" tabindex="-1" aria-disabled="true" aria-label="${label}"><ellipse class="phx-target" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="transparent"/></g>`).join('')}</g>`;
let interactive = composition.replace(/<g class="phoenix">[\s\S]*?<\/g><\/g>/, `<g class="phx-control" role="group" aria-label="凤凰的互动部件" aria-describedby="phx-help" transform="translate(380 -42) scale(.43)"><desc id="phx-help">用方向键选择部件，按 Enter 或空格互动。</desc>${rig}</g>`);
// Prefix satellite class names because this artwork lives in the document now.
interactive = interactive.replace(/class="(routes|platform|document|letter|conversation|calendar)"/g, 'class="phx-$1"')
  .replace('var(--spark)', 'var(--phx-spark)');
const themed = { '#FBC34B':'platform-edge', '#FEE7A4':'platform-top', '#FAD57D':'shadow', '#C09EFC':'ring', '#8C65E0':'ring-inner' };
interactive = interactive.replace(/fill="([^"]+)"/g, (attr, color) => themed[color] ? `fill="var(--phx-${themed[color]})"` : attr)
  .replace('r="204" fill="#fff"', 'r="204" fill="var(--phx-ring-well)"');
writeFileSync(new URL('../src/phoenix-scene.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" class="phoenix-scene" viewBox="0 0 1200 370" width="1200" height="370" fill="none" role="group" aria-label="凤凰连接通知、附件、课程与讨论" data-playing="false" data-eye-left="open" data-eye-right="open" data-mouth="rest">${credit}${interactive}</svg>\n`);
