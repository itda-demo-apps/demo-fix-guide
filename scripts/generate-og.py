# OG 공유 이미지 생성 (1200×630) — public/og.png. 저장소 루트에서 실행.
from PIL import Image, ImageDraw

from og_splash_common import BG, CHALK, DIM, draw_glass, load_font

W, H = 1200, 630
SS = 2

img = Image.new("RGB", (W * SS, H * SS), BG)
d = ImageDraw.Draw(img)

draw_glass(d, 950 * SS, 300 * SS, 360 * SS)
d.text((90 * SS, 170 * SS), "고장 길잡이", font=load_font(110 * SS), fill=CHALK)
sub = load_font(42 * SS)
d.text((94 * SS, 330 * SS), "현장 AS 이슈 대응 가이드", font=sub, fill=DIM)
d.text((94 * SS, 392 * SS), "증상 검색 → 원인·조치 → 해결 기록", font=sub, fill=DIM)
d.text((94 * SS, 454 * SS), "오프라인에서도 동작", font=sub, fill=DIM)

img.resize((W, H), Image.LANCZOS).save("public/og.png")
print("public/og.png")
