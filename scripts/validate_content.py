from __future__ import annotations
import json
import re
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CONTENT=ROOT/'content'/'articles'
TOPICS=ROOT/'content'/'topics.json'
REQUIRED={'slug','title','description','topic','publishedAt'}
SLUG_RE=re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
def main():
    errors=[]; seen=set(); topics=json.loads(TOPICS.read_text(encoding='utf-8')); topic_slugs=[t.get('slug') for t in topics]
    if len(topic_slugs)!=len(set(topic_slugs)) or any(not isinstance(s,str) or not s for s in topic_slugs): errors.append(f'{TOPICS}: topic slugs must be unique and non-empty')
    for d in sorted(CONTENT.iterdir()):
        if not d.is_dir() or d.name.startswith('.'): continue
        mp=d/'article.json'; bp=d/'content.html'
        if not mp.exists() or not bp.exists(): errors.append(f'{d}: requires article.json and content.html'); continue
        try: data=json.loads(mp.read_text(encoding='utf-8'))
        except json.JSONDecodeError as exc: errors.append(f'{mp}: invalid JSON: {exc}'); continue
        missing=REQUIRED-data.keys()
        if missing: errors.append(f'{mp}: missing fields: {", ".join(sorted(missing))}'); continue
        slug=data['slug']
        if slug!=d.name or not isinstance(slug,str) or not SLUG_RE.fullmatch(slug): errors.append(f'{mp}: slug must match directory and use lowercase kebab-case')
        if slug in seen: errors.append(f'duplicate slug: {slug}')
        seen.add(slug)
        if data['topic'] not in topic_slugs: errors.append(f'{mp}: unknown topic {data["topic"]!r}')
        tags=data.get('tags',[])
        if not isinstance(tags,list) or any(not isinstance(tag,str) or not tag.strip() for tag in tags): errors.append(f'{mp}: tags must be an array of non-empty strings')
        try: date.fromisoformat(str(data['publishedAt']))
        except ValueError: errors.append(f'{mp}: publishedAt must be YYYY-MM-DD')
        if not bp.read_text(encoding='utf-8').strip(): errors.append(f'{bp}: article content is empty')
    if errors: raise SystemExit('\n'.join(errors))
    print(f'Validated {len(seen)} data-driven article source(s)')
if __name__=='__main__': main()
