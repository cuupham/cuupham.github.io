from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "articles"
TOPICS = ROOT / "content" / "topics.json"
REQUIRED = {"slug", "title", "description", "topic", "publishedAt"}
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def main() -> None:
    errors: list[str] = []
    seen: set[str] = set()

    topics = json.loads(TOPICS.read_text(encoding="utf-8"))
    topic_slugs = {topic.get("slug") for topic in topics}
    if len(topic_slugs) != len(topics) or None in topic_slugs:
        errors.append(f"{TOPICS}: topic slugs must be unique and non-empty")

    for article_dir in sorted(CONTENT.iterdir()):
        if not article_dir.is_dir() or article_dir.name.startswith("."):
            continue

        metadata_path = article_dir / "article.json"
        body_path = article_dir / "content.html"
        if not metadata_path.exists() or not body_path.exists():
            errors.append(f"{article_dir}: requires article.json and content.html")
            continue

        try:
            data = json.loads(metadata_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{metadata_path}: invalid JSON: {exc}")
            continue

        missing = REQUIRED - data.keys()
        if missing:
            errors.append(f"{metadata_path}: missing fields: {', '.join(sorted(missing))}")
            continue

        slug = data.get("slug")
        if slug != article_dir.name:
            errors.append(f"{metadata_path}: slug must match directory name ({article_dir.name!r})")
        if not isinstance(slug, str) or not SLUG_RE.fullmatch(slug):
            errors.append(f"{metadata_path}: slug must use lowercase URL-safe kebab-case")
        if slug in seen:
            errors.append(f"duplicate slug: {slug}")
        if slug:
            seen.add(slug)

        if data.get("topic") not in topic_slugs:
            errors.append(f"{metadata_path}: unknown topic {data.get('topic')!r}")

        tags = data.get("tags", [])
        if not isinstance(tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in tags):
            errors.append(f"{metadata_path}: tags must be an array of non-empty strings")

        try:
            date.fromisoformat(str(data["publishedAt"]))
        except ValueError:
            errors.append(f"{metadata_path}: publishedAt must be ISO date YYYY-MM-DD")

        if not body_path.read_text(encoding="utf-8").strip():
            errors.append(f"{body_path}: article content is empty")

    if errors:
        raise SystemExit("\n".join(errors))

    print(f"Validated {len(seen)} data-driven article source(s)")


if __name__ == "__main__":
    main()
