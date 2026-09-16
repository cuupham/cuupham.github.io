from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEGACY_ARTICLES = ROOT / "articles"
CONTENT_ARTICLES = ROOT / "content" / "articles"

META_RE = re.compile(r'<meta\s+name="([^"]+)"\s+content="([^"]*)"', re.I)
OG_RE = re.compile(r'<meta\s+property="([^"]+)"\s+content="([^"]*)"', re.I)
TITLE_RE = re.compile(r'<title>(.*?)</title>', re.I | re.S)
H1_RE = re.compile(r'<h1>(.*?)</h1>', re.I | re.S)
LANG_RE = re.compile(r'<html[^>]+lang="([^"]+)"', re.I)
DATE_RE = re.compile(r'<time\s+datetime="([^"]+)">(.*?)</time>', re.I | re.S)
TOPIC_LINK_RE = re.compile(r'href="/topics/([^/]+)/"', re.I)
DEK_RE = re.compile(r'<p\s+class="dek">(.*?)</p>', re.I | re.S)
TAG_RE = re.compile(r'<a\s+class="tag"\s+href="/tags/[^/]+/">(.*?)</a>', re.I | re.S)
JSONLD_RE = re.compile(r'<script\s+type="application/ld\+json">(.*?)</script>', re.I | re.S)
PROSE_START = '<div class="prose">'
ARTICLE_END = '</article>'


def clean_text(value: str) -> str:
    return html.unescape(re.sub(r"\s+", " ", value).strip())


def attributes(source: str) -> tuple[dict[str, str], dict[str, str]]:
    meta = {key.lower(): html.unescape(value) for key, value in META_RE.findall(source)}
    og = {key.lower(): html.unescape(value) for key, value in OG_RE.findall(source)}
    return meta, og


def json_ld(source: str) -> dict:
    match = JSONLD_RE.search(source)
    if not match:
        return {}
    try:
        return json.loads(match.group(1).strip())
    except json.JSONDecodeError:
        return {}


def extract_prose(source: str) -> str:
    start = source.find(PROSE_START)
    if start < 0:
        raise ValueError("missing <div class=\"prose\">")
    article_end = source.find(ARTICLE_END, start)
    if article_end < 0:
        raise ValueError("missing closing </article>")
    end = source.rfind('</div>', start, article_end)
    if end < 0:
        raise ValueError("missing closing prose div")
    return source[start + len(PROSE_START) : end].strip() + "\n"


def migrate(slug: str) -> bool:
    source_path = LEGACY_ARTICLES / slug / "index.html"
    if not source_path.exists():
        return False

    source = source_path.read_text(encoding="utf-8")
    meta, og = attributes(source)
    ld = json_ld(source)

    h1_match = H1_RE.search(source)
    date_match = DATE_RE.search(source)
    topic_match = TOPIC_LINK_RE.search(source)
    if not h1_match or not date_match or not topic_match:
        raise ValueError(f"{source_path}: missing article identity metadata")

    title = clean_text(h1_match.group(1))
    published_at = html.unescape(date_match.group(1).strip())
    published_label = clean_text(date_match.group(2))
    topic = html.unescape(topic_match.group(1).strip())
    language_match = LANG_RE.search(source)
    language = language_match.group(1).strip() if language_match else "vi"
    dek_match = DEK_RE.search(source)
    lead = clean_text(dek_match.group(1)) if dek_match else ""
    description = meta.get("description") or og.get("og:description") or lead
    tags = [clean_text(value) for value in TAG_RE.findall(source)]
    updated_at = ld.get("dateModified") or published_at

    destination = CONTENT_ARTICLES / slug
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "article.json").write_text(
        json.dumps(
            {
                "slug": slug,
                "title": title,
                "description": description,
                "lead": lead,
                "topic": topic,
                "tags": tags,
                "publishedAt": published_at,
                "updatedAt": updated_at,
                "publishedLabel": published_label,
                "language": language,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (destination / "content.html").write_text(extract_prose(source), encoding="utf-8")

    shutil.rmtree(source_path.parent)
    return True


def main() -> None:
    if not LEGACY_ARTICLES.exists():
        print("No legacy articles directory found")
        return

    migrated = 0
    errors: list[str] = []
    for article_dir in sorted(LEGACY_ARTICLES.iterdir()):
        if not article_dir.is_dir() or article_dir.name.startswith("."):
            continue
        try:
            migrated += int(migrate(article_dir.name))
        except (OSError, ValueError) as exc:
            errors.append(str(exc))

    if errors:
        raise SystemExit("\n".join(errors))

    print(f"Migrated {migrated} legacy article(s)")


if __name__ == "__main__":
    main()
