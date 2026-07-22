# 아이콘·OG·스플래시 공용 유틸 — 돋보기 도안 + Black Han Sans 로드
# 폰트는 구글 폰트 저장소에서 내려받아 scripts/.fonts/에 캐시(gitignore).
import urllib.request
from pathlib import Path

from PIL import ImageFont

BG = "#1E2126"
CHALK = "#F2EFE9"
DIM = "#B8B4AC"
ACCENT = "#E4574B"

FONT_URL = "https://github.com/google/fonts/raw/main/ofl/blackhansans/BlackHanSans-Regular.ttf"
FONT_CACHE = Path(__file__).parent / ".fonts" / "BlackHanSans-Regular.ttf"
FALLBACKS = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/Library/Fonts/AppleGothic.ttf",
]


def load_font(size):
    try:
        if not FONT_CACHE.exists():
            FONT_CACHE.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(FONT_URL, FONT_CACHE)
        return ImageFont.truetype(str(FONT_CACHE), size)
    except Exception:
        for p in FALLBACKS:
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
        raise RuntimeError("한글 폰트를 찾지 못했습니다")


def draw_glass(d, cx, cy, size):
    """돋보기+이슈 점 도안을 (cx, cy) 중심, 한 변 size 크기로 그린다 (favicon.svg와 동일 좌표계 100 기준)"""
    u = size / 100

    def pt(x, y):
        return (cx + (x - 50) * u, cy + (y - 50) * u)

    def xy(x, y, r):
        return [cx + (x - 50 - r) * u, cy + (y - 50 - r) * u, cx + (x - 50 + r) * u, cy + (y - 50 + r) * u]

    d.ellipse(xy(44, 44, 24), outline=CHALK, width=max(1, int(6 * u)))
    d.line([pt(62, 62), pt(80, 80)], fill=CHALK, width=max(1, int(8 * u)))
    handle_r = 4 * u
    for hx, hy in [(62, 62), (80, 80)]:  # 라운드 캡
        x, y = pt(hx, hy)
        d.ellipse([x - handle_r, y - handle_r, x + handle_r, y + handle_r], fill=CHALK)
    d.ellipse(xy(44, 44, 8), fill=ACCENT)


def draw_text_center(d, cx, cy, text, font, fill):
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    d.text((cx - (r - l) / 2 - l, cy - (b - t) / 2 - t), text, font=font, fill=fill)
