from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "_site"
CONTENT = ROOT / "content" / "articles"
TEMPLATE = ROOT / "templates" / "article.html"

EXCLUDED_ROOTS = {".git", ".github", "_site", "content", "scripts", "templates"}

def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)

def read_template() -> str:
    return TEMPLATE.read_text(encoding="utf-8")

def render_tags(tags: list[str]) -> str:
    return "\n".join(
        f'        <a class="tag" href="/tags/{html.escape(tag)}/">{html.escape(tag)}</a>'
        for tag in tags
    )

def render_article(meta: dict, body: str, template: str) -> str:
    title = html.escape(meta["title"])
    description = html.escape(meta["description"])
    slug = html.escape(meta["slug"])
    topic = html.escape(meta["topic"])
    date = html.escape(meta["publishedAt"])
    date_label = html.escape(meta.get("publishedLabel", meta["publishedAt"]))
    lang = html.escape(meta.get("language", "vi"))
    tags = render_tags(meta.get("tags", []))
    canonical = f"https://cuupham.github.io/articles/{slug}/"

    values = {
        "LANG": lang,
        "TITLE": title,
        "DESCRIPTION": description,
        "CANONICAL": canonical,
        "SLUG": slug,
        "TOPIC": topic,
        "DATE": date,
        "DATE_LABEL": date_label,
        "TAGS": tags,
        "CONTENT": body.strip(),
        "JSON_LD": json.dumps({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": meta["title"],
            "description": meta["description"],
            "datePublished": meta["publishedAt"],
            "dateModified": meta.get("updatedAt", meta["publishedAt"]),
            "author": {"@type": "Organization", "name": "U.U.C"},
            "publisher": {"@type": "Organization", "name": "U.U.C"},
            "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
            "articleSection": meta["topic"],
            "keywords": meta.get("tags", []),
        }, ensure_ascii=False, separators=(",", ":")),
    }

    rendered = template
    for key, value in values.items():
        rendered = rendered.replace("{{" + key + "}}", value)
    return rendered

def copy_static_site() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for item in ROOT.iterdir():
        if item.name in EXCLUDED_ROOTS or item.name.startswith("."):
            continue
        target = DIST / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)


def build_articles() -> int:
    template = read_template()
    count = 0
    for article_dir in sorted(CONTENT.iterdir()):
        if not article_dir.is_dir():
            continue
        metadata_path = article_dir / "article.json"
        body_path = article_dir / "content.html"
        if not metadata_path.exists() or not body_path.exists():
            continue
        meta = load_json(metadata_path)
        body = body_path.read_text(encoding="utf-8")
        output_dir = DIST / "articles" / meta["slug"]
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "index.html").write_text(
            render_article(meta, body, template), encoding="utf-8"
        )
        count += 1
    return count


def main() -> None:
    copy_static_site()
    count = build_articles()
    print(f"Built {count} data-driven article(s) into {DIST}")


if __name__ == "__main__":
    main()
