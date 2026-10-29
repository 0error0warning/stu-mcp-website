// Export the site's original paused ReactDrops terrain as SVG. No canvas/GPU
// is needed by visitors. Uses the original seed, field, scale and line density.
import {writeFileSync, mkdirSync} from 'node:fs';
import {createElevationField,traceContours,roundContour,createContourSpline} from '../src/components/reactdrops/topographic-field.ts';
const width=2560,height=1400,scale=560,margin=scale*.45,distortion=.9,density=4;
const spanX=width+2*margin,spanY=height+2*margin;
const columns=Math.ceil(spanX/4)+1,rows=Math.ceil(spanY/4)+1;
const field=new Float32Array(columns*rows),sample=createElevationField(42);
for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)field[y*columns+x]=sample((x*spanX/(columns-1)-margin)/scale,(y*spanY/(rows-1)-margin)/scale,0,distortion);
const point=p=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
const paths=traceContours(field,columns,rows,spanX,spanY,density).map(curve=>{
 const points=roundContour(curve.points.map(p=>({x:p.x-margin,y:p.y-margin})),curve.closed,8,16);
 const spline=createContourSpline(points,curve.closed);
 return `<path d="M${point(spline.start)}${spline.segments.map(s=>`C${point(s.control1)} ${point(s.control2)} ${point(s.end)}`).join('')}${curve.closed?'Z':''}"/>`;
});
mkdirSync(new URL('../public/materials/',import.meta.url),{recursive:true});
writeFileSync(new URL('../public/materials/hero-contours.svg',import.meta.url),`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" stroke="#71602e" stroke-width=".8" opacity=".25"><!-- Product artwork derived from ReactDrops Topographic Flow; Component License retained in licenses/ and source. -->${paths.join('')}</svg>`);
console.log({paths:paths.length,width,height});
