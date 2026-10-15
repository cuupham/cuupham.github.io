"""Regenerate static review documents. No server or Python is needed to view them."""
from datetime import date, timedelta
from html import escape
from pathlib import Path
import json
import os
import re

ROOT = Path(__file__).resolve().parent
TITLES = [
    "Một góc nhỏ để lưu lại những điều khiến mình muốn bắt đầu sáng tạo",
    "Khi bớt đi một chút, hình ảnh lại có thêm khoảng thở",
    "A small observation about light and quiet places",
    "Ghi chép từ một buổi chiều thử những bảng màu mới",
    "Để sự tò mò dẫn đường, thay vì một danh sách việc cần làm",
    "Những chi tiết rất nhỏ mà mình thường bỏ qua",
    "Thử một cách khác để kể lại cùng một ý tưởng",
    "Một trang giấy, vài nét phác và một câu hỏi chưa có lời giải",
    "Notes on making room for unfinished ideas",
    "Lưu lại một khoảnh khắc trước khi nó trôi qua",
    "Đi chậm một chút để nhìn rõ hơn",
    "Bắt đầu từ những thứ đã có quanh mình",
    "Một ghi chép cũ hơn, nằm ở trang tiếp theo",
]
EN = {
    "notice": "Design review · Illustrative content only · Not published articles",
    "home": "Home", "list": "Collection", "language": "Interface language",
    "skip": "Skip navigation", "backtop": "Back to top", "footer": "A place for things I find interesting.",
    "eyebrow": "Notes, observations & things to share", "intro1": "A little corner.", "intro2": "Many little discoveries.",
    "intro": "Things that caught my attention, experiences worth keeping, and ideas I want to share with you.",
    "all": "All entries", "range1": "1–12 of 13 illustrative entries", "range2": "13 of 13 illustrative entries",
    "contentlang": "Content language", "vi": "Vietnamese", "en": "English", "read": "Read entry",
    "next": "Next", "prev": "Previous", "page": "Page", "back": "Back to collection",
    "toc": "In this entry", "actionhead": "Explore further", "actiondesc": "The creator’s public GitHub profile.",
    "github": "Visit GitHub", "source": "Video source", "load": "Load external video",
    "privacy": "The player contacts YouTube only after you choose to load it.",
    "sample": "Layout sample using existing approved artwork; no project or release is represented.",
    "media": "Playback sample: MDN’s flower video. No automatic playback or preloading.",
    "recent": "Recent entries", "viewall": "View the collection", "mockhome": "Home with illustrative entries",
    "fallback": "Change interface language:", "nativehint": "External video is optional; the source link works without JavaScript.",
    "about": "About CPM", "emptyhome": "Home without entries", "withposts": "With entries", "withoutposts": "Without entries",
    "compare": "Compare designs", "neutral": "Neutral", "champagne": "Champagne", "collectionlabel": "CPM / COLLECTION",
}
VI = {
    "notice": "Bản review giao diện · Nội dung minh họa · Không phải bài đã đăng",
    "home": "Trang chủ", "list": "Góc chia sẻ", "language": "Ngôn ngữ giao diện",
    "skip": "Bỏ qua điều hướng", "backtop": "Về đầu trang", "footer": "Nơi tôi chia sẻ những điều mình thấy thú vị.",
    "eyebrow": "Ghi chép, trải nghiệm & những điều muốn chia sẻ", "intro1": "Một góc nhỏ.", "intro2": "Nhiều điều thú vị.",
    "intro": "Những điều thu hút sự chú ý, những trải nghiệm muốn lưu lại và những ý tưởng tôi muốn chia sẻ với bạn.",
    "all": "Tất cả bài viết", "range1": "1–12 trong 13 bài minh họa", "range2": "13 trong 13 bài minh họa",
    "contentlang": "Ngôn ngữ bài", "vi": "Tiếng Việt", "en": "Tiếng Anh", "read": "Đọc bài viết",
    "next": "Tiếp theo", "prev": "Trang trước", "page": "Trang", "back": "Về góc chia sẻ",
    "toc": "Trong bài viết", "actionhead": "Khám phá thêm", "actiondesc": "Trang GitHub công khai của người sáng tạo.",
    "github": "Ghé GitHub", "source": "Nguồn video", "load": "Tải video bên ngoài",
    "privacy": "Trình phát chỉ kết nối tới YouTube sau khi bạn chọn tải video.",
    "sample": "Minh họa bố cục bằng artwork đã duyệt; không đại diện cho dự án hoặc bản phát hành.",
    "media": "Mẫu phát video hoa từ MDN. Không tự phát hoặc tải trước nội dung video.",
    "recent": "Những chia sẻ mới", "viewall": "Xem góc chia sẻ", "mockhome": "Home có bài minh họa",
    "fallback": "Đổi ngôn ngữ giao diện:", "nativehint": "Video nhúng là tùy chọn; liên kết nguồn hoạt động khi tắt JavaScript.",
    "about": "Về CPM", "emptyhome": "Home chưa có bài", "withposts": "Có bài", "withoutposts": "Chưa có bài",
    "compare": "So sánh giao diện", "neutral": "Trung tính", "champagne": "Champagne", "collectionlabel": "CPM / GÓC CHIA SẺ",
}
assert VI.keys() == EN.keys()


def peer(locale, filename):
    return ("en/" if locale == "vi" else "../") + filename


def head(locale, title, home=False, theme='neutral'):
    prefix = "../" if locale == "en" else ""
    styles = "".join(f'<link rel="stylesheet" href="{prefix}{f}">' for f in ["shared/tokens.css", "shared/components.css", "review.css"])
    t = VI if locale == 'vi' else EN
    variant = ('A — ' + t['neutral']) if theme == 'neutral' else ('B — ' + t['champagne'])
    return f'''<!doctype html>
<html lang="{locale}" data-theme="{theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>{variant} · {escape(title)} · CPM review</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&amp;family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,600;1,700&amp;display=swap" rel="stylesheet">
{styles}<noscript><style>.actions,[data-load-embed]{{display:none}}</style></noscript><script src="{prefix}review.js" defer></script></head><body class="{'home-review' if home else 'content-review'}" id="{'review-top' if home else 'top'}">'''


def page_folder(locale, theme):
    return Path('champagne' if theme == 'champagne' else '.') / ('en' if locale == 'en' else '.')


def comparison_links(locale, filename, theme):
    t = VI if locale == 'vi' else EN
    links = []
    for option, label in [('neutral', 'A / ' + t['neutral']), ('champagne', 'B / ' + t['champagne'])]:
        target = Path(os.path.relpath(page_folder(locale, option) / filename, page_folder(locale, theme))).as_posix()
        current = ' aria-current="page"' if option == theme else ''
        links.append(f'<a href="{target}" data-variant-link{current}>{label}</a>')
    return f'<nav class="variant-links" aria-label="{t["compare"]}">' + ''.join(links) + '</nav>'


def shell(locale, filename, active="list", theme='neutral', has_posts=True):
    t = VI if locale == "vi" else EN
    other = "en" if locale == "vi" else "vi"
    homefile = 'home-mobile.html' if has_posts else 'home-empty.html'
    listlink = f'<a href="content-list.html" {"aria-current=page" if active == "list" else ""}>{t["list"]}</a>' if has_posts else ''
    return f'''<a class="skip" href="#main">{t['skip']}</a>
<div class="review-note"><div class="shell"><span>{t['notice']}</span>{comparison_links(locale, filename, theme)}<div class="review-state"><a href="home-mobile.html">{t['withposts']}</a><span aria-hidden="true">/</span><a href="home-empty.html">{t['withoutposts']}</a><a href="{peer(locale, filename)}" data-locale-link lang="{other}" hreflang="{other}">{'English' if other == 'en' else 'Tiếng Việt'}</a></div></div></div>
<header class="header review-header"><div class="nav shell">
<a class="brand" href="{homefile}" aria-label="CPM — {t['home']}"><b>CPM</b></a>
<nav class="links" aria-label="{'Điều hướng chính' if locale == 'vi' else 'Main navigation'}"><a href="{homefile}" {'aria-current="page"' if active == 'home' else ''}>{t['home']}</a>{listlink}<a href="https://github.com/cuupham" target="_blank" rel="noopener noreferrer">GitHub</a></nav>
<div class="actions"><label class="lang"><span class="sr-only">{t['language']}</span><select aria-label="{t['language']}" data-review-locale>
<option value="vi" lang="vi" data-href="{filename if locale == 'vi' else peer(locale, filename)}" {'selected' if locale == 'vi' else ''}>Tiếng Việt</option>
<option value="en" lang="en" data-href="{filename if locale == 'en' else peer(locale, filename)}" {'selected' if locale == 'en' else ''}>English</option></select></label></div></div></header>'''


def fallback(locale, filename, anchor=""):
    t = VI if locale == "vi" else EN
    target = peer(locale, filename) + ("#" + anchor if anchor else "")
    return f'<noscript><div class="locale-fallback">{t["fallback"]} <a href="{target}" lang="{"en" if locale == "vi" else "vi"}">{"English" if locale == "vi" else "Tiếng Việt"}</a></div></noscript>'


def footer(locale):
    t = VI if locale == "vi" else EN
    return f'''<footer class="review-footer"><div class="shell"><span>CPM / Independent Digital Creator</span><nav aria-label="{'Liên kết cuối trang' if locale == 'vi' else 'Footer navigation'}"><a href="#top">{t['backtop']} ↑</a><a href="https://github.com/cuupham" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav></div></footer></body></html>'''


def language(n):
    return "en" if n in (2, 8) else "vi"


def detail_filename(n):
    return 'content-detail.html' if n == 0 else f'content-detail-sample-{n + 1}.html'


def description(n):
    return "Bắt đầu từ một quan sát nhỏ, rồi thử giữ lại cảm giác ấy bằng chữ, màu sắc và một khoảng lặng." if n == 0 else None


def metadata(locale, n):
    t = VI if locale == "vi" else EN
    d = date(2026, 10, 14) - timedelta(days=n)
    display = d.strftime("%d.%m.%Y") if locale == "vi" else d.strftime("%d %b %Y")
    return f'<div class="entry-meta" lang="{locale}"><time datetime="{d.isoformat()}">{display}</time><span>{t["contentlang"]}: {t[language(n)]}</span></div>'


def card(locale, n, image=True):
    t = VI if locale == "vi" else EN
    prefix = "../" if locale == "en" else ""
    src = f'<img class="entry-image" src="{prefix}assets/collection-observatory.png" alt="Không gian đài quan sát giả tưởng dưới bầu trời đêm" width="1536" height="1024" loading="lazy">' if n == 0 and image else ""
    desc = f'<p lang="vi">{description(n)}</p>' if description(n) else ""
    target = detail_filename(n)
    return f'''<article class="content-entry{' has-image' if src else ''}">{src}<div class="entry-copy">{metadata(locale, n)}<h3 lang="{language(n)}"><a href="{target}">{escape(TITLES[n])}</a></h3>{desc}<a class="entry-link" href="{target}" aria-label="{t['read']}: {escape(TITLES[n])}"><span>{t['read']}</span><span aria-hidden="true">↗</span></a></div></article>'''


def listing(locale, page, theme='neutral'):
    t = VI if locale == "vi" else EN
    filename = "content-list.html" if page == 1 else "content-list-page-2.html"
    cards = "\n".join(card(locale, n) for n in (range(12) if page == 1 else [12]))
    links = ''.join(f'<span aria-current="page" aria-label="{t["page"]} {i}">{i}</span>' if i == page else f'<a href="{"content-list.html" if i == 1 else "content-list-page-2.html"}" aria-label="{t["page"]} {i}">{i}</a>' for i in (1, 2))
    direction = f'<a href="content-list-page-2.html" aria-label="{t["next"]}">→</a>' if page == 1 else f'<a href="content-list.html" aria-label="{t["prev"]}">←</a>'
    return head(locale, t['list'], theme=theme) + shell(locale, filename, theme=theme) + fallback(locale, filename) + f'''<main id="main" class="listing-page"><div class="shell"><header class="page-intro"><p class="eyebrow">{t['collectionlabel']}</p><h1>{t['list']}</h1><p>{t['intro']}</p></header><div class="list-heading"><h2>{t['all']}</h2><p>{t['range1' if page == 1 else 'range2']}</p></div><div class="content-grid">{cards}</div><nav class="pagination" aria-label="{'Phân trang' if locale == 'vi' else 'Pagination'}"><span>{t['page']} {page} / 2</span><div>{links}{direction}</div></nav></div></main>''' + footer(locale)


def article(locale, n):
    t = VI if locale == "vi" else EN
    prefix = "../" if locale == "en" else ""
    anchor = f"sample-{n + 1}"
    back = "content-list-page-2.html" if n == 12 else "content-list.html"
    if language(n) == "vi":
        prose = '<p>Có những ý tưởng không bắt đầu từ một kế hoạch rõ ràng. Chúng đến từ một chi tiết nhỏ: màu của bầu trời lúc chiều muộn, một đoạn nhạc nghe tình cờ, hay cách ánh sáng dừng lại trên một mặt bàn.</p><p>Mình muốn giữ lại những quan sát ấy trước khi chúng biến mất. Chưa cần biến mọi thứ thành một sản phẩm hoàn chỉnh; đôi khi việc viết xuống đã là một cách bắt đầu.</p>'
        small_heading = "Một điểm bắt đầu vừa đủ"
    else:
        prose = '<p>Some ideas begin with a very small observation: a patch of light on the wall, a quiet street, or a colour that stays with you after the moment has passed.</p><p>I wanted to leave a little space for those unfinished thoughts. Writing them down can be enough for today.</p>'
        small_heading = "A small place to begin"
    full = n == 0
    summary = f'<p class="dek" lang="vi">{description(n)}</p>' if description(n) else ""
    cover = f'<figure><img src="{prefix}assets/collection-observatory.png" alt="Đài quan sát giả tưởng nhìn ra bầu trời đêm" width="1536" height="1024"><figcaption>{VI["sample"]}</figcaption></figure>' if full else ""
    rich = f'''<blockquote>Không phải điều gì cũng cần trở thành một sản phẩm. Có những thứ chỉ cần được giữ lại và chia sẻ.</blockquote>
<h2>Giữ lại một chút khoảng thở</h2><p>Một trang viết có thể mang nhiều hình thức. Có lúc là vài đoạn ghi chép, có lúc là hình ảnh hoặc một đoạn video. Mình thích việc để nội dung quyết định cách nó xuất hiện.</p>
<ul><li>Một ý tưởng đủ rõ để kể lại.</li><li>Một hình ảnh có lý do để xuất hiện.</li><li>Một liên kết dẫn tới nơi thực sự tồn tại.</li></ul>
<div class="gallery"><figure><img src="{prefix}assets/hero-creator.png" alt="Nhân vật nam trong artwork CPM" width="1024" height="1536" loading="lazy"><figcaption>Artwork nhân vật nam · minh họa gallery</figcaption></figure><figure><img src="{prefix}assets/hero-creator-female.png" alt="Nhân vật nữ trong artwork CPM" width="1024" height="1536" loading="lazy"><figcaption>Artwork nhân vật nữ · minh họa gallery</figcaption></figure></div>
<h2>Hình ảnh chuyển động</h2><figure><video controls preload="none" playsinline aria-label="{VI['media']}" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video><figcaption>{VI['media']} <a lang="{locale}" href="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" target="_blank" rel="noopener noreferrer">{t['source']} ↗</a></figcaption></figure>
<h2>Một khung nhìn khác</h2><div class="embed-box" lang="{locale}"><p>{t['privacy']}</p><button class="cta" type="button" data-load-embed="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ" data-frame-title="Big Buck Bunny — Blender Foundation">{t['load']}</button><p role="status" aria-live="polite"></p><p><a href="https://www.youtube.com/watch?v=aqz-KE-bpKQ" target="_blank" rel="noopener noreferrer">Big Buck Bunny · Blender Foundation ↗</a></p><noscript><p>{t['nativehint']}</p></noscript></div>
<h2>Vài dòng sau cùng</h2><p>Đây là một ghi chép minh họa bố cục, không phải thông báo phát hành. Những gì có thật sẽ được thêm vào theo nhịp riêng, khi đã có điều muốn kể.</p><pre><code>&lt;script&gt;Ví dụ HTML được hiển thị như văn bản&lt;/script&gt;</code></pre>''' if full else ""
    action = f'''<div class="article-action" lang="{locale}"><p>{t['actiondesc']}</p><a class="cta cta--secondary" href="https://github.com/cuupham" target="_blank" rel="noopener noreferrer">{t['github']} ↗</a></div>''' if full else ''
    return f'''<article class="article-view" id="{anchor}" lang="{language(n)}"><nav class="breadcrumbs" lang="{locale}" aria-label="{'Đường dẫn' if locale == 'vi' else 'Breadcrumb'}"><a href="home-mobile.html">{t['home']}</a><span aria-hidden="true">/</span><a href="{back}">{t['list']}</a></nav><header class="article-heading">{metadata(locale, n)}<h1>{escape(TITLES[n])}</h1>{summary}</header><div class="article-body">{cover}<h2>{small_heading}</h2>{prose}{rich}{action}<a class="back-to-list" href="{back}" lang="{locale}">← {t['back']}</a></div></article>'''


def detail(locale, n, theme='neutral'):
    filename = detail_filename(n)
    return head(locale, TITLES[n], theme=theme) + shell(locale, filename, active="", theme=theme) + fallback(locale, filename) + '<main id="main" class="shell">' + article(locale, n) + '</main>' + footer(locale)


def home_copy(locale):
    if locale == 'vi':
        return {
            'tagline': 'Tạo nên từ mã lệnh, khung hình và sự tò mò.',
            'desc': 'Một không gian cá nhân để tôi chia sẻ những sản phẩm, trải nghiệm và điều mình thấy thú vị.',
            'oh': 'Thấy thú vị.', 'oh2': 'Thì chia sẻ.',
            'od': 'Không cần cùng một chủ đề hay một hình thức. Đây là nơi tôi lưu lại những điều mình muốn chia sẻ, theo cách của mình.',
        }
    raw = (ROOT / 'shared/locales.js').read_text(encoding='utf-8')
    return {key: json.loads(value) for key, value in re.findall(r'(\w+):\s*("(?:[^"\\]|\\.)*")', raw)}


def home(locale, theme='neutral', has_posts=True):
    t = VI if locale == 'vi' else EN
    copy = home_copy(locale)
    prefix = '../' if locale == 'en' else ''
    filename = 'home-mobile.html' if has_posts else 'home-empty.html'
    title = t['mockhome'] if has_posts else t['emptyhome']
    target, label = ('#latest', t['recent']) if has_posts else ('#about', t['about'])
    hero = f'''<section class="hero" id="top"><div class="shell"><div class="copy"><p class="eyebrow">Independent Digital Creator</p><h1 class="title">CPM<span>Creative Signal</span></h1><p class="tagline">{copy['tagline']}</p><p class="desc">{copy['desc']}</p><div class="hero-actions"><a class="cta" href="{target}">{label}<span aria-hidden="true">↓</span></a></div></div><div class="keyart" aria-hidden="true"><img class="char male" src="{prefix}assets/hero-creator.png" alt="" width="1024" height="1536"><img class="char female" src="{prefix}assets/hero-creator-female.png" alt="" width="1024" height="1536"></div></div></section>'''
    recent = f'''<section class="recent-review" id="latest"><div class="shell"><div class="section-heading"><h2>{t['recent']}</h2><a class="quiet-link" href="content-list.html">{t['viewall']} <span aria-hidden="true">↗</span></a></div><div class="content-grid">{''.join(card(locale, n) for n in range(3))}</div></div></section>''' if has_posts else ''
    about = f'''<section class="about-review" id="about"><div class="shell"><div class="about-copy"><p class="kicker">{t['about']}</p><h2>{copy['oh']}<br>{copy['oh2']}</h2><p>{copy['od']}</p></div><figure class="about-art"><img src="{prefix}assets/collection-observatory.png" alt="" width="1536" height="1024" loading="lazy"><figcaption>CPM / PERSONAL COLLECTION</figcaption></figure></div></section>'''
    return head(locale, title, home=True, theme=theme) + shell(locale, filename, active='home', theme=theme, has_posts=has_posts) + fallback(locale, filename) + '<main id="main">' + hero + recent + about + '</main>' + footer(locale)


def shared_paths(markup, theme):
    if theme == 'neutral':
        return markup
    # Both themes share assets/styles; local page/locale links stay in their own tree.
    def rewrite(match):
        attr, target = match.groups()
        resource = target.removeprefix('../')
        if resource.startswith(('shared/', 'assets/')) or resource in ('review.css', 'review.js'):
            target = '../' + target
        return f'{attr}="{target}"'
    return re.sub(r'(href|src)="([^"]+)"', rewrite, markup)


def generate():
    for theme in ('neutral', 'champagne'):
        for locale in ('vi', 'en'):
            folder = ROOT / page_folder(locale, theme)
            folder.mkdir(parents=True, exist_ok=True)
            pages = {
                'content-list.html': listing(locale, 1, theme),
                'content-list-page-2.html': listing(locale, 2, theme),
                'home-mobile.html': home(locale, theme),
                'home-empty.html': home(locale, theme, has_posts=False),
            }
            pages.update({detail_filename(n): detail(locale, n, theme) for n in range(13)})
            for filename, markup in pages.items():
                (folder / filename).write_text(shared_paths(markup, theme) + '\n', encoding='utf-8')
            print(f'Wrote {len(pages)} pages: {theme}/{locale}')


if __name__ == '__main__':
    generate()
