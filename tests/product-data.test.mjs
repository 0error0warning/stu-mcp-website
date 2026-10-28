import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderProduct,validateProduct} from '../src/product-data.js';
const data=JSON.parse(readFileSync(new URL('../public/data/product.json',import.meta.url),'utf8'));
test('reject inconsistent inventory and external release links',()=>{
 assert.throws(()=>validateProduct({...data,toolCount:data.toolCount+1}));
 assert.throws(()=>validateProduct({...data,releaseUrl:'https://example.com'}));
});
test('render all facts from one snapshot and escape upstream text',()=>{
 const page='<strong data-product="version">old</strong><span data-product="summary">old</span><a data-product-link href="old">read</a>';
 const result=renderProduct(page,{...data,summary:'<script>&'});
 assert.ok(result.includes(data.version));assert.ok(result.includes('&lt;script&gt;&amp;'));assert.ok(result.includes(data.releaseUrl));assert.ok(!result.includes('old'));
});
