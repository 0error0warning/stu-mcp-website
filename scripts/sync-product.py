"""Read public release sources as data only; never import upstream code."""
import argparse
import ast
import json
import html
import os
import re
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO = '0error0warning/stu-mcp'
API = f'https://api.github.com/repos/{REPO}'

def read(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'stu-website-product-sync', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read(2_000_000).decode('utf-8')

def parse_product(project, server, notes, version):
    section = re.search(r'(?ms)^\[project\]\s*$(.*?)(?=^\[|\Z)', project)
    found = re.search(r'(?m)^version\s*=\s*"([^"]+)"', section[1] if section else '')
    if not found or found[1] != version:
        raise ValueError('Release tag and package version disagree')
    tree = ast.parse(server)
    builder = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'build_server')
    # This adapter deliberately fails closed when upstream changes its registration layout.
    wrapper = next(n for n in builder.body if isinstance(n, ast.FunctionDef) and n.name == 'tool')
    if not any(isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == 'tool' and isinstance(n.func.value, ast.Name) and n.func.value.id == 'server' for n in ast.walk(wrapper)):
        raise ValueError('Unknown tool registration adapter')
    names = [n.name for n in builder.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and any(isinstance(d, ast.Call) and isinstance(d.func, ast.Name) and d.func.id == 'tool' for d in n.decorator_list)]
    documented = {int(x) for x in re.findall(r'(\d+)\s*项(?:\s*MCP)?\s*工具', notes)}
    if not names or len(names) != len(set(names)) or (documented and documented != {len(names)}):
        raise ValueError('Tool count cannot be verified')
    title = next(line[2:].strip() for line in notes.splitlines() if line.startswith('# '))
    title = re.sub(r'^v?' + re.escape(version) + r'\s*[·—:-]?\s*', '', title)
    title = re.sub(r'[（(]学生预览版[）)]$', '', title).strip()
    if not title or len(title)>160: raise ValueError('Invalid release title')
    return {'version': 'v'+version, 'toolCount':len(names), 'summary':title, 'tools':names}

def sync(output, html_path=None):
    output=Path(output).resolve()
    html_path=Path(html_path).resolve() if html_path else None
    releases=json.loads(read(API+'/releases?per_page=100'))
    releases=[r for r in releases if not r['draft'] and r.get('published_at') and re.fullmatch(r'v\d+\.\d+\.\d+',r['tag_name'])]
    release=max(releases,key=lambda r:tuple(map(int,r['tag_name'][1:].split('.'))))
    tag=release['tag_name']
    sha=json.loads(read(API+'/commits/'+tag))['sha']
    if not re.fullmatch('[a-f0-9]{40}',sha): raise ValueError('Invalid commit')
    base=f'https://raw.githubusercontent.com/{REPO}/{sha}/'
    data=parse_product(read(base+'pyproject.toml'),read(base+'src/stu_mcp/server.py'),read(base+f'docs/releases/{tag}.md'),tag[1:])
    data.update(schemaVersion=1,repository=REPO,commit=sha,channel='学生预览版' if release['prerelease'] else '正式版',releaseUrl=f'https://github.com/{REPO}/blob/{sha}/docs/releases/{tag}.md',publishedAt=release['published_at'],checkedAt=datetime.now(timezone.utc).isoformat())
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    # All validation happens before replacing the last known good snapshot.
    fd,tmp=tempfile.mkstemp(dir=output.parent,prefix='.product-')
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f: json.dump(data,f,ensure_ascii=False,indent=2);f.write('\n')
        os.chmod(tmp,0o644)
        os.replace(tmp,output)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
    if html_path:
        page=html_path.read_text(encoding='utf-8')
        page=re.sub(r'(<[^>]+data-product="(version|toolCount|channel|summary)"[^>]*>)[^<]*', lambda m:m[1]+html.escape(str(data[m[2]])), page)
        page=re.sub(r'(<a\b[^>]*data-product-link[^>]*href=")[^"]*(")', lambda m:m[1]+html.escape(data['releaseUrl'])+m[2], page)
        fd,tmp=tempfile.mkstemp(dir=html_path.parent,prefix='.product-html-')
        try:
            with os.fdopen(fd,'w',encoding='utf-8') as f:f.write(page)
            os.chmod(tmp,0o644);os.replace(tmp,html_path)
        finally:
            if os.path.exists(tmp):os.unlink(tmp)
    print(json.dumps({k:data[k] for k in ('version','toolCount','commit')},ensure_ascii=False))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/data/product.json')
    parser.add_argument('--html')
    args=parser.parse_args();sync(args.output,args.html)
