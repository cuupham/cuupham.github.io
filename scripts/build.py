from __future__ import annotations

import html
import json
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "_site"
CONTENT = ROOT / "content" / "articles"
TOPICS = ROOT / "content" / "topics.json"
ARTICLE_TEMPLATE = ROOT / "templates" / "article.html"
LIST_TEMPLATE = ROOT / "templates" / "list-page.html"

EXCLUDED_ROOTS = {
    ".git",
    ".github",
    "_site",
    "articles",
    "archive",
    "content",
    "scripts",
    "tags",
    "templates",
    "topics",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_template(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def escape(value: object) -> str:
    return html.escape(str(value), quote=True)


def render_tags(tags: list[str]) -> str:
    return "\n".join(
        f'        <a class="tag" href="/tags/{escape(tag)}/">{escape(tag)}</a>'
        for tag in tags
    )


def render_article_row(meta: dict) -> str:
    slug = escape(meta["slug"])
    topic = escape(meta["topic"])
    title = escape(meta["title"])
    description = escape(meta.get("lead") or meta["description"])
    date = escape(meta["publishedAt"])
    date_label = escape(meta.get("publishedLabel", meta["publishedAt"]))
    return (
        f'<a class="article-row" data-content-language="{escape(meta.get("language", "vi"))}" '
        f'href="/articles/{slug}/"><div><span class="type">{topic}</span>'
        f'<h2>{title}</h2><p>{description}</p></div>'
        f'<time datetime="{date}">{date_label}</time></a>'
    )


def render_page(template: str, *, title: str, description: str, canonical: str, content: str) -> str:
    values = {
        "LANG": "vi",
        "TITLE": escape(title),
        "DESCRIPTION": escape(description),
        "CANONICAL": canonical,
        "CONTENT": content,
    }
    output = template
    for key, value in values.items():
        output = output.replace("{{" + key + "}}", value)
    return output


def render_article(meta: dict, body: str, template: str) -> str:
    title = escape(meta["title"])
    description = escape(meta["description"])
    slug = escape(meta["slug"])
    topic = escape(meta["topic"])
    date = escape(meta["publishedAt"])
    date_label = escape(meta.get("publishedLabel", meta["publishedAt"]))
    lang = escape(meta.get("language", "vi"))
    canonical = f"https://cuupham.github.io/articles/{slug}/"
    json_ld = json.dumps(
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

    values = {
        "LANG": lang,
        "TITLE": title,
        "DESCRIPTION": description,
        "CANONICAL": canonical,
        "TOPIC": topic,
        "DATE": date,
        "DATE_LABEL": date_label,
        "TAGS": render_tags(meta.get("tags", [])),
        "CONTENT": body.strip(),
        "JSON_LD": escape(json_ld),
    }
    output = template
    for key, value in values.items():
        output = output.replace("{{" + key + "}}", value)
    return output


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


def load_articles() -> list[dict]:
    articles: list[dict] = []
    for article_dir in sorted(CONTENT.iterdir()):
        if not article_dir.is_dir():
            continue
        meta = load_json(article_dir / "article.json")
        meta["body"] = (article_dir / "content.html").read_text(encoding="utf-8")
        articles.append(meta)
    return sorted(articles, key=lambda item: (item["publishedAt"], item["slug"]), reverse=True)


def build_articles(articles: list[dict], template: str, article_template: str) -> None:
    for meta in articles:
        output_dir = DIST / "articles" / meta["slug"]
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "index.html").write_text(
            render_article(meta, meta["body"], article_template), encoding="utf-8"
        )

    content = (
        '<section class="page-intro"><p class="eyebrow">Articles</p>'
        '<h1>Articles</h1><p class="muted">Long-form writing and ideas worth sharing.</p></section>'
        '<section class="article-list" aria-label="All articles">'
        + "".join(render_article_row(meta) for meta in articles)
        + "</section>"
    )
    page = render_page(
        template,
        title="Articles",
        description="Browse all published articles.",
        canonical="https://cuupham.github.io/articles/",
        content=content,
    )
    (DIST / "articles" / "index.html").write_text(page, encoding="utf-8")


def build_archive(articles: list[dict], template: str) -> None:
    groups: dict[str, list[dict]] = defaultdict(list)
    for article in articles:
        groups[article["publishedAt"][:4]].append(article)
    sections: list[str] = []
    for year in sorted(groups, reverse=True):
        sections.append(f'<div class="archive-year"><h2>{escape(year)}</h2></div>')
        sections.extend(render_article_row(article) for article in groups[year])
    content = (
        '<section class="page-intro"><p class="eyebrow">Chronological</p>'
        '<h1>Archive</h1><p class="muted">A timeline of published work, newest first.</p></section>'
        '<section class="article-list" aria-label="Published articles">'
        + "".join(sections)
        + "</section>"
    )
    page = render_page(
        template,
        title="Archive",
        description="Chronological archive of everything published on this site.",
        canonical="https://cuupham.github.io/archive/",
        content=content,
    )
    output = DIST / "archive" / "index.html"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")


def load_topics() -> list[dict]:
    topics = load_json(TOPICS)
    return sorted(topics, key=lambda item: item["slug"])


def build_topics(articles: list[dict], topics: list[dict], template: str) -> None:
    by_topic: dict[str, list[dict]] = defaultdict(list)
    for article in articles:
        by_topic[article["topic"]].append(article)

    cards = []
    for index, topic in enumerate(topics, start=1):
        cards.append(
            f'<a class="card" href="/topics/{escape(topic["slug"])}/">'
            f'<span class="eyebrow">{index:02d}</span><h2>{escape(topic["name"])}</h2>'
            f'<p>{escape(topic["description"])}</p></a>'
        )
    content = (
        '<section class="page-intro"><h1>Topics</h1>'
        '<p class="muted">Browse ideas and stories by subject.</p></section>'
        '<div class="card-grid">' + "".join(cards) + "</div>"
    )
    page = render_page(
        template,
        title="Topics",
        description="Browse topics and explore ideas by subject.",
        canonical="https://cuupham.github.io/topics/",
        content=content,
    )
    output = DIST / "topics" / "index.html"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")

    topic_lookup = {topic["slug"]: topic for topic in topics}
    for slug, article_group in by_topic.items():
        topic = topic_lookup.get(slug, {"slug": slug, "name": slug, "description": ""})
        topic_content = (
            f'<section class="page-intro"><a class="back-link" href="/topics/">← All topics</a>'
            f'<p class="eyebrow">{escape(topic["name"])}</p><h1>{escape(topic["name"])}</h1>'
            f'<p class="muted">{escape(topic.get("description", ""))}</p></section>'
            f'<section class="article-list" aria-label="{escape(topic["name"])} articles">'
            + "".join(render_article_row(article) for article in article_group)
            + "</section>"
        )
        topic_page = render_page(
            template,
            title=topic["name"],
            description=topic.get("description", ""),
            canonical=f"https://cuupham.github.io/topics/{slug}/",
            content=topic_content,
        )
        topic_output = DIST / "topics" / slug / "index.html"
        topic_output.parent.mkdir(parents=True, exist_ok=True)
        topic_output.write_text(topic_page, encoding="utf-8")


def build_tags(articles: list[dict], template: str) -> None:
    tag_articles: dict[str, list[dict]] = defaultdict(list)
    for article in articles:
        for tag in article.get("tags", []):
            tag_articles[tag].append(article)

    tags = sorted(tag_articles, key=lambda tag: (tag.lower(), tag))
    tag_links = "".join(
        f'<a class="tag" href="/tags/{escape(tag)}/">{escape(tag)} '
        f'<span>{len(tag_articles[tag]):02d}</span></a>'
        for tag in tags
    )
    content = (
        '<section class="page-intro"><h1>Tags</h1>'
        '<p class="muted">Small labels for connecting related ideas across topics.</p></section>'
        '<div class="tag-list" aria-label="Tags">' + tag_links + "</div>"
    )
    page = render_page(
        template,
        title="Tags",
        description="Browse published articles by tag.",
        canonical="https://cuupham.github.io/tags/",
        content=content,
    )
    output = DIST / "tags" / "index.html"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")

    for tag, tagged_articles in tag_articles.items():
        tag_content = (
            f'<section class="page-intro"><a class="back-link" href="/tags/">← All tags</a>'
            f'<h1>{escape(tag)}</h1><p class="muted">Articles connected by this tag.</p></section>'
            f'<section class="article-list" aria-label="Articles tagged {escape(tag)}">'
            + "".join(render_article_row(article) for article in tagged_articles)
            + "</section>"
        )
        tag_page = render_page(
            template,
            title=f"{tag} — Tags",
            description=f"Articles tagged {tag}.",
            canonical=f"https://cuupham.github.io/tags/{tag}/",
            content=tag_content,
        )
        tag_output = DIST / "tags" / tag / "index.html"
        tag_output.parent.mkdir(parents=True, exist_ok=True)
        tag_output.write_text(tag_page, encoding="utf-8")


def main() -> None:
    copy_static_site()
    template = read_template(LIST_TEMPLATE)
    article_template = read_template(ARTICLE_TEMPLATE)
    articles = load_articles()
    topics = load_topics()
    build_articles(articles, template, article_template)
    build_archive(articles, template)
    build_topics(articles, topics, template)
    build_tags(articles, template)
    print(f"Built {len(articles)} article(s) and generated listings into {DIST}")


if __name__ == "__main__":
    main()
