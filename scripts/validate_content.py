from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "articles"
REQUIRED = {"slug", "title", "description", "topic", "publishedAt"}


def main() -> None:
    seen: set[str] = set()
    errors: list[str] = []

    for article_dir in sorted(CONTENT.iterdir()):
        if not article_dir.is_dir():
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

        slug = data.get("slug")
        if slug != article_dir.name:
            errors.append(f"{metadata_path}: slug must match directory name ({article_dir.name!r})")
        if slug in seen:
            errors.append(f"duplicate slug: {slug}")
        if slug:
            seen.add(slug)

        if not isinstance(data.get("tags", []), list):
            errors.append(f"{metadata_path}: tags must be an array")

        if not body_path.read_text(encoding="utf-8").strip():
            errors.append(f"{body_path}: article content is empty")

    if errors:
        raise SystemExit("\n".join(errors))

    print(f"Validated {len(seen)} data-driven article source(s)")


if __name__ == "__main__":
    main()
