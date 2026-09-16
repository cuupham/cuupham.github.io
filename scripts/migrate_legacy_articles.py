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
ARTICLE_START = '<article'
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
        return json.loads(html.unescape(match.group(1).strip()))
    except (json.JSONDecodeError, TypeError):
        return {}


def extract_prose(source: str) -> str:
    start = source.find(PROSE_START)
    if start >= 0:
        article_end = source.find(ARTICLE_END, start)
        if article_end < 0:
            raise ValueError("missing closing </article>")
        end = source.rfind("</div>", start, article_end)
        if end < 0:
            raise ValueError("missing closing prose div")
        return source[start + len(PROSE_START):end].strip() + "\n"

    article_start = source.find(ARTICLE_START)
    article_end = source.find(ARTICLE_END, article_start)
    if article_start < 0 or article_end < 0:
        raise ValueError("missing article body")

    body = source[source.find(">", article_start) + 1:article_end]
    body = re.sub(r'<header\s+class="article-header">.*?</header>', "", body, flags=re.I | re.S)
    body = re.sub(r'<a\s+class="back-link"[^>]*>.*?</a>', "", body, flags=re.I | re.S)
    body = re.sub(r'<p\s+class="eyebrow">.*?</p>', "", body, count=1, flags=re.I | re.S)
    body = re.sub(r'<h1>.*?</h1>', "", body, count=1, flags=re.I | re.S)
    body = re.sub(r'<p\s+class="muted">.*?</p>', "", body, count=1, flags=re.I | re.S)
    return body.strip() + "\n"


def migrate(slug: str) -> bool:
    source_path = LEGACY_ARTICLES / slug / "index.html"
    if not source_path.exists():
        return False

    destination = CONTENT_ARTICLES / slug
    if (destination / "article.json").exists() and (destination / "content.html").exists():
        return False

    source = source_path.read_text(encoding="utf-8")
    meta, og = attributes(source)
    ld = json_ld(source)
    h1_match = H1_RE.search(source)
    title_match = TITLE_RE.search(source)
    date_match = DATE_RE.search(source)
    topic_match = TOPIC_LINK_RE.search(source)

    title = clean_text(h1_match.group(1)) if h1_match else clean_text(
        og.get("og:title") or (title_match.group(1) if title_match else slug)
    )
    published_at = (
        og.get("article:published_time")
        or ld.get("datePublished")
        or (html.unescape(date_match.group(1).strip()) if date_match else "")
    )
    published_label = clean_text(date_match.group(2)) if date_match else published_at
    topic = (
        topic_match.group(1).strip()
        if topic_match
        else clean_text(og.get("article:section") or ld.get("articleSection") or "general")
        .lower()
        .replace(" ", "-")
    )
    language_match = LANG_RE.search(source)
    language = language_match.group(1).strip() if language_match else "vi"
    dek_match = DEK_RE.search(source)
    lead = clean_text(dek_match.group(1)) if dek_match else ""
    description = meta.get("description") or og.get("og:description") or lead
    tags = [clean_text(value) for value in TAG_RE.findall(source)]
    if not tags:
        tags = [clean_text(str(tag)) for tag in ld.get("keywords", [])]
    updated_at = ld.get("dateModified") or published_at

    if not published_at:
        raise ValueError(f"{source_path}: missing published date")

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
