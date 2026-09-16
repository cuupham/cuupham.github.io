from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEGACY_ARTICLES = ROOT / "articles"
CONTENT_ARTICLES = ROOT / "content" / "articles"
ARCHIVE_PAGE = ROOT / "archive" / "index.html"
TOPICS_DIR = ROOT / "topics"

META_RE = re.compile(r'<meta\s+name=["\']([^"\']+)["\']\s+content=["\']([^"\']*)["\']', re.I)
PROPERTY_RE = re.compile(r'<meta\s+property=["\']([^"\']+)["\']\s+content=["\']([^"\']*)["\']', re.I)
TITLE_RE = re.compile(r'<title[^>]*>(.*?)</title>', re.I | re.S)
H1_RE = re.compile(r'<h1[^>]*>(.*?)</h1>', re.I | re.S)
LANG_RE = re.compile(r'<html[^>]+lang=["\']([^"\']+)["\']', re.I)
DATE_RE = re.compile(r'<time\s+datetime=["\']([^"\']+)["\']>(.*?)</time>', re.I | re.S)
TOPIC_LINK_RE = re.compile(r'href=["\']/topics/([^/]+)/["\']', re.I)
DEK_RE = re.compile(r'<p\s+class=["\']dek["\']>(.*?)</p>', re.I | re.S)
TAG_RE = re.compile(r'<a\s+class=["\']tag["\']\s+href=["\']/tags/[^/]+/["\']>(.*?)</a>', re.I | re.S)
JSONLD_RE = re.compile(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', re.I | re.S)
ARTICLE_START_RE = re.compile(r'<article\b[^>]*>', re.I)
ARTICLE_END = '</article>'
PROSE_START = '<div class="prose">'
ARCHIVE_ENTRY_RE = re.compile(
    r'<a\s+class=["\']article-row["\'][^>]*href=["\']/articles/([^/]+)/["\'][^>]*>(.*?)</a>',
    re.I | re.S,
)
TIME_IN_ENTRY_RE = re.compile(r'<time\s+datetime=["\']([^"\']+)["\']>(.*?)</time>', re.I | re.S)
TOPIC_ARTICLE_RE = re.compile(
    r'href=["\']/articles/([^/]+)/["\'][^>]*',
    re.I,
)


def clean_text(value: str) -> str:
    return html.unescape(re.sub(r"\s+", " ", value).strip())


def parse_attributes(source: str) -> tuple[dict[str, str], dict[str, str]]:
    meta = {key.lower(): html.unescape(value) for key, value in META_RE.findall(source)}
    props = {key.lower(): html.unescape(value) for key, value in PROPERTY_RE.findall(source)}
    return meta, props


def parse_json_ld(source: str) -> dict:
    match = JSONLD_RE.search(source)
    if not match:
        return {}
    try:
        return json.loads(html.unescape(match.group(1).strip()))
    except (json.JSONDecodeError, TypeError):
        return {}


def archive_metadata() -> dict[str, dict[str, str]]:
    if not ARCHIVE_PAGE.exists():
        return {}
    source = ARCHIVE_PAGE.read_text(encoding="utf-8")
    result: dict[str, dict[str, str]] = {}
    for match in ARCHIVE_ENTRY_RE.finditer(source):
        slug, entry = match.groups()
        time_match = TIME_IN_ENTRY_RE.search(entry)
        result[slug] = {
            "publishedAt": time_match.group(1).strip() if time_match else "",
            "publishedLabel": clean_text(time_match.group(2)) if time_match else "",
        }
    return result


def topic_map() -> dict[str, str]:
    result: dict[str, str] = {}
    if not TOPICS_DIR.exists():
        return result
    for topic_dir in TOPICS_DIR.iterdir():
        if not topic_dir.is_dir() or topic_dir.name.startswith("."):
            continue
        index_path = topic_dir / "index.html"
        if not index_path.exists():
            continue
        source = index_path.read_text(encoding="utf-8")
        for slug in TOPIC_ARTICLE_RE.findall(source):
            result.setdefault(slug, topic_dir.name)
    return result


def extract_prose(source: str) -> str:
    start = source.find(PROSE_START)
    if start >= 0:
        article_end = source.lower().find(ARTICLE_END, start)
        if article_end < 0:
            raise ValueError("missing closing </article>")
        end = source.rfind("</div>", start, article_end)
        if end < 0:
            raise ValueError("missing closing prose div")
        return source[start + len(PROSE_START):end].strip() + "\n"

    article_match = ARTICLE_START_RE.search(source)
    article_end = source.lower().find(ARTICLE_END, article_match.end() if article_match else 0)
    if not article_match or article_end < 0:
        raise ValueError("missing article body")

    body = source[article_match.end():article_end]
    body = re.sub(r'<header\s+class=["\']article-header["\']>.*?</header>', "", body, flags=re.I | re.S)
    body = re.sub(r'<a\s+class=["\']back-link["\'][^>]*>.*?</a>', "", body, flags=re.I | re.S)
    body = re.sub(r'<p\s+class=["\']eyebrow["\']>.*?</p>', "", body, count=1, flags=re.I | re.S)
    body = re.sub(r'<h1[^>]*>.*?</h1>', "", body, count=1, flags=re.I | re.S)
    body = re.sub(r'<p\s+class=["\']muted["\']>.*?</p>', "", body, count=1, flags=re.I | re.S)
    return body.strip() + "\n"


def migrate(slug: str, archive: dict[str, dict[str, str]], topics: dict[str, str]) -> bool:
    source_path = LEGACY_ARTICLES / slug / "index.html"
    if not source_path.exists():
        return False

    destination = CONTENT_ARTICLES / slug
    if (destination / "article.json").exists() and (destination / "content.html").exists():
        shutil.rmtree(source_path.parent)
        return True

    source = source_path.read_text(encoding="utf-8")
    meta, props = parse_attributes(source)
    ld = parse_json_ld(source)

    h1_match = H1_RE.search(source)
    title_match = TITLE_RE.search(source)
    title = clean_text(h1_match.group(1)) if h1_match else clean_text(
        props.get("og:title") or meta.get("title") or (title_match.group(1) if title_match else slug)
    )

    archive_entry = archive.get(slug, {})
    published_at = (
        props.get("article:published_time")
        or meta.get("article:published_time")
        or ld.get("datePublished")
        or archive_entry.get("publishedAt", "")
    )
    published_label_match = DATE_RE.search(source)
    published_label = (
        clean_text(published_label_match.group(2))
        if published_label_match
        else archive_entry.get("publishedLabel", published_at)
    )

    topic_match = TOPIC_LINK_RE.search(source)
    topic = (
        topic_match.group(1).strip()
        if topic_match
        else topics.get(slug)
        or clean_text(props.get("article:section") or ld.get("articleSection") or "general")
        .lower()
        .replace(" ", "-")
        .replace("&", "and")
    )

    language_match = LANG_RE.search(source)
    language = language_match.group(1).strip() if language_match else "vi"
    dek_match = DEK_RE.search(source)
    lead = clean_text(dek_match.group(1)) if dek_match else ""
    description = meta.get("description") or props.get("og:description") or lead
    tags = [clean_text(value) for value in TAG_RE.findall(source)]
    if not tags:
        keywords = ld.get("keywords", [])
        tags = [clean_text(str(tag)) for tag in keywords] if isinstance(keywords, list) else [clean_text(tag) for tag in str(keywords).split(",") if tag.strip()]

    updated_at = ld.get("dateModified") or published_at
    if not published_at:
        raise ValueError(f"{source_path}: missing published date; add the article to archive/index.html")
    if not description:
        raise ValueError(f"{source_path}: missing description")

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
    archive = archive_metadata()
    topics = topic_map()
    migrated = 0
    errors: list[str] = []

    if not LEGACY_ARTICLES.exists():
        print("No legacy articles directory found")
        return

    for article_dir in sorted(LEGACY_ARTICLES.iterdir()):
        if not article_dir.is_dir() or article_dir.name.startswith("."):
            continue
        try:
            migrated += int(migrate(article_dir.name, archive, topics))
        except (OSError, ValueError) as exc:
            errors.append(str(exc))

    if errors:
        raise SystemExit("\n".join(errors))

    remaining = [
        path.name
        for path in LEGACY_ARTICLES.iterdir()
        if path.is_dir() and not path.name.startswith(".")
    ]
    if remaining:
        raise SystemExit("legacy article sources remain: " + ", ".join(sorted(remaining)))

    print(f"Migrated {migrated} legacy article(s)")


if __name__ == "__main__":
    main()
