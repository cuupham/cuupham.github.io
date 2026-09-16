# Content model

U.U.C separates editorial content from page presentation.

Each article lives in `content/articles/<slug>/` with `article.json` metadata and semantic `content.html` body. Topics are defined in `content/topics.json`. Articles, Archive, Topics and Tags are generated from the article registry at build time; generated HTML is deployment output, not source content.

Run locally:

```bash
python scripts/validate_content.py
python scripts/build.py
```

New editorial work belongs under `content/`; shared presentation belongs under `templates/` and `assets/`.
