#!/usr/bin/env python3
"""Fetch GitHub activity stats, persist history, and refresh the README leaderboard."""
from __future__ import annotations
import datetime as dt
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
ROOT=Path(__file__).resolve().parents[2]
TOOLS_DIR=ROOT/'content'/'tools'; STATS_DIR=ROOT/'stats'; DAILY_PATH=STATS_DIR/'daily.json'; HISTORY_PATH=STATS_DIR/'stats-history.json'; README_PATH=ROOT/'README.md'
START='<!-- DAILY_TABLE:START -->'; END='<!-- DAILY_TABLE:END -->'
def github_get(url, token=None):
    headers={'Accept':'application/vnd.github+json','User-Agent':'awesome-ADE-daily-stats','X-GitHub-Api-Version':'2022-11-28'}
    if token: headers['Authorization']=f'Bearer {token}'
    for attempt in range(4):
        try:
            with urlopen(Request(url,headers=headers),timeout=30) as r: return json.load(r)
        except HTTPError as exc:
            if exc.code in (403,429) and attempt<3:
                retry=exc.headers.get('Retry-After'); time.sleep(int(retry) if retry and retry.isdigit() else 2**attempt); continue
            raise
def scalar(v):
    v=v.split(' #',1)[0].strip()
    if v in ('null','~'): return None
    if len(v)>=2 and v[0]==v[-1] and v[0] in "\"'": return v[1:-1]
    return v
def parse_frontmatter(path):
    m=re.search(r'^---\s*\n(.*?)\n---\s*(?:\n|$)',path.read_text(encoding='utf-8'),re.S|re.M)
    if not m: raise ValueError(f'No frontmatter in {path}')
    data={}; current=None
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith('#'): continue
        if line.startswith('  ') and current is not None:
            k,v=line.strip().split(':',1); current[k.strip()]=scalar(v.strip()); continue
        if ':' not in line: continue
        k,v=line.split(':',1); k=k.strip(); v=v.strip()
        if not v: current={}; data[k]=current
        else: current=None; data[k]=scalar(v)
    return data
def repo_path(github):
    if not isinstance(github,str): return None
    m=re.match(r'https?://github\.com/([^/]+/[^/]+?)/?$',github.strip())
    return m.group(1) if m else None
def fetch_stats(repo,token):
    info=github_get(f'https://api.github.com/repos/{repo}',token); contributions=[]; page=1
    while page<=10:
        rows=github_get(f'https://api.github.com/repos/{repo}/contributors?per_page=100&page={page}&anon=true',token)
        if not isinstance(rows,list) or not rows: break
        contributions.extend(int(x.get('contributions',0)) for x in rows if isinstance(x,dict))
        if len(rows)<100: break
        page+=1
    return {'stars':int(info.get('stargazers_count',0)),'pushedAt':info.get('pushed_at',''),'c20':sum(n>=20 for n in contributions),'c100':sum(n>=100 for n in contributions)}
def clean(v): return str(v or '').replace('|','\\|').replace('\n',' ').strip()
def fmt(v): return f'{int(v):,}' if v is not None else '—'
def fmt_date(v):
    if not v:return '—'
    try:
        d=dt.datetime.fromisoformat(str(v).replace('Z','+00:00')).date(); days=(dt.datetime.now(dt.timezone.utc).date()-d).days
        return 'today' if days<=0 else 'yesterday' if days==1 else f'{days}d ago' if days<30 else d.isoformat()
    except ValueError:return str(v)
def make_table(rows,today):
    rows=sorted(rows,key=lambda x:(x.get('stars') is None,-(x.get('stars') or 0)))
    lines=[START,f'## GitHub activity leaderboard — {today}','', 'Ranked by GitHub stars. Activity fields are fetched daily from the GitHub API.','', '| # | Tool | ★ Stars | Contributors ≥20 | Contributors ≥100 | Last push |','| ---: | --- | ---: | ---: | ---: | --- |']
    for i,x in enumerate(rows,1):
        lines.append(f"| {i} | [{clean(x['name'])}]({x['github']}) | {fmt(x.get('stars'))} | {fmt(x.get('c20'))} | {fmt(x.get('c100'))} | {fmt_date(x.get('pushedAt'))} |")
    lines += ['', '[Raw daily JSON](./stats/daily.json) · [Full stats history](./stats/stats-history.json)',END]
    return '\n'.join(lines)
def update_readme(table):
    text=README_PATH.read_text(encoding='utf-8')
    if START in text and END in text: text=re.sub(re.escape(START)+r'.*?'+re.escape(END),table,text,count=1,flags=re.S)
    else: text=text.rstrip()+'\n\n'+table+'\n'
    README_PATH.write_text(text,encoding='utf-8')
def main():
    token=os.environ.get('GITHUB_TOKEN'); today=dt.datetime.now(dt.timezone.utc).date().isoformat(); generated=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
    tools=[parse_frontmatter(p) for p in sorted(TOOLS_DIR.glob('*.mdx'))]; rows=[]
    for tool in tools:
        repo=repo_path(tool.get('github'))
        if not repo:
            print(f"Skipping {tool.get('key','')}: no GitHub repository",file=sys.stderr); continue
        print(f"Fetching {tool.get('key','')}: {repo}",flush=True)
        try: stats=fetch_stats(repo,token)
        except Exception as exc: print(f"warning: {tool.get('key','')}: {exc}",file=sys.stderr); stats={}
        rows.append({'key':str(tool.get('key','')),'name':str(tool.get('name',tool.get('key',''))),'github':tool.get('github'),**stats})
    snapshot={'date':today,'generatedAt':generated,'tools':rows}
    STATS_DIR.mkdir(exist_ok=True); DAILY_PATH.write_text(json.dumps(snapshot,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    history=[]
    if HISTORY_PATH.exists():
        history=json.loads(HISTORY_PATH.read_text(encoding='utf-8'))
        if not isinstance(history,list): raise ValueError('stats-history.json must contain a JSON array')
    history=[e for e in history if e.get('date')!=today]; history.append(snapshot); history.sort(key=lambda e:e.get('date',''))
    HISTORY_PATH.write_text(json.dumps(history,indent=2,ensure_ascii=False)+'\n',encoding='utf-8'); update_readme(make_table(rows,today))
if __name__=='__main__': main()
