export function validateProduct(data) {
  if(data?.schemaVersion!==1 || data.repository!=='0error0warning/stu-mcp' || !/^v\d+\.\d+\.\d+$/.test(data.version) || !Number.isInteger(data.toolCount) || data.toolCount<1 || data.toolCount>1000 || !/^[a-f0-9]{40}$/.test(data.commit) || !['学生预览版','正式版'].includes(data.channel) || typeof data.summary!=='string' || !data.summary.trim() || data.summary.length>160 || !Number.isFinite(Date.parse(data.checkedAt))) throw Error('Invalid product snapshot');
  if(data.releaseUrl!==`https://github.com/0error0warning/stu-mcp/blob/${data.commit}/docs/releases/${data.version}.md`)throw Error('Invalid release source');
  if(!Array.isArray(data.tools)||data.tools.length!==data.toolCount||new Set(data.tools).size!==data.toolCount)throw Error('Invalid tool inventory');
  return data;
}
const escape = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderProduct(html,data){
  validateProduct(data);
  html=html.replace(/(<[^>]+data-product="(version|toolCount|channel|summary)"[^>]*>)[^<]*/g,(_,open,key)=>open+escape(data[key]));
  return html.replace(/(<a\b[^>]*data-product-link[^>]*href=")[^"]*(")/g,(_,open,end)=>open+escape(data.releaseUrl)+end);
}
