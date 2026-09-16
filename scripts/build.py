from __future__ import annotations

import html
import json
import shutil
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "_site"
CONTENT = ROOT / "content" / "articles"
TOPICS = ROOT / "content" / "topics.json"
ARTICLE_TEMPLATE = ROOT / "templates" / "article.html"
LIST_TEMPLATE = ROOT / "templates" / "list-page.html"
BASE_URL = "https://cuupham.github.io"
EXCLUDED_ROOTS = {".git", ".github", "_site", "articles", "archive", "content", "scripts", "tags", "templates", "topics"}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def render(template: str, values: dict[str, str]) -> str:
    output = template
    for key, value in values.items():
        output = output.replace("{{" + key + "}}", value)
    return output


def render_tags(tags: list[str]) -> str:
    return "\n".join(
        f'        <a class="tag" href="/tags/{quote(tag)}/">{esc(tag)}</a>'
        for tag in tags
    )


def render_article(meta: dict, body: str, template: str) -> str:
    slug = str(meta["slug"])
    canonical = f"{BASE_URL}/articles/{quote(slug)}/"
    ld = json.dumps(
        {
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
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return render(template, {
        "LANG": esc(meta.get("language", "vi")),
        "TITLE": esc(meta["title"]),
        "DESCRIPTION": esc(meta["description"]),
        "CANONICAL": canonical,
        "TOPIC": quote(slug := str(meta["topic"])),
        "TOPIC_LABEL": esc(meta["topic"]),
        "DATE": esc(meta["publishedAt"]),
        "DATE_LABEL": esc(meta.get("publishedLabel", meta["publishedAt"])),
        "TAGS": render_tags(meta.get("tags", [])),
        "CONTENT": body.strip(),
        "JSON_LD": ld,
    })


def render_row(meta: dict) -> str:
    return (
        f'<a class="article-row" data-content-language="{esc(meta.get("language", "vi"))}" '
        f'href="/articles/{quote(str(meta["slug"]))}/"><div>'
        f'<span class="type">{esc(meta["topic"])}</span>'
        f'<h2>{esc(meta["title"])}</h2>'
        f'<p>{esc(meta.get("lead") or meta["description"])}</p>'
        f'</div><time datetime="{esc(meta["publishedAt"])}">'
        f'{esc(meta.get("publishedLabel", meta["publishedAt"]))}</time></a>'
    )


def copy_static() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for item in ROOT.iterdir():
        if item.name in EXCLUDED_ROOTS or item.name.startswith("."):
            continue
        target = DIST / item.name
        shutil.copytree(item, target) if item.is_dir() else shutil.copy2(item, target)


def load_articles() -> list[dict]:
    articles: list[dict] = []
    for directory in sorted(CONTENT.iterdir()):
        if not directory.is_dir():
            continue
        meta = load_json(directory / "article.json")
        meta["body"] = (directory / "content.html").read_text(encoding="utf-8")
        articles.append(meta)
    return sorted(articles, key=lambda item: (item["publishedAt"], item["slug"]), reverse=True)


def write_page(path: Path, title: str, description: str, content: str, template: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render(template, {
        "LANG": "vi",
        "TITLE": esc(title),
        "DESCRIPTION": esc(description),
        "CANONICAL": f"{BASE_URL}{path.relative_to(DIST).parent.as_posix()}/" if path.parent != DIST else BASE_URL,
        "CONTENT": content,
    }), encoding="utf-8")


def build_articles(articles: list[dict], template: str, article_template: str) -> None:
    for meta in articles:
        output = DIST / "articles" / str(meta["slug"]) / "index.html"
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(render_article(meta, meta["body"], article_template), encoding="utf-8")
    content = '<section class="page-intro"><p class="eyebrow">Articles</p><h1>Articles</h1><p class="muted">Long-form writing and ideas worth sharing.</p></section><section class="article-list" aria-label="All articles">' + "".join(render_row(a) for a in articles) + "</section>"
    write_page(DIST / "articles" / "index.html", "Articles", "Browse all published articles.", content, template)


def build_archive(articles: list[dict], template: str) -> None:
    years: dict[str, list[dict]] = defaultdict(list)
    for article in articles:
        years[str(article["publishedAt"])[:4]].append(article)
    content = '<section class="page-intro"><p class="eyebrow">Chronological</p><h1>Archive</h1><p class="muted">A timeline of published work, newest first.</p></section><section class="article-list" aria-label="Published articles">'
    for year in sorted(years, reverse=True):
        content += f'<div class="archive-year"><h2>{esc(year)}</h2></div>' + "".join(render_row(a) for a in years[year])
    content += "</section>"
    write_page(DIST / "archive" / "index.html", "Archive", "Chronological archive of everything published on this site.", content, template)


def build_topics(articles: list[dict], topics: list[dict], template: str) -> None:
    by_topic: dict[str, list[dict]] = defaultdict(list)
    for article in articles:
        by_topic[article["topic"]].append(article)
    cards = "".join(
        f'<a class="card" href="/topics/{quote(t["slug"])}/"><span class="eyebrow">{index:02d}</span><h2>{esc(t["name"])}</h2><p>{esc(t["description"])}</p></a>'
        for index, t in enumerate(topics, 1)
    )
    write_page(DIST / "topics" / "index.html", "Topics", "Browse topics and explore ideas by subject.", '<section class="page-intro"><h1>Topics</h1><p class="muted">Browse ideas and stories by subject.</p></section><div class="card-grid">' + cards + "</div>", template)
    lookup = {t["slug"]: t for t in topics}
    for slug, group in sorted(by_topic.items()):
        topic = lookup.get(slug, {"slug": slug, "name": slug, "description": ""})
        content = f'<section class="page-intro"><a class="back-link" href="/topics/">← All topics</a><p class="eyebrow">{esc(topic["name"])}</p><h1>{esc(topic["name"])}</h1><p class="muted">{esc(topic.get("description", ""))}</p></section><section class="article-list" aria-label="{esc(topic["name"])} articles">' + "".join(render_row(a) for a in group) + "</section>"
        write_page(DIST / "topics" / slug / "index.html", topic["name"], topic.get("description", ""), content, template)


def build_tags(articles: list[dict], template: str) -> None:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for article in articles:
        for tag in article.get("tags", []):
            grouped[tag].append(article)
    tag_list = "".join(f'<a class="tag" href="/tags/{quote(tag)}/">{esc(tag)} <span>{len(items):02d}</span></a>' for tag, items in sorted(grouped.items()))
    write_page(DIST / "tags" / "index.html", "Tags", "Browse published articles by tag.", '<section class="page-intro"><h1>Tags</h1><p class="muted">Small labels for connecting related ideas across topics.</p></section><div class="tag-list" aria-label="Tags">' + tag_list + "</div>", template)
    for tag, group in sorted(grouped.items()):
        content = f'<section class="page-intro"><a class="back-link" href="/tags/">← All tags</a><h1>{esc(tag)}</h1><p class="muted">Articles connected by this tag.</p></section><section class="article-list" aria-label="Articles tagged {esc(tag)}">' + "".join(render_row(a) for a in group) + "</section>"
        write_page(DIST / "tags" / tag / "index.html", f"{tag} — Tags", f"Articles tagged {tag}.", content, template)


def main() -> None:
    copy_static()
    articles = load_articles()
    template = LIST_TEMPLATE.read_text(encoding="utf-8")
    article_template = ARTICLE_TEMPLATE.read_text(encoding="utf-8")
    topics = load_json(TOPICS)
    build_articles(articles, template, article_template)
    build_archive(articles, template)
    build_topics(articles, topics, template)
    build_tags(articles, template)
    print(f"Built {len(articles)} article(s) and all content indexes into {DIST}")


if __name__ == "__main__":
    main()
