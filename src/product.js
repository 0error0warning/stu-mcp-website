import {validateProduct} from './product-data.js';
// One fetch, one validated object; never partially apply fields from different versions.
fetch('/data/product.json',{cache:'no-cache',signal:AbortSignal.timeout(6000)})
  .then(response=>{if(!response.ok)throw Error('Product data unavailable');return response.json();})
  .then(validateProduct)
  .then(data=>{
    document.querySelectorAll('[data-product]').forEach(el=>{const key=el.dataset.product;if(['version','toolCount','channel','summary'].includes(key))el.textContent=String(data[key]);});
    document.querySelectorAll('[data-product-link]').forEach(el=>el.href=data.releaseUrl);
  }).catch(()=>{/* The build-time snapshot remains usable without network or JS. */});
